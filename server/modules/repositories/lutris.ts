import AbstractRepository from './abstract-repository';
import _, {Dictionary} from 'lodash';
import type {ItemType} from './index';

export default class Lutris extends AbstractRepository {
  protected name: string = 'Lutris';

  protected readonly url: string = 'https://lutris.net/api/runners?format=json&search=wine';
  protected data: ItemType[];

  public async init(): Promise<void> {

  }

  public async getList(): Promise<ItemType[]> {
    if (undefined !== this.data) {
      return this.data;
    }

    const data: any[] = await this.network.getJSON(this.url);

    let results: ItemType[] = [];

    let items: any = _.get(data, 'results[0].versions', []);
    let groups: Dictionary<any> = _.groupBy(items, 'architecture');

    Object.keys(groups).forEach((folder) => {
      results = [...results, ..._.reverse(groups[folder].map((item: any) => ({
        name: item.version,
        type: 'file',
        url: item.url,
      })))]
    });

    this.data = results;

    return this.data;
  }
}