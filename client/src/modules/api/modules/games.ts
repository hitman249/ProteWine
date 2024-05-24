import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGames} from '../../../../../server/routes/routes';
import type {ConfigType} from '../../../../../server/modules/games/config';
import type {LinkInfoData} from '../../../../../server/modules/link-info';

export default class Games extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<ConfigType[]> {
    return (await window.electronAPI.invoke(RoutesGames.LIST));
  }

  public async findLinks(): Promise<LinkInfoData[]> {
    return (await window.electronAPI.invoke(RoutesGames.FIND_LINKS));
  }
}