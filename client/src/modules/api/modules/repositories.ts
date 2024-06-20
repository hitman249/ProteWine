import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesRepositories} from '../../../../../server/routes/routes';
import type {ItemType} from '../../../../../server/modules/repositories';

export default class Repositories extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<ItemType[]> {
    return (await window.electronAPI.invoke(RoutesRepositories.LIST));
  }

  public async getListByName(name: string): Promise<ItemType[]> {
    return (await window.electronAPI.invoke(RoutesRepositories.LIST_BY_NAME, name));
  }

  public async installRunner(url: string): Promise<void> {
    return (await window.electronAPI.invoke(RoutesRepositories.INSTALL, url));
  }
}