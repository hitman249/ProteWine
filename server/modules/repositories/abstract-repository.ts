import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Network from '../network';
import type System from '../system';
import type {ItemType} from './index';

export default abstract class AbstractRepository extends AbstractModule {
  protected abstract readonly name: string;

  protected readonly appFolders: AppFolders;
  protected readonly fs: FileSystem;
  protected readonly network: Network;
  protected readonly system: System;

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network, system: System) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.network = network;
    this.system = system;
  }

  public getName(): string {
    return this.name;
  }

  public abstract getList(): Promise<ItemType[]>;
}