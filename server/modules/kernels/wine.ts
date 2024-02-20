import AbstractKernel, {KernelEvent} from './abstract-kernel';
import System from '../system';
import WatchProcess, {WatchProcessEvent} from '../../helpers/watch-process';

export default class Wine extends AbstractKernel {
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
      WINEDEBUG: '-all',
      WINEARCH: 'win64',
      WINEPREFIX: prefix,
      LC_ALL: await this.command.getLocale(),
    };
  }

  private async getWineFile(): Promise<string> {
    const wineDir: string = await this.appFolders.getWineDir();

    const wineFiles: string[] = [
      `${wineDir}/bin/wine`,
      `${wineDir}/bin/wine64`,
      `${wineDir}/files/bin/wine`,
      `${wineDir}/files/bin/wine64`,
    ];

    for await (const path of wineFiles) {
      if (await this.fs.exists(path)) {
        return path;
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
    const wineFile: string = await this.getWineFile();

    if (!wineFile) {
      return Promise.reject('Wine not found.');
    }

    const container: string = await this.container.getCmd(this.envToCmd(`"${wineFile}" ${cmd}`, this.env));

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

    const process: WatchProcess = await this.run('--version', 'runinprefix');
    await process.wait();

    const version: string = (await process.text()).trim();

    if (version) {
      this.kernelVersion = version;
      return version;
    }
  }

  public async getUserName(): Promise<string> {
    return this.system.getUserName();
  }
}