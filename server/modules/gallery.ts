import SGDB, {type SGDBGame, type SGDBImage} from 'steamgriddb';
import {AbstractModule} from './abstract-module';
import type Network from './network';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import Utils from '../helpers/utils';

export type ImageType = {
  url: string,
  thumb: string,
  type: 'url' | 'file',
};

export default class Gallery extends AbstractModule {
  private client: SGDB;
  private network: Network;
  private fs: FileSystem;
  private appFolders: AppFolders;

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network) {
    super();
    this.network = network;
    this.fs = fs;
    this.appFolders = appFolders;
  }

  public async init(): Promise<any> {
    this.client = new SGDB('42fb1a67abd4984a86355fc10e7c7402');
  }

  public async findPortraits(name: string): Promise<ImageType[]> {
    const games: SGDBGame[] = await this.client.searchGame(name);

    if (!games || 0 === games.length) {
      return [];
    }

    const grids: SGDBImage[] = await this.client.getGrids({type: 'game', id: games[0].id});

    if (!grids || 0 === grids.length) {
      return [];
    }

    return grids.map((item: SGDBImage): ImageType => ({url: `gallery://${String(item.url).split('://')[1]}`, thumb: `gallery://${String(item.thumb).split('://')[1]}`, type: 'url'}));
  }

  public async findIcons(name: string): Promise<ImageType[]> {
    const games: SGDBGame[] = await this.client.searchGame(name);

    if (!games || 0 === games.length) {
      return [];
    }

    const grids: SGDBImage[] = await this.client.getIcons({type: 'game', id: games[0].id});

    if (!grids || 0 === grids.length) {
      return [];
    }

    return grids.map((item: SGDBImage): ImageType => ({url: `gallery://${String(item.url).split('://')[1]}`, thumb: `gallery://${String(item.thumb).split('://')[1]}`, type: 'url'}));
  }

  public async getLocalPathByUrl(url: string): Promise<string> {
    const cacheImages: string = `${await this.appFolders.getCacheDir()}/images`;

    if (!await this.fs.exists(cacheImages)) {
      await this.fs.mkdir(cacheImages);
    }

    const filename: string = `${Utils.md5(url)}.${this.fs.extension(url)}`;
    const path: string = `${cacheImages}/${filename}`;

    if (await this.fs.exists(path)) {
      return path;
    }

    return this.network.download(url, path).then(() => path, () => '');
  }
}