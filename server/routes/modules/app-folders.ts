import {RoutesAppFolders} from '../routes';
import {AbstractRouteModule} from './abstract-route-module';


export default class AppFoldersRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindGames();
  }

  private bindGames(): void {
    this.ipc.handle(
      RoutesAppFolders.GAMES,
      async (): Promise<any> => this.app.getAppFolders().getGamesDir(),
    );
  }
}