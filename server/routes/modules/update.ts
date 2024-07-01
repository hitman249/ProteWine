import type {IpcMainInvokeEvent} from 'electron';
import {AbstractRouteModule} from './abstract-route-module';
import {RoutesUpdate} from '../routes';

export default class UpdateRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindAppVersion();
  }

  private bindAppVersion(): void {
    this.ipc.handle(
      RoutesUpdate.APP_VERSION,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getUpdate().getVersion(),
    );
  }
}