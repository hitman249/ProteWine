import type System from '../system';
import type FileSystem from '../file-system';
import type Command from '../command';
import type GlobalCache from '../global-cache';
import type AppFolders from '../app-folders';
import WatchProcess, {WatchProcessEvent} from '../../helpers/watch-process';
import EventListener from '../../helpers/event-listener';
import Container from '../container';
import Memory from '../../helpers/memory';
import Utils from '../../helpers/utils';
import type {App} from '../../app';

export enum KernelEvent {
  LOG = 'log',
  RUN = 'run',
  EXIT = 'exit',
  ERROR = 'error',
}

export enum KernelOperation {
  RUN = 'run',
  INSTALL = 'install',
  WINETRICKS = 'winetricks',
  CREATE_PREFIX = 'create-prefix',
  REGISTER = 'regedit',
  LIBRARY = 'regsvr32',
}

export enum FileType {
  EXE = 'exe',
  MSI = 'msi',
  BAT = 'bat',
}

export enum SessionType {
  PROTON = '',
  RUN = 'run',
  RUN_IN_PREFIX = 'runinprefix',
}

export type PathsType = {
  dosDevices: string,
  driveC: string,
  system32: string,
  system64: string,
  logs: string,
  dxvk: string,
  metadata: string,
  cache: string,
  iso: string,
  install: string,
  games: string,
}

export default abstract class AbstractKernel extends EventListener {
  private readonly memory: Memory = new Memory();
  protected declare kernelVersion: string;

  protected path: string;
  protected system: System;
  protected fs: FileSystem;
  protected command: Command;
  protected cache: GlobalCache;
  protected appFolders: AppFolders;
  protected app: App;
  protected process: WatchProcess;
  protected container: Container;

  protected abstract innerPrefix: string;

  protected paths: PathsType = {
    dosDevices: '/dosdevices',
    driveC: '/drive_c',
    system64: '/drive_c/windows/system32',
    system32: '/drive_c/windows/syswow64',
    logs: '/drive_c/logs',
    dxvk: '/drive_c/dxvk.conf',
    metadata: '/drive_c/metadata',
    cache: '/drive_c/cache',
    iso: '/drive_c/cache/iso',
    install: '/drive_c/cache/install',
    games: '/drive_c/Games',
  };

  constructor(path: string, system: System, app: App) {
    super();

    this.memory
      .setContext(this)
      .declareVariables(
        'kernelVersion',
      );

    this.path = path;
    this.system = system;
    this.fs = system.fs;
    this.command = system.command;
    this.cache = system.cache;
    this.appFolders = system.appFolders;
    this.app = app;

    this.container = new Container(this.appFolders, this.fs, this.system, this.command);
  }

  public async init(): Promise<any> {
    return this.container.init();
  }

  public getContainer(): Container {
    return this.container;
  }

  protected async commandHandler(cmd: string): Promise<WatchProcess> {
    this.fireEvent(KernelEvent.RUN, cmd);

    this.process = await this.command.watch(cmd);

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

  protected envToCmd(cmd: string, env: {[field: string]: string | number} = {}): string {
    const lines: string[] = Object.keys(env).map((field: string): string => `${field}="${env[field]}"`);

    if (lines.length > 0) {
      return `env ${lines.join(' ')} ${cmd}`;
    }

    return cmd;
  }

  public getLauncherByFileType(type?: FileType): string {
    if (!type) {
      return '';
    }

    switch (type) {
      case FileType.EXE:
        return 'start /unix';
      case FileType.BAT:
        return 'cmd /c';
      case FileType.MSI:
        return 'msiexec /i';
      default:
        return '';
    }
  }

  public abstract createPrefix(): Promise<WatchProcess>;

  public async deletePrefix(): Promise<void> {
    const prefixDir: string = await this.appFolders.getPrefixDir();

    if (await this.fs.exists(prefixDir)) {
      await this.fs.rm(prefixDir);
    }
  }

  public abstract kill(): Promise<void>;

  public abstract register(path: string): Promise<WatchProcess>;

  public abstract regsvr32(filename: string): Promise<WatchProcess>;

  public abstract version(): Promise<string>;

  public abstract run(cmd: string): Promise<WatchProcess>;

  public abstract getUserName(): Promise<string>;

  public async getPrefixDir(): Promise<string> {
    const prefixDir: string = await this.appFolders.getPrefixDir();
    return `${prefixDir}${this.innerPrefix}`;
  }

  public async getDosDevicesDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.dosDevices}`;
  }

  public async getDriveCDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.driveC}`;
  }

  public async getGamesDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.games}`;
  }

  public async getSystem32Dir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.system32}`;
  }

  public async getSystem64Dir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.system64}`;
  }

  public async getCacheDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.cache}`;
  }

  public async getIsoDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.iso}`;
  }

  public async getInstallDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.install}`;
  }

  public async getMetadataDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.metadata}`;
  }

  public async getLogsDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.logs}`;
  }

  public async getDxvkFile(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.dxvk}`;
  }

  public async setMetadata(field: string, value: string | boolean | number): Promise<void> {
    const path: string = await this.getMetadataDir();

    if (!await this.fs.exists(path)) {
      await this.fs.mkdir(path);
    }

    await this.fs.filePutContents(`${path}/${field}`, Utils.jsonEncode(value));
  }

  public async getMetadata(field: string): Promise<string | boolean | number | undefined> {
    const path: string = `${await this.getMetadataDir()}/${field}`;

    if (await this.fs.exists(path)) {
      return Utils.jsonDecode(await this.fs.fileGetContents(path));
    }
  }

  public async existDir(): Promise<boolean> {
    return await this.fs.exists(await this.appFolders.getWineDir());
  }
}