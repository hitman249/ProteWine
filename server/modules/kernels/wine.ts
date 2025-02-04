import AbstractKernel, {KernelEvent, SessionType} from './abstract-kernel';
import type System from '../system';
import type WatchProcess from '../../helpers/watch-process';
import type {App} from '../../app';
import type Environment from './environment';
import Network from '../network';

export default class Wine extends AbstractKernel {
  private env: Environment;
  protected innerPrefix: string = '';

  constructor(path: string, system: System, app: App) {
    super(path, system, app);
  }

  public async init(): Promise<any> {
    await super.init();

    if (this.env) {
      return;
    }

    this.env = await this.app.createEnv();
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

    return this.run('sc', SessionType.RUN, {WINEDEBUG: 'fixme-all'});
  }

  public async getCmd(cmd: string = '', session: SessionType = SessionType.RUN, env: {[field: string]: string} = {}): Promise<string> {
    const wineFile: string = await this.getWineFile();

    if (!wineFile) {
      this.fireEvent(KernelEvent.ERROR, 'Wine not found.');
      return Promise.reject('Wine not found.');
    }

    return await this.container.getCmd(this.envToCmd(`"${wineFile}" ${this.getLaunchMethod(cmd)} ${cmd}`, Object.assign({}, this.env.toObject(), env)));
  }

  public async run(cmd: string = '', session: SessionType = SessionType.RUN, env: {[field: string]: string} = {}): Promise<WatchProcess> {
    return this.commandHandler(await this.getCmd(cmd, session, env));
  }

  public async winetricks(cmd: string): Promise<WatchProcess> {
    const wineDir: string = await this.findWineDir();
    const wineTricks: string = await this.appFolders.getWineTricksFile();

    const network: Network = this.app.getNetwork();
    const isBlockedRegion: boolean = await network.isBlockedRegion();
    const torify: string = (isBlockedRegion && await network.isTorify()) ? '--torify' : '';

    const env: Environment = await this.app.createEnv();
    env.addPath(`${wineDir}/bin`);
    env.set('WINESERVER', `${wineDir}/bin/wineserver`);
    await this.env.fixDriver();

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
    const runnerFile: string = `${wineDir}/runner`;

    if (await this.fs.exists(runnerFile)) {
      return await this.fs.fileGetContents(runnerFile);
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
    return this.system.getUserName();
  }

  public async findWineDir(): Promise<string> {
    return this.appFolders.getWineDir();
  }
}