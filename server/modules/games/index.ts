import _ from 'lodash';
import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import Config from './config';

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

  }

  public async load(): Promise<void> {
    if (undefined !== this.configs) {
      return;
    }

    const files: string[] = await this.fs.glob(await this.appFolders.getConfigsDir() + '/game*.json');
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
}