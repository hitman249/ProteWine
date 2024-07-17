import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Kernels from '../kernels';
import type Snapshot from '../snapshot';
import Layer from './layer';
import _ from 'lodash';

export default class Layers extends AbstractModule {
  private index: number = 0;
  private layersDir: string;

  public readonly appFolders: AppFolders;
  public readonly fs: FileSystem;
  public readonly kernels: Kernels;
  public readonly snapshot: Snapshot;

  constructor(appFolders: AppFolders, fs: FileSystem, kernels: Kernels, snapshot: Snapshot) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.kernels = kernels;
    this.snapshot = snapshot;
  }

  public async init(): Promise<void> {
    this.layersDir = await this.appFolders.getLayersDir();
  }

  private async createLayerPath(): Promise<string> {
    const path: string = `${this.layersDir}/layer-${this.index}`;

    if (await this.fs.exists(path)) {
      this.index++;
      return this.createLayerPath();
    }

    return path;
  }

  public async create(): Promise<void> {
    await this.snapshot.createBefore();

    if (!await this.isProcessed()) {
      const path: string = await this.createLayerPath();
      const layer: Layer = new Layer(path, this);
      await layer.init();
      await layer.save();
    }
  }

  public async save(): Promise<void> {
    const layer: Layer = await this.getTmpLayer();

    if (!layer) {
      return;
    }

    await this.snapshot.createAfter();
    const layerDir: string = await this.snapshot.getLayerDir();

    if (!await this.fs.exists(layerDir)) {
      return;
    }

    if (await this.fs.exists(layer.getFolder())) {
      await this.fs.rm(layer.getFolder());
    }

    await this.fs.mv(layerDir, layer.getFolder());

    layer.set('created', true);
    await layer.save();
    await this.snapshot.clear();
  }

  public async isProcessed(): Promise<boolean> {
    const paths: string[] = await this.fs.glob(`${this.layersDir}/*`);

    for await (const path of paths) {
      const layer: Layer = new Layer(path, this);
      await layer.init();

      if (!layer.created) {
        return true;
      }
    }

    return false;
  }

  public async getList(): Promise<Layer[]> {
    const paths: string[] = await this.fs.glob(`${this.layersDir}/*`);
    const configs: Layer[] = [];

    for await (const path of paths) {
      const layer: Layer = new Layer(path, this);
      await layer.init();

      if (layer.created) {
        configs.push(layer);
      }
    }

    return _.sortBy(
      configs,
      ['sort', 'createdAt'],
    );
  }

  public async getById(id: string | number): Promise<Layer> {
    id = String(id);
    return (await this.getList()).find((item: Layer): boolean => id === item.id);
  }

  public async getTmpLayer(): Promise<Layer> {
    const paths: string[] = await this.fs.glob(`${this.layersDir}/*`);

    for await (const path of paths) {
      const layer: Layer = new Layer(path, this);
      await layer.init();

      if (!layer.created) {
        return layer;
      }
    }
  }
}