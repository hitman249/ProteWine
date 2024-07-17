import {AbstractModule} from '../abstract-module';
import _ from 'lodash';
import Layer from './layer';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Kernels from '../kernels';
import type Snapshot from '../snapshot';
import {RoutesTaskEvent} from '../../routes/routes';

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
    this.fireEvent(RoutesTaskEvent.RUN, 'Start creating snapshot prefix.');
    this.fireEvent(RoutesTaskEvent.LOG, 'Creating snapshot prefix. Step: before prefix changes.');

    await this.snapshot.createBefore();

    if (!await this.isProcessed()) {
      const path: string = await this.createLayerPath();
      const layer: Layer = new Layer(path, this);
      await layer.init();
      await layer.save();
    }

    this.fireEvent(RoutesTaskEvent.LOG, 'Snapshot "before" created successfully.');
    this.fireEvent(RoutesTaskEvent.EXIT);
  }

  public async makeLayer(): Promise<void> {
    this.fireEvent(RoutesTaskEvent.RUN, 'Start creating layer.');

    const layer: Layer = await this.getTmpLayer();

    if (!layer) {
      this.fireEvent(RoutesTaskEvent.LOG, 'Error. Session not started.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    this.fireEvent(RoutesTaskEvent.LOG, 'Creating snapshot prefix. Step: after prefix changes.');

    await this.snapshot.createAfter();
    const layerDir: string = await this.snapshot.getLayerDir();

    if (!await this.fs.exists(layerDir)) {
      this.fireEvent(RoutesTaskEvent.LOG, 'The snapshot creation failed.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    this.fireEvent(RoutesTaskEvent.LOG, 'Snapshot "after" created successfully.');

    if (await this.fs.exists(layer.getFolder())) {
      await this.fs.rm(layer.getFolder());
    }

    await this.fs.mv(layerDir, layer.getFolder());

    layer.set('created', true);
    layer.set('size', await this.fs.size(layer.getFolder()));

    await layer.save();
    await this.snapshot.clear();

    this.fireEvent(RoutesTaskEvent.LOG, 'Layer created successfully.');
    this.fireEvent(RoutesTaskEvent.EXIT);
  }

  public async cancel(): Promise<void> {
    await this.snapshot.clear();
    const layer: Layer = await this.getTmpLayer();

    if (layer) {
      await layer.remove();
    }
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

  public async getById(id: string): Promise<Layer> {
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