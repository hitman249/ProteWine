import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Command from '../command';
import type System from '../system';

export default class SteamRuntimeSniper {
  private url: string = 'steam://install/1628350';
  private version: string = 'Debian 11';

  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly system: System;
  private readonly command: Command;

  constructor(appFolders: AppFolders, fs: FileSystem, system: System, command: Command) {
    this.appFolders = appFolders;
    this.fs = fs;
    this.system = system;
    this.command = command;
  }

  public async init(): Promise<any> {
    if (!await this.exists()) {
      await this.install();
    }
  }

  public getName(): string {
    return 'sniper';
  }

  public async getPath(): Promise<string> {
    return `${await this.system.getHomeDir()}/.steam/steam/steamapps/common/SteamLinuxRuntime_sniper`;
  }

  public async exists(): Promise<boolean> {
    return this.fs.exists(await this.getPath());
  }

  public async install(): Promise<void> {
    if ((await this.exists()) || !(await this.system.existsCommand('steam'))) {
      return Promise.resolve();
    }

    this.command.exec(`steam ${this.url} &`);

    return Promise.resolve();
  }

  public async getCmd(cmd: string): Promise<string> {
    return `"${await this.getPath()}/run" -- ${cmd}`;
  }
}