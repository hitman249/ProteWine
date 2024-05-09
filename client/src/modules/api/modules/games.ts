import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGames} from '../../../../../server/routes/routes';
import type {ConfigType} from '../../../../../server/modules/games/config';

export default class Games extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<ConfigType[]> {
    return (await window.electronAPI.invoke(RoutesGames.LIST));
  }
}