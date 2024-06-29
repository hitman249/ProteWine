import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import {RoutesSystem} from '../routes';

export default class SystemRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindAppExit();
  }

  private bindAppExit(): void {
    this.ipc.handle(
      RoutesSystem.APP_EXIT,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getServer().quit(),
    );
  }
}