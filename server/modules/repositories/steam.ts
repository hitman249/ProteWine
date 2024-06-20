import AbstractRepository from './abstract-repository';
import _ from 'lodash';
import type {ItemType} from './index';
// @ts-ignore
import VDF from 'simple-vdf';

export default class Steam extends AbstractRepository {
  protected name: string = 'Steam';

  protected readonly path: string = '/.steam/steam/config/config.vdf';
  protected data: ItemType[];

  public async init(): Promise<void> {

  }

  private async getConfigPath(): Promise<string> {
    return `/home/${await this.system.getUserName()}${this.path}`;
  }

  private async getConfig(): Promise<any> {
    const path: string = await this.getConfigPath();

    if (!await this.fs.exists(path)) {
      return {};
    }

    return VDF.parse(await this.fs.fileGetContents(path));
  }

  private async getSteamLibraryPaths(): Promise<string[]> {
    const user: string = await this.system.getUserName();
    const paths: string[] = [
      `/home/${user}/SteamLibrary`,
      `/home/${user}/.local/Steam`,
      `/home/${user}/.steam/steam`,
    ];

    for (let i: number = 1; ; i++) {
      const path: string = _.get(await this.getConfig(), 'InstallConfigStore.Software.Valve.Steam.BaseInstallFolder_' + i, '');

      if (!path) {
        break;
      }

      paths.push(path);
    }

    const result: string[] = [];

    for await (const path of _.uniq(paths)) {
      if (await this.fs.exists(path)) {
        result.push(path);
      }
    }

    return result;
  }

  public async getList(): Promise<ItemType[]> {
    if (undefined !== this.data) {
      return this.data;
    }

    const paths: string[] = await this.getSteamLibraryPaths();

    if (paths.length === 0) {
      return [];
    }

    const results: ItemType[] = [];

    for await (const path of paths) {
      const protons: string[] = await this.fs.glob(`${path}/steamapps/common/*`);

      for await (const proton of protons) {
        if (await this.fs.exists(`${proton}/proton`)) {
          results.push({
            name: this.fs.basename(proton),
            type: 'file',
            path: proton,
          });
        }
      }
    }

    this.data = results.reverse();

    return this.data;
  }
}