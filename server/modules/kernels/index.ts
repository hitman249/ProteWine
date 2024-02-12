import {AbstractModule} from '../abstract-module';
import type AbstractKernel from './abstract-kernel';
import Proton from './proton';
import Wine from './wine';
import System from '../system';
import type FileSystem from '../file-system';
import type Command from '../command';
import type GlobalCache from '../global-cache';
import type AppFolders from '../app-folders';

export default class Kernels extends AbstractModule {
  protected system: System;
  protected fs: FileSystem;
  protected command: Command;
  protected cache: GlobalCache;
  protected appFolders: AppFolders;

  private kernel: AbstractKernel;

  constructor(system: System) {
    super();

    this.system = system;
    this.fs = system.fs;
    this.command = system.command;
    this.cache = system.cache;
    this.appFolders = system.appFolders;
  }

  public async init(): Promise<any> {
    const path: string = await this.appFolders.getWineDir();

    if (this.kernel) {
      delete this.kernel;
    }

    if (await this.fs.exists(`${path}/proton`)) {
      this.kernel = new Proton(path, this.system);
    } else {
      this.kernel = new Wine(path, this.system);
    }

    await this.kernel.init();
  }

  public getKernel(): Proton | Wine {
    return this.kernel as Proton | Wine;
  }
}