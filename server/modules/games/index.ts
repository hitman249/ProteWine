import _ from 'lodash';
import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import type Network from '../network';
import type Monitor from '../monitor';
import type Tasks from '../tasks';
import type WatchProcess from '../../helpers/watch-process';
import type {ImageType} from '../gallery';
import Config, {type ConfigType} from './config';
import Resizer from '../../helpers/resizer';
import {KernelOperation} from '../kernels/abstract-kernel';

export default class Games extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly settings: Settings;
  private readonly network: Network;
  private readonly tasks: Tasks;
  private readonly monitor: Monitor;

  private configs: Config[];
  private runningGame: {config: Config, process: WatchProcess};

  constructor(appFolders: AppFolders, fs: FileSystem, settings: Settings, network: Network, tasks: Tasks, monitor: Monitor) {
    super();
    this.appFolders = appFolders;
    this.fs = fs;
    this.settings = settings;
    this.network = network;
    this.tasks = tasks;
    this.monitor = monitor;
  }

  public async init(): Promise<any> {
    await this.load();
  }

  public async load(): Promise<void> {
    if (undefined !== this.configs) {
      return;
    }

    const files: string[] = await this.fs.glob(await this.appFolders.getConfigsGamesDir() + '/*/link.json');
    const configs: Config[] = [];

    for await (const file of files) {
      const config: Config = new Config(file, this.appFolders, this.fs, this.settings);
      await config.init();
      configs.push(config);
    }

    this.configs = _.sortBy(
      configs,
      'sort',
    );
  }

  public async runById(id: string | number, operation: KernelOperation = KernelOperation.RUN): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    await this.monitor.save();

    const process: WatchProcess = await this.tasks.kernel(config.getCmd(), operation);
    this.runningGame = {config, process};

    process.wait().then(async () => {
      this.runningGame = undefined;
      await this.monitor.restore();
    });
  }

  public async debugById(id: string | number): Promise<void> {
    return await this.runById(id, KernelOperation.INSTALL);
  }

  public getRunningGame(): Config | undefined {
    return this.runningGame?.config;
  }

  public kill(): void {
    this.runningGame?.process.kill();
    this.runningGame = undefined;
  }

  public async create(data: ConfigType['game']): Promise<void> {
    const createAt: number = new Date().getTime();
    const configsGamesDir: string = await this.appFolders.getConfigsGamesDir();
    let fileName: string = `${configsGamesDir}/${data.name}/link.json`;

    if (await this.fs.exists(fileName)) {
      fileName = `${configsGamesDir}/${data.name}-${createAt}/link.json`;
    }

    const config: Config = new Config(fileName, this.appFolders, this.fs, this.settings);
    await config.init();

    config.set('createAt', createAt);
    config.set('game.sort', 500);
    config.set('game.name', data.name);
    config.set('game.arguments', data.arguments);
    await config.setPath(data.path);

    await config.save();

    this.configs = undefined;
    await this.load();
  }

  public async getList(): Promise<ConfigType[]> {
    const result: ConfigType[] = [];

    for await (const config of this.configs) {
      result.push(await config.getConfig());
    }

    return result;
  }

  public async getById(id: string | number): Promise<Config> {
    id = String(id);
    return this.configs.find((item: Config): boolean => id === item.id);
  }

  public async removeById(id: string | number): Promise<void> {
    const config: Config = await this.getById(id);

    if (config) {
      await config.remove();
    }

    this.configs = undefined;
    await this.load();
  }

  public async updateExeById(id: string | number, path: string): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    await config.setPath(path);
    await config.save();

    this.configs = undefined;
    await this.load();
  }

  public async updateArgumentsById(id: string | number, cmd: string): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    await config.setArguments(cmd);
    await config.save();

    this.configs = undefined;
    await this.load();
  }

  public async updateTitleById(id: string | number, cmd: string): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    await config.setTitle(cmd);
    await config.save();

    this.configs = undefined;
    await this.load();
  }

  public async updateImage(image: ImageType, id: string, type: 'poster' | 'icon'): Promise<void> {
    if (!image || !image.url || !type) {
      return;
    }

    const url: string = image.thumb || image.url;

    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    const basename: string = this.fs.basename(url);
    const cache: string = `${await this.appFolders.getCacheDir()}/${basename}`;
    const dest: string = `${config.getFolder()}/${type}.png`;

    if (await this.fs.exists(cache)) {
      await this.fs.rm(cache);
    }

    if ('file' === image.type) {
      if (!await this.fs.exists(url)) {
        return;
      }

      await this.fs.cp(url, cache);
    } else {
      await this.network.download(url, cache, () => undefined);
    }

    if (!(await this.fs.exists(cache)) || 0 === (await this.fs.size(cache))) {
      return;
    }

    if ('poster' === type) {
      await config.removePoster();
    } else {
      await config.removeIcon();
    }

    await Resizer.create(this.fs, cache, dest).resize(400);
  }
}