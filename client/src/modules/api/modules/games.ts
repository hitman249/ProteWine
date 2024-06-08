import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGames} from '../../../../../server/routes/routes';
import type {ConfigType} from '../../../../../server/modules/games/config';
import type {LinkInfoData} from '../../../../../server/modules/link-info';
import Config from '../../../models/config';

export default class Games extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<Config[]> {
    const list: ConfigType[] = (await window.electronAPI.invoke(RoutesGames.LIST));
    return list.map((config: ConfigType) => new Config(config));
  }

  public async create(data: ConfigType['game']): Promise<ConfigType[]> {
    return (await window.electronAPI.invoke(RoutesGames.CREATE, data));
  }

  public async findLinks(): Promise<LinkInfoData[]> {
    return (await window.electronAPI.invoke(RoutesGames.FIND_LINKS));
  }
}