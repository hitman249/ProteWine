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
import Utils from '../../helpers/utils';
import Time from '../../helpers/time';
import type {App} from '../../app';
import type Icon from '../icon';
import type Steam from '../steam';
import Timer from '../../helpers/timer';

export enum GamesEvent {
  RUN = 'run',
  EXIT = 'exit',
}

export default class Games extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly settings: Settings;
  private readonly network: Network;
  private readonly tasks: Tasks;
  private readonly monitor: Monitor;
  private readonly app: App;

  private configs: Config[];
  private runningGame: {config: Config, process: WatchProcess};

  constructor(appFolders: AppFolders, fs: FileSystem, settings: Settings, network: Network, tasks: Tasks, monitor: Monitor, app: App) {
    super();
    this.appFolders = appFolders;
    this.fs = fs;
    this.settings = settings;
    this.network = network;
    this.tasks = tasks;
    this.monitor = monitor;
    this.app = app;
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
      const config: Config = new Config(file, this.appFolders, this.fs, this.settings, this.app);
      await config.init();
      configs.push(config);
    }

    this.configs = _.sortBy(
      configs,
      'sort',
    );
  }

  public async runById(id: string | number, operation: KernelOperation = KernelOperation.RUN): Promise<boolean> {
    const config: Config = await this.getById(id);

    if (!config) {
      return false;
    }

    this.fireEvent(GamesEvent.RUN);

    const headless: boolean = this.app.getServer().getArguments().isHeadless();
    let hideWindowTimer: number;
    let visibleWindow: boolean = !headless;

    if (!headless && KernelOperation.INSTALL !== operation) {
      hideWindowTimer = setTimeout(() => {
        visibleWindow = false;
        this.app.getServer().removeWindow();
      }, 30000) as any;
    }

    await this.monitor.save();

    this.app.getPlugins().setConfig(config);

    const timer: Timer = new Timer();
    timer.setCallback(config.appendTime);
    timer.start();

    this.runningGame = {config, process: undefined};
    const process: WatchProcess = await this.tasks.kernel(config.getCmd(), operation);
    this.runningGame.process = process;

    process.wait().then(async () => {
      timer.stop();
      this.runningGame = undefined;
      await this.monitor.restore();

      this.fireEvent(GamesEvent.EXIT);

      if (!headless) {
        if (undefined !== hideWindowTimer) {
          clearTimeout(hideWindowTimer);
        }

        if (!visibleWindow) {
          await this.app.getServer().createWindow();
          visibleWindow = true;
        }
      }
    });

    return true;
  }

  public async debugById(id: string | number): Promise<boolean> {
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

    const config: Config = new Config(fileName, this.appFolders, this.fs, this.settings, this.app);
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
      const clone: ConfigType = _.cloneDeep(await config.getConfig());

      const icon: Icon = await this.app.createIcon(config);
      clone.menuIcons = await icon.findIcons(true);
      clone.desktopIcons = await icon.findIcons(false);

      const steam: Steam = await this.app.createSteamIcon(config);
      clone.steamIcons = await steam.exist();

      result.push(clone);
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

  public async getInfoById(id: string | number): Promise<ConfigType> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    await config.loadSize();

    const clone: ConfigType = _.cloneDeep(await config.getConfig());

    clone.sizeFormatted = Utils.convertBytes(clone.size || 0);
    clone.game.timeFormatted = Time.secondPrint(clone.game.time || 0);

    return clone;
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
    let cache: string = `${await this.appFolders.getCacheDir()}/${basename}`;
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
      cache = await this.app.getGallery().getLocalPathByUrl(
        `https://${url.slice('gallery://'.length).split('?')[0]}`
      );
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

  public async updateConfig(id: string, path: string, value: string | boolean | number): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    config.set(path, value);

    await config.save();
  }

  public async createIconById(id: string, menuOrDesktop: boolean = false): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    const icon: Icon = await this.app.createIcon(config);
    await icon.create(menuOrDesktop);
  }

  public async removeIconsById(id: string, menuOrDesktop: boolean = false): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    const icon: Icon = await this.app.createIcon(config);
    await icon.remove(menuOrDesktop);
  }

  public async createSteamIconById(id: string): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    const steam: Steam = await this.app.createSteamIcon(config);
    await steam.create();
  }

  public async removeSteamIconById(id: string): Promise<void> {
    const config: Config = await this.getById(id);

    if (!config) {
      return;
    }

    const steam: Steam = await this.app.createSteamIcon(config);
    await steam.remove();
  }
}