import {AbstractModule} from '../abstract-module';
import Utils from '../../helpers/utils';
import Layer from './layer';
import type System from '../system';
import type FileSystem from '../file-system';
import type Layers from './index';

export default class Database extends AbstractModule {
  private readonly repository: string = '/.local/share/ProteWine/layers';
  private path: string;

  private readonly fs: FileSystem;
  private readonly system: System;
  private readonly layers: Layers;

  constructor(fs: FileSystem, system: System, layers: Layers) {
    super();

    this.fs = fs;
    this.system = system;
    this.layers = layers;
  }

  public async init(): Promise<any> {
    const homeDir: string = await this.system.getHomeDir();
    this.path = `${homeDir}${this.repository}`;

    if (!await this.fs.exists(this.path)) {
      await this.fs.mkdir(this.path);
    }
  }

  public async getById(id: string): Promise<Layer> {
    return (await this.getList()).find((item: Layer): boolean => id === item.id);
  }

  public async getList(): Promise<Layer[]> {
    const paths: string[] = Utils.natsort(await this.fs.glob(`${this.path}/*`));
    const layers: Layer[] = [];

    for await (const path of paths) {
      const layer: Layer = new Layer(path, this.layers);
      await layer.init();

      layers.push(layer);
    }

    return layers;
  }

  public async exist(layer: Layer): Promise<boolean> {
    const layers: Layer[] = await this.getList();

    for (const item of layers) {
      if (item.getDirname() === layer.getDirname()) {
        return true;
      }
    }

    return false;
  }

  public async addLayer(layer: Layer): Promise<void> {
    if (await this.exist(layer)) {
      return;
    }
    const path: string = `${this.path}/${layer.getDirname()}`;
    await this.fs.cp(layer.getFolder(), path);

    if (!layer.active) {
      const item: Layer = new Layer(path, this.layers);
      await item.init();
      item.set('active', true);
      await item.save();
    }
  }

  public async removeLayer(layer: Layer): Promise<void> {
    const layers: Layer[] = await this.getList();

    for await (const item of layers) {
      if (item.getDirname() === layer.getDirname()) {
        return await item.remove();
      }
    }
  }
}