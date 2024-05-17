import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesPrefix} from '../../../../../server/routes/routes';

export default class Prefix extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async create(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPrefix.CREATE));
  }

  public async refresh(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPrefix.REFRESH));
  }

  public async isExist(): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesPrefix.EXIST));
  }

  public async isProcessed(): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesPrefix.PROCESSED));
  }

  public async sendLastProgress(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPrefix.PROGRESS));
  }
}