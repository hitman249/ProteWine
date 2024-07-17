import {AbstractModule} from '../abstract-module';
import _ from 'lodash';
import Layer from './layer';
import {RoutesTaskEvent} from '../../routes/routes';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Kernels from '../kernels';
import type {Kernel} from '../kernels';
import type Snapshot from '../snapshot';
import type Command from '../command';
import type {Options} from '../../helpers/copy-dir';

export default class Layers extends AbstractModule {
  private index: number = 0;
  private layersDir: string;

  public readonly appFolders: AppFolders;
  public readonly fs: FileSystem;
  public readonly kernels: Kernels;
  public readonly snapshot: Snapshot;
  public readonly command: Command;

  constructor(appFolders: AppFolders, fs: FileSystem, kernels: Kernels, snapshot: Snapshot, command: Command) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.kernels = kernels;
    this.snapshot = snapshot;
    this.command = command;
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

  private async unpack(path: string, driveC: string): Promise<boolean> {
    if (!await this.fs.exists(path)) {
      return false;
    }

    await this.command.exec(`tar -h -xzf "${path}" -C "${driveC}"`);

    return true;
  }

  public async install(): Promise<void> {
    const layers: Layer[] = ((await this.getList()) || []).filter((layer: Layer) => layer.active);

    if (!layers || 0 === layers.length) {
      return;
    }

    const kernel: Kernel = this.kernels.getKernel();

    if (!await this.fs.exists(await kernel.getPrefixDir())) {
      return;
    }

    const driveC: string = await kernel.getDriveCDir();
    const username: string = await kernel.getUserName();
    const userDefault: string = `${driveC}/users/default`;
    const userCurrent: string = `${driveC}/users/${username}`;
    const overwrite: Options = {overwrite: true};

    for await (const layer of layers) {
      const file: string = await layer.getFilesArchive();

      if (await this.fs.exists(file)) {
        await this.unpack(file, driveC);

        if ('default' !== username && await this.fs.exists(userDefault)) {
          await this.fs.mv(userDefault, userCurrent, overwrite);
        }
      }
    }
  }

  public async getRegistry(): Promise<string[]> {
    const layers: Layer[] = ((await this.getList()) || []).filter((layer: Layer) => layer.active);

    if (!layers || 0 === layers.length) {
      return [];
    }

    const register: string[] = [];
    const skip: string[] = ['Windows Registry Editor Version 5.00', 'REGEDIT4'];

    for await (const layer of layers) {
      for await (const path of await layer.getRegistryFiles()) {
        const plainText: string[] = (await this.fs.fileGetContents(path, true)).split('\n');

        if (skip.indexOf(_.head(plainText)) !== -1) {
          plainText.shift();
        }

        register.push(...plainText);
      }
    }

    return register;
  }
}