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
}