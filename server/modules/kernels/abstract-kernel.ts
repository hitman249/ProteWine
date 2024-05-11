import type System from '../system';
import type FileSystem from '../file-system';
import type Command from '../command';
import type GlobalCache from '../global-cache';
import type AppFolders from '../app-folders';
import type WatchProcess from '../../helpers/watch-process';
import EventListener from '../../helpers/event-listener';
import Container from '../container';
import Memory from '../../helpers/memory';

export enum KernelEvent {
  LOG = 'log',
  RUN = 'run',
  EXIT = 'exit',
  ERROR = 'error',
}

export enum KernelOperation {
  RUN = 'run',
  INSTALL = 'install',
  REGISTER = 'regedit',
  LIBRARY = 'regsvr32',
}

export enum FileType {
  EXE = 'exe',
  MSI = 'msi',
  BAT = 'bat',
}

export enum SessionType {
  RUN = 'run',
  RUN_IN_PREFIX = 'runinprefix',
}

export type PathsType = {
  dosDevices: string,
  system32: string,
  system64: string,
  logs: string,
  dxvk: string,
  info: string,
  cache: string,
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
  protected process: WatchProcess;
  protected container: Container;

  protected abstract innerPrefix: string;

  protected paths: PathsType = {
    dosDevices: '/dosdevices',
    system64: '/drive_c/windows/system32',
    system32: '/drive_c/windows/syswow64',
    logs: '/drive_c/logs',
    dxvk: '/drive_c/dxvk.conf',
    info: '/drive_c/info',
    cache: '/drive_c/cache',
  };

  constructor(path: string, system: System) {
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

    this.container = new Container(this.appFolders, this.fs, this.system, this.command);
  }

  public async init(): Promise<any> {
    return this.container.init();
  }

  protected envToCmd(cmd: string, env: {[field: string]: string} = {}): string {
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

  public async getSystem32Dir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.system32}`;
  }

  public async getSystem64Dir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.system64}`;
  }

  public async getCacheDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.cache}`;
  }

  public async getInfoDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.info}`;
  }

  public async getLogsDir(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.logs}`;
  }

  public async getDxvkFile(): Promise<string> {
    return `${await this.getPrefixDir()}${this.paths.dxvk}`;
  }
}