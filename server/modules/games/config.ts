import {AbstractModule} from '../abstract-module';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import Utils from '../../helpers/utils';

export type ConfigType = {
  id: number,
  game: {
    path: string,
    exe: string,
    arguments: string,
    name: string,
    sort: number,
    time: number,
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

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }

    return this.fs.filePutContents(path, Utils.jsonEncode(this.config));
  }

  public get sort(): number {
    return this.config?.game.sort ?? 500;
  }

  public getConfig(): ConfigType {
    return this.config;
  }

  public getDefaultConfig(): any {
    return {
      id: 0,
      game: {
        path: '',
        exe: '',
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