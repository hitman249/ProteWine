import AbstractRepository from './abstract-repository';
import _ from 'lodash';
import type {ItemType} from './index';
import Utils from '../../helpers/utils';

export default class ProtonCachyOS extends AbstractRepository {
  protected name: string = 'Proton CachyOS';

  protected readonly url: string = 'https://api.github.com/repos/CachyOS/proton-cachyos/releases';
  protected data: ItemType[];

  public async init(): Promise<void> {

  }

  public async getList(): Promise<ItemType[]> {
    if (undefined !== this.data) {
      return this.data;
    }

    const data: any[] = await this.network.getJSON(this.url);

    let results: ItemType[] = [];

    for (const item of data) {
      const asset: any = Utils.findAssetArchive(item.assets);

      if (!asset) {
        continue;
      }

      const url: string = asset.browser_download_url;

      results.push({
        name: _.trim(String(item.name || item.tag_name).replace('Released', '')),
        type: 'file',
        url,
      });
    }

    this.data = results;

    return this.data;
  }
}