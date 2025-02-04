import AbstractKernel, {SessionType} from './abstract-kernel';
import type System from '../system';
import type WatchProcess from '../../helpers/watch-process';
import type {App} from '../../app';
import type Environment from './environment';
import Network from '../network';

export default class Proton extends AbstractKernel {
  protected innerPrefix: string = '/pfx';
  private steamDirs: string[] = [
    '/.steam',
    '/.local/share/Steam',
  ];

  private env: Environment;

  constructor(path: string, system: System, app: App) {
    super(path, system, app);
  }

  public async init(): Promise<any> {
    await super.init();

    if (this.env) {
      return;
    }

    this.env = await this.app.createEnv();
    this.env.set('STEAM_COMPAT_CLIENT_INSTALL_PATH', await this.getSteamDir());
    await this.env.fixDriver();
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

    return this.run('getcompatpath ""', SessionType.PROTON, {WINEDEBUG: 'fixme-all'});
  }

  public async getCmd(cmd: string = '', session: SessionType = SessionType.RUN, env: {[field: string]: string} = {}): Promise<string> {
    const proton: string = await this.appFolders.getProtonFile();
    return await this.container.getCmd(this.envToCmd(`"${proton}" ${session} ${this.getLaunchMethod(cmd)} ${cmd}`, Object.assign({}, this.env.toObject(), env)));
  }

  public async run(cmd: string = '', session: SessionType = SessionType.RUN, env: {[field: string]: string} = {}): Promise<WatchProcess> {
    return this.commandHandler(await this.getCmd(cmd, session, env));
  }

  public async winetricks(cmd: string): Promise<WatchProcess> {
    const wineDir: string = await this.findWineDir();
    const prefix: string = await this.appFolders.getPrefixDir();
    const wineTricks: string = await this.appFolders.getWineTricksFile();

    const network: Network = this.app.getNetwork();
    const isBlockedRegion: boolean = await network.isBlockedRegion();
    const torify: string = (isBlockedRegion && await network.isTorify()) ? '--torify' : '';

    const env: Environment = await this.app.createEnv();
    env.addPath(`${wineDir}/bin`);
    env.set('WINEPREFIX', `${prefix}/pfx`);
    env.set('WINESERVER', `${wineDir}/bin/wineserver`);

    const container: string = await this.container.getCmd(this.envToCmd(`"${wineTricks}" ${torify} ${cmd}`, env.toObject()));

    return this.commandHandler(container);
  }

  public async kill(): Promise<void> {
    await this.process?.kill();
  }

  public async register(path: string): Promise<WatchProcess> {
    return await this.run(`regedit "${path}"`, SessionType.RUN_IN_PREFIX);
  }

  public async exportRegistry(path: string): Promise<WatchProcess> {
    return await this.run(`regedit /E "${path}"`, SessionType.RUN_IN_PREFIX);
  }

  public async regsvr32(filename: string): Promise<WatchProcess> {
    return await this.run(`regsvr32 "${filename}"`, SessionType.RUN_IN_PREFIX);
  }

  public async version(): Promise<string> {
    if (this.kernelVersion) {
      return this.kernelVersion;
    }

    const wineDir: string = await this.appFolders.getWineDir();
    const versionFile: string = `${wineDir}/version`;
    const runnerFile: string = `${wineDir}/runner`;

    if (await this.fs.exists(runnerFile)) {
      return await this.fs.fileGetContents(runnerFile);
    }

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

    const process: WatchProcess = await this.run('--version', SessionType.RUN_IN_PREFIX);
    await process.wait();

    const version: string = (await process.text()).trim();

    if (version) {
      this.kernelVersion = version;
      return version;
    }
  }

  public async getUserName(): Promise<string> {
    return 'steamuser';
  }

  public async findWineDir(): Promise<string> {
    let wineDir: string = await this.appFolders.getWineDir();

    for (let name of ['wine', 'wine64']) {
      let path: string = `${wineDir}/bin/${name}`;

      if ((await this.fs.exists(path)) && (await this.fs.isFile(path))) {
        return wineDir;
      }

      for await (let path of await this.fs.glob(`${wineDir}/*`)) {

        let find: string = `${path}/bin/${name}`;

        if ((await this.fs.exists(find)) && (await this.fs.isFile(find))) {
          return path;
        }

        for await (let subPath of await this.fs.glob(`${path}/*`)) {

          let find: string = `${subPath}/bin/${name}`;

          if ((await this.fs.exists(find)) && (await this.fs.isFile(find))) {
            return subPath;
          }
        }
      }
    }

    return wineDir;
  }
}