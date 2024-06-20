import AbstractRepository from './abstract-repository';
import _ from 'lodash';
import type {ItemType} from './index';

export default class Kron4ek extends AbstractRepository {
  protected name: string = 'Kron4ek';

  protected readonly url: string = 'https://api.github.com/repos/Kron4ek/Wine-Builds/releases';
  protected data: ItemType[];

  public async init(): Promise<void> {

  }

  public async getList(): Promise<ItemType[]> {
    if (undefined !== this.data) {
      return this.data;
    }

    const data: any[] = await this.network.getJSON(this.url);

    const items: {[name: string]: {[name: string]: ItemType[]}} = {
      wine:    {
        x86_64: [],
        x86:    [],
      },
      staging: {
        x86_64: [],
        x86:    [],
      },
      tkg:     {
        x86_64: [],
        x86:    [],
      },
      proton:  {
        x86_64: [],
        x86:    [],
      },
    };

    data.forEach((release) => {
      release.assets.forEach((item: any) => {
        if (!_.endsWith(item.name, '.tar.xz')) {
          return;
        }

        const arch: string = item.name.includes('amd64') ? 'x86_64' : 'x86';
        const name = item.name.replace('wine-', '').replace('.tar.xz', '').replace('-amd64', '').replace('-x86', '');

        let file: ItemType = {
          name: name,
          type: 'file',
          url: item.browser_download_url,
        };

        if (item.name.includes('-proton-')) {
          file.name = _.trim(file.name.replace('proton', '').replace('--', '-'), '-');
          items.proton[arch].push(file);
        } else if (item.name.includes('-tkg-')) {
          file.name = _.trim(file.name.replace('staging-tkg', '').replace('tkg-staging', '').replace('-staging', ''), '-');
          items.tkg[arch].push(file);
        } else if (item.name.includes('-staging-')) {
          file.name = _.trim(file.name.replace('-staging', ''), '-');
          items.staging[arch].push(file);
        } else {
          items.wine[arch].push(file);
        }
      });
    });

    const results: ItemType[] = [];

    for (const name of Object.keys(items)) {
      if (items[name]['x86_64'].length > 0) {
        results.push({
          name,
          type: 'dir',
          items: items[name]['x86_64'],
        });
      }
    }

    this.data = results;

    return this.data;
  }
}