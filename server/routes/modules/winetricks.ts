import {AbstractRouteModule} from './abstract-route-module';
import {RoutesWineTricks} from '../routes';

export default class WineTricksRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindList();
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesWineTricks.LIST,
      async (): Promise<any> => this.app.getWineTricks().getList(),
    );
  }
}