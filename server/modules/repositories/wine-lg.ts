import AbstractRepository from './abstract-repository';
import _ from 'lodash';
import type {ItemType} from './index';
import Utils from '../../helpers/utils';

export default class WineLG extends AbstractRepository {
  protected name: string = 'Wine LG';

  protected readonly url: string = 'https://api.github.com/repos/Castro-Fidel/wine_builds/releases';
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
      const url: string = asset.browser_download_url;
      const name: string = _.trim(String(item.name || item.tag_name));

      if (-1 === name.indexOf('WINE_LG') && -1 === name.indexOf('PROTON_LG')) {
        continue;
      }

      results.push({
        name: name
          .replace('WINE_LG', 'Wine LG')
          .replace('PROTON_LG', 'Proton LG')
          .split('-').join('.').split('_').join(' '),
        type: 'file',
        url,
      });
    }

    this.data = results;

    return this.data;
  }
}