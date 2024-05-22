import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesAppFolders} from '../../../../../server/routes/routes';

export default class AppFolders extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getGamesDir(): Promise<string> {
    return (await window.electronAPI.invoke(RoutesAppFolders.GAMES));
  }
}