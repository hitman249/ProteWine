import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesPlugins} from '../../../../../server/routes/routes';

export default class Plugins extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async install(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPlugins.INSTALL));
  }

  public async getList(id?: string): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPlugins.LIST, id));
  }
}