import _ from 'lodash';
import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import Utils from '../../helpers/utils';

export type ConfigType = {
  createAt: number,
  poster?: string,
  icon?: string,
  size?: number,
  sizeFormatted?: string,
  game: {
    path: string,
    arguments: string,
    name: string,
    sort?: number,
    time?: number,
    timeFormatted?: string,
  },
  env: {
    [field: string]: string,
  },
  kernel: {
    nod3d12: boolean,
    nod3d11: boolean,
    nod3d10: boolean,
    nod3d9: boolean,
    nod3d8: boolean,
    nvapi: boolean,
  },
}

export default class Config extends AbstractModule {
  private readonly path: string;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly settings: Settings;

  private config: ConfigType;

  constructor(path: string, appFolders: AppFolders, fs: FileSystem, settings: Settings) {
    super();
    this.path = path;
    this.appFolders = appFolders;
    this.fs = fs;
    this.settings = settings;
  }

  public async init(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const path: string = this.path;

    if (!this.config && await this.fs.exists(path)) {
      this.config = Utils.jsonDecode(await this.fs.fileGetContents(path));
    }

    if (!this.config) {
      this.config = this.getDefaultConfig();
    }
  }

  public async save(): Promise<void> {
    const path: string = this.path;

    if (!this.config) {
      await this.load();
    }

    const folder: string = this.fs.dirname(path);

    if (!await this.fs.exists(folder)) {
      await this.fs.mkdir(folder);
    }

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }

    return this.fs.filePutContents(path, Utils.jsonEncode(Object.assign({}, this.config, {size: undefined})));
  }

  public get sort(): number {
    return this.config?.game.sort ?? 500;
  }

  public get id(): string {
    return String(this.config?.createAt);
  }

  public async getConfig(): Promise<ConfigType> {
    return {
      ...this.config,
      poster: await this.getPoster(),
      icon: await this.getIcon(),
    };
  }

  public set(path: string, value: any): void {
    _.set(this.config, path, value);
  }

  public async setPath(path: string): Promise<void> {
    let chunks: string[] = path.split('/drive_c/');
    const gamesDir: string = await this.appFolders.getGamesDir();
    chunks = chunks[chunks.length - 1].split(gamesDir).join('Games').split(gamesDir);
    this.set('game.path', `/${_.trimStart(chunks[chunks.length - 1], '/')}`);
  }

  public async setArguments(cmd: string): Promise<void> {
    this.set('game.arguments', cmd);
  }

  public async setTitle(title: string): Promise<void> {
    this.set('game.name', title);
  }

  public async loadSize(): Promise<void> {
    if (undefined !== this.config?.size) {
      return;
    }

    const gamesDir: string = await this.appFolders.getGamesDir();
    const gameDir: string = _.get(this.config, 'game.path', '').split('/').slice(2, 3).join('/');

    this.set('size', await this.fs.size(`${gamesDir}/${gameDir}`));
  }

  public getFolder(): string {
    return this.fs.dirname(this.path);
  }

  public async removePoster(): Promise<void> {
    const path: string = `${this.getFolder()}/poster.png`;

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }
  }

  public async removeIcon(): Promise<void> {
    const path: string = `${this.getFolder()}/icon.png`;

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }
  }

  public async remove(): Promise<void> {
    const folder: string = this.getFolder();

    if (await this.fs.exists(folder)) {
      await this.fs.rm(folder);
    }
  }

  public async getPoster(): Promise<string> {
    const extensions: string[] = ['png', 'jpeg', 'jpg', 'webp', 'gif'];
    const folder: string = this.getFolder();

    for await (const ext of extensions) {
      const path: string = `${folder}/poster.${ext}`;

      if (await this.fs.exists(path)) {
        return path;
      }
    }
  }

  public async getIcon(): Promise<string> {
    const folder: string = this.getFolder();
    const path: string = `${folder}/icon.png`;

    if (await this.fs.exists(path)) {
      return path;
    }
  }

  public getCmd(): string {
    return `"C:${this.config.game.path}" ${this.config.game.arguments}`;
  }

  public getDefaultConfig(): any {
    return {
      createAt: 0,
      game: {
        path: '',
        arguments: '',
        name: '',
        sort: 500,
        time: 0,
      },
      env: {},
      kernel: {
        nod3d12: false,
        nod3d11: false,
        nod3d10: false,
        nod3d9: false,
        nod3d8: false,
        nvapi: false,
      },
    };
  }
}