import SteamRuntimeSniper from './steam-runtime-sniper';
import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type System from '../system';
import type Command from '../command';
import type WatchProcess from '../../helpers/watch-process';

export default class Container extends AbstractModule {
  private instance: SteamRuntimeSniper;

  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly system: System;
  private readonly command: Command;

  constructor(appFolders: AppFolders, fs: FileSystem, system: System, command: Command) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.system = system;
    this.command = command;
  }

  public async init(): Promise<any> {
    this.instance = new SteamRuntimeSniper(this.appFolders, this.fs, this.system, this.command);
  }

  public async install(): Promise<void> {
    return this.instance.install();
  }

  public async getCmd(cmd: string): Promise<string> {
    return this.instance.getCmd(cmd);
  }

  public async run(cmd: string = ''): Promise<WatchProcess> {
    return this.instance.run(cmd);
  }
}