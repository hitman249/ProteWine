import SGDB, {type SGDBGame, type SGDBImage} from 'steamgriddb';
import {AbstractModule} from './abstract-module';

export type ImageType = {
  url: string,
  thumb: string,
  type: 'url' | 'file',
};

export default class Gallery extends AbstractModule {
  private client: SGDB;

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

    return grids.map((item: SGDBImage): ImageType => ({url: String(item.url), thumb: String(item.thumb), type: 'url'}));
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

    return grids.map((item: SGDBImage): ImageType => ({url: String(item.url), thumb: String(item.thumb), type: 'url'}));
  }
}