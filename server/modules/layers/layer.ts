import {AbstractModule} from '../abstract-module';
import type Layers from './index';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Kernels from '../kernels';
import type Snapshot from '../snapshot';
import Utils from '../../helpers/utils';
import _ from 'lodash';

export type LayerType = {
  created: boolean,
  createdAt: number,
  active: boolean,
  name: string,
  sort: number,
  size: number,
};

export default class Layer extends AbstractModule {
  private readonly layers: Layers;
  private readonly folder: string;
  private readonly file: string;
  private config: LayerType;

  constructor(path: string, layers: Layers) {
    super();

    this.folder = path;
    this.file = `${path}/layer.json`;
    this.layers = layers;
  }

  public async init(): Promise<void> {
    await this.load();
  }

  public get appFolders(): AppFolders {
    return this.layers.appFolders;
  }

  public get fs(): FileSystem {
    return this.layers.fs;
  }

  public get kernels(): Kernels {
    return this.layers.kernels;
  }

  public get snapshot(): Snapshot {
    return this.layers.snapshot;
  }

  public get created(): boolean {
    return this.config?.created;
  }

  public get createdAt(): number {
    return this.config?.createdAt;
  }

  public get sort(): number {
    return this.config?.sort ?? 500;
  }

  public get id(): string {
    return String(this.createdAt);
  }

  public set(path: keyof LayerType, value: any): void {
    _.set(this.config, path, value);
  }

  public getFolder(): string {
    return this.folder;
  }

  private async getDefaultLayer(): Promise<LayerType> {
    return {
      created: false,
      createdAt: new Date().getTime(),
      active: true,
      name: this.fs.basename(this.folder),
      sort: 500,
      size: 0,
    };
  }

  public async load(): Promise<void> {
    if (!this.config) {
      if (await this.fs.exists(this.file)) {
        this.config = Utils.jsonDecode(await this.fs.fileGetContents(this.file));
      }
    }

    if (!this.config) {
      this.config = await this.getDefaultLayer();
    }
  }

  public async save(): Promise<void> {
    if (!await this.fs.exists(this.folder)) {
      await this.fs.mkdir(this.folder);
    }

    if (!this.config) {
      await this.load();
    }

    return this.fs.filePutContents(this.file, Utils.jsonEncode(this.config));
  }
}