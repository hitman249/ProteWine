import AbstractKernel, {KernelEvent} from './abstract-kernel';
import System from '../system';
import WatchProcess, {WatchProcessEvent} from '../../helpers/watch-process';

export default class Proton extends AbstractKernel {
  private steamDirs: string[] = [
    '/.steam',
    '/.local/share/Steam',
  ];

  private env: {[env: string]: string};

  constructor(path: string, system: System) {
    super(path, system);
  }

  public async init(): Promise<any> {
    await super.init();

    if (this.env) {
      return;
    }

    const prefix: string = await this.appFolders.getPrefixDir();

    this.env = {
      // SteamAppId: '',
      // SteamGameId: '',
      WINEPREFIX: prefix,
      STEAM_COMPAT_DATA_PATH: prefix,
      STEAM_COMPAT_CLIENT_INSTALL_PATH: await this.getSteamDir(),
      LC_ALL: await this.command.getLocale(),
    };
  }

  private async getSteamDir(): Promise<string> {
    const homeDir: string = await this.system.getHomeDir();

    for await (const path of this.steamDirs) {
      const steamDir: string = `${homeDir}${path}`;

      if (await this.fs.exists(steamDir)) {
        return steamDir;
      }
    }
  }

  public async createPrefix(): Promise<WatchProcess> {
    const prefix: string = await this.appFolders.getPrefixDir();

    if (!(await this.fs.exists(prefix))) {
      await this.fs.mkdir(prefix);
    }

    return this.run('sc');
  }

  public async run(cmd: string = '', session: string = 'run'): Promise<WatchProcess> {
    const proton: string = await this.appFolders.getProtonFile();
    const container: string = await this.container.getCmd(this.envToCmd(`"${proton}" ${session} ${cmd}`, this.env));

    this.fireEvent(KernelEvent.RUN, container);

    this.process = await this.command.watch(container);

    this.process.on(WatchProcessEvent.STDERR, (event: WatchProcessEvent.STDERR, line: string) => {
      this.fireEvent(KernelEvent.LOG, line);
    });

    this.process.on(WatchProcessEvent.STDOUT, (event: WatchProcessEvent.STDOUT, line: string) => {
      this.fireEvent(KernelEvent.LOG, line);
    });

    this.process.wait().finally(() => {
      this.fireEvent(KernelEvent.EXIT);
    });

    return this.process;
  }

  public async kill(): Promise<void> {
    this.process?.kill();
  }

  public async register(path: string): Promise<WatchProcess> {
    return await this.run(`regedit "${path}"`, 'runinprefix');
  }

  public async regsvr32(filename: string): Promise<WatchProcess> {
    return await this.run(`regsvr32 "${filename}"`, 'runinprefix');
  }

  public async version(): Promise<string> {
    if (this.kernelVersion) {
      return this.kernelVersion;
    }

    const wineDir: string = await this.appFolders.getWineDir();
    const versionFile: string = `${wineDir}/version`;

    if (await this.fs.exists(versionFile)) {
      const version: string = await this.fs.fileGetContents(versionFile);

      if (version) {
        const versionChunks: string[] = version.trim().split(' ');

        if (versionChunks[1]) {
          this.kernelVersion = 'Proton ' + versionChunks[1];
          return this.kernelVersion;
        }

        if (versionChunks[0]) {
          this.kernelVersion = versionChunks[0];
          return this.kernelVersion;
        }
      }
    }

    const process: WatchProcess = await this.run('--version', 'runinprefix');
    await process.wait();

    const version: string = (await process.text()).trim();

    if (version) {
      this.kernelVersion = version;
      return version;
    }
  }
}