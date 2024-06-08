import _ from 'lodash';
import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import Config, {type ConfigType} from './config';

export default class Games extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly settings: Settings;

  private configs: Config[];

  constructor(appFolders: AppFolders, fs: FileSystem, settings: Settings) {
    super();
    this.appFolders = appFolders;
    this.fs = fs;
    this.settings = settings;
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
    config.setPath(data.path);

    await config.save();

    this.configs = undefined;
    await this.load();
  }

  public async getList(): Promise<ConfigType[]> {
    return this.configs.map((config: Config) => config.getConfig());
  }
}