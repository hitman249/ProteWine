import AbstractRepository from './abstract-repository';
import _ from 'lodash';
import type {ItemType} from './index';
import Utils from '../../helpers/utils';

export default class BottlesDevs extends AbstractRepository {
  protected name: string = 'Bottles Devs';

  protected readonly url: string = 'https://api.github.com/repos/bottlesdevs/wine/releases';
  protected data: ItemType[];

  public async init(): Promise<void> {

  }

  public async getList(): Promise<ItemType[]> {
    if (undefined !== this.data) {
      return this.data;
    }

    const data: any[] = await this.network.getJSON(this.url);

    let results: ItemType[] = [];

    const names: string[] = data.map((item) => (item.name || item.tag_name));
    const sortNames: string[] = Utils.natsort(names.slice(), true);

    for (const name of sortNames) {
      const index: number = names.indexOf(name);

      if (-1 !== index) {
        const item = data[index];
        const asset: any = Utils.findAssetArchive(item.assets);
        const url: string = asset.browser_download_url;

        results.push({
          name: String(item.name || item.tag_name),
          type: 'file',
          url,
        });
      }
    }

    this.data = results;

    return this.data;
  }
}