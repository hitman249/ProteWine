import _ from 'lodash';
import dotenv from 'dotenv';
import {AbstractModule} from '../abstract-module';
import Utils from '../../helpers/utils';
import {SessionType} from '../kernels/abstract-kernel';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Settings from '../settings';
import type {BiasModes, FsrModes, FsrSharpening} from '../plugins/types';
import type {EnvType} from '../kernels/environment';
import type {App} from '../../app';
import type Plugins from '../plugins';
import type {Kernel} from '../kernels';
import type {Resolution} from '../monitor';

export type ConfigType = {
  createAt: number,
  poster?: string,
  icon?: string,
  size?: number,
  sizeFormatted?: string,
  menuIcons?: string[],
  desktopIcons?: string[],
  steamIcons?: boolean,
  game: {
    path: string,
    arguments: string,
    name: string,
    sort?: number,
    time?: number,
    timeFormatted?: string,
  },
  kernel: {
    window: boolean,
    d3d12: boolean,
    d3d11: boolean,
    d3d10: boolean,
    d3d9: boolean,
    d3d8: boolean,
    nvapi: boolean,
    ntsync: boolean,
    esync: boolean,
    fsync: boolean,
    fsrMode: FsrModes,
    fsrStrength: FsrSharpening,
    bias: BiasModes,
  },
}

export default class Config extends AbstractModule {
  private readonly path: string;
  private readonly envPath: string;
  private readonly steamPath: string;
  private env: EnvType;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly settings: Settings;
  private readonly app: App;

  private config: ConfigType;

  constructor(path: string, appFolders: AppFolders, fs: FileSystem, settings: Settings, app: App) {
    super();
    this.path = path;
    this.envPath = `${fs.dirname(path)}/.env`;
    this.steamPath = `${fs.dirname(path)}/steam.sh`;
    this.appFolders = appFolders;
    this.fs = fs;
    this.settings = settings;
    this.app = app;

    this.appendTime = this.appendTime.bind(this);
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

    if (await this.fs.exists(this.envPath)) {
      this.env = dotenv.parse(await this.fs.fileGetContents(this.envPath));
    } else {
      this.env = {};

      if (await this.fs.exists(path)) {
        await this.fs.filePutContents(this.envPath, '');
      }
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

    await this.updateSteam();

    return this.fs.filePutContents(path, Utils.jsonEncode(Object.assign({}, this.config, {size: undefined})));
  }

  public async updateSteam(): Promise<void> {
    const kernel: Kernel = this.app.getKernels().getKernel();
    const plugins: Plugins = this.app.getPlugins();

    if (!kernel || !plugins) {
      return;
    }

    const env: EnvType = Object.assign({}, await plugins.getEnv(), this.getEnv());
    const container: string = await kernel.getCmd(this.getCmd(), SessionType.RUN, env);

    const script: string = `#!/usr/bin/env bash

${container}`;

    await this.fs.filePutContents(this.steamPath, script);
    await this.fs.chmod(this.steamPath);
  }

  public getSteamPath(): string {
    return this.steamPath;
  }

  public get sort(): number {
    return this.config?.game.sort ?? 500;
  }

  public get id(): string {
    return String(this.config?.createAt);
  }

  public get title(): string {
    return this.config?.game.name;
  }

  public getGamePath(): string {
    return this.config?.game.path;
  }

  public getEnv(): EnvType {
    return this.env || {};
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

  public async getDesktop(): Promise<string> {
    if (!this.isWindow()) {
      return '';
    }

    const title: string = `${this.config.game.name}`;
    const {width, height}: Resolution = await this.app.getMonitor().getResolution();
    const resolution: string = `${width}x${height}`;

    return `explorer "/desktop=${title},${resolution}"`;
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
      kernel: {
        window: false,
        d3d12: true,
        d3d11: true,
        d3d10: true,
        d3d9: true,
        d3d8: true,
        nvapi: true,
        ntsync: true,
        esync: true,
        fsync: false,
        fsrMode: '',
        fsrStrength: '2',
        bias: '',
      },
    };
  }

  public async appendTime(seconds: number): Promise<void> {
    this.config.game.time += seconds;
    await this.save();
  }

  public isEsync(): boolean {
    return _.get(this.config, 'kernel.esync', true);
  }

  public isNtsync(): boolean {
    return _.get(this.config, 'kernel.ntsync', true);
  }

  public isFsync(): boolean {
    return _.get(this.config, 'kernel.fsync', false);
  }

  public isNvapi(): boolean {
    return _.get(this.config, 'kernel.nvapi', true);
  }

  public isD3d12(): boolean {
    return _.get(this.config, 'kernel.d3d12', true);
  }

  public isD3d11(): boolean {
    return _.get(this.config, 'kernel.d3d11', true);
  }

  public isD3d10(): boolean {
    return _.get(this.config, 'kernel.d3d10', true);
  }

  public isD3d9(): boolean {
    return _.get(this.config, 'kernel.d3d9', true);
  }

  public isD3d8(): boolean {
    return _.get(this.config, 'kernel.d3d8', true);
  }

  public isWindow(): boolean {
    return _.get(this.config, 'kernel.window', false);
  }

  public getFrsMode(): string {
    return _.get(this.config, 'kernel.fsrMode', '');
  }

  public getFsrStrength(): string {
    return _.get(this.config, 'kernel.fsrStrength', '2');
  }

  public getBiasMode(): string {
    return _.get(this.config, 'kernel.bias', '');
  }
}