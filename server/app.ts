import type {AbstractModule} from './modules/abstract-module';
import AppFolders from './modules/app-folders';
import Command from './modules/command';
import Driver from './modules/driver';
import FileSystem from './modules/file-system';
import GlobalCache from './modules/global-cache';
import Monitor from './modules/monitor';
import Network from './modules/network';
import System from './modules/system';
import Update from './modules/update';
import Kernels from './modules/kernels';

class App {
  private readonly initOrder: AbstractModule[];

  private readonly COMMAND: Command;
  private readonly APP_FOLDERS: AppFolders;
  private readonly FILE_SYSTEM: FileSystem;
  private readonly NETWORK: Network;
  private readonly UPDATE: Update;
  private readonly CACHE: GlobalCache;
  private readonly SYSTEM: System;
  private readonly DRIVER: Driver;
  private readonly MONITOR: Monitor;
  private readonly KERNELS: Kernels;


  constructor() {
    this.COMMAND = new Command();
    this.NETWORK = new Network();
    this.APP_FOLDERS = new AppFolders();
    this.FILE_SYSTEM = new FileSystem(this.APP_FOLDERS);
    this.CACHE = new GlobalCache(this.APP_FOLDERS);
    this.SYSTEM = new System(this.APP_FOLDERS, this.CACHE);
    this.DRIVER = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    this.UPDATE = new Update(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK);
    this.MONITOR = new Monitor(this.APP_FOLDERS, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    this.KERNELS = new Kernels(this.SYSTEM);

    this.initOrder = [
      this.COMMAND,
      this.NETWORK,
      this.APP_FOLDERS,
      this.FILE_SYSTEM,
      this.UPDATE,
      this.CACHE,
      this.SYSTEM,
      this.DRIVER,
      this.MONITOR,
      this.KERNELS,
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

  public getMonitor(): Monitor {
    return this.MONITOR;
  }

  public getNetwork(): Network {
    return this.NETWORK;
  }

  public getUpdate(): Update {
    return this.UPDATE;
  }

  public getKernels(): Kernels {
    return this.KERNELS;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var $app: App;
}

global.$app = new App();

export default global.$app;