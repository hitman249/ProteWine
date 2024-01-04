import type {AbstractModule} from './modules/abstract-module';
import AppFolders from './modules/app-folders';
import Command from './modules/command';
import FileSystem from './modules/file-system';
import GlobalCache from './modules/global-cache';
import System from './modules/system';
import Driver from './modules/driver';

class App {
  private readonly initOrder: AbstractModule[];

  private readonly COMMAND: Command;
  private readonly APP_FOLDERS: AppFolders;
  private readonly FILE_SYSTEM: FileSystem;
  private readonly CACHE: GlobalCache;
  private readonly SYSTEM: System;
  private readonly DRIVER: Driver;


  constructor() {
    this.COMMAND = new Command();
    this.APP_FOLDERS = new AppFolders();
    this.FILE_SYSTEM = new FileSystem(this.APP_FOLDERS);
    this.CACHE = new GlobalCache(this.APP_FOLDERS);
    this.SYSTEM = new System(this.APP_FOLDERS, this.CACHE);
    this.DRIVER = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);

    this.initOrder = [
      this.COMMAND,
      this.APP_FOLDERS,
      this.FILE_SYSTEM,
      this.CACHE,
      this.SYSTEM,
    ];
  }

  public async init(): Promise<any> {
    for await (const module of this.initOrder) {
      await module.init();
    }
  }

  public getCommand(): Command {
    return this.COMMAND;
  }

  public getAppFolders(): AppFolders {
    return this.APP_FOLDERS;
  }

  public getFileSystem(): FileSystem {
    return this.FILE_SYSTEM;
  }

  public getCache(): GlobalCache {
    return this.CACHE;
  }

  public getSystem(): System {
    return this.SYSTEM;
  }

  public getDriver(): Driver {
    return this.DRIVER;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var $app: App;
}

global.$app = new App();

export default global.$app;