import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesWineTricks} from '../../../../../server/routes/routes';
import type {WineTrickItemType} from '../../../../../server/modules/winetricks';

export default class WineTricks extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<WineTrickItemType[]> {
    return (await window.electronAPI.invoke(RoutesWineTricks.LIST));
  }
}