import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import type WatchProcess from '../../helpers/watch-process';
import {RoutesPlugins} from '../routes';

export default class PluginsRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindInstall();
    this.bindList();
  }

  private bindInstall(): void {
    this.ipc.handle(RoutesPlugins.INSTALL, async (): Promise<any> => {
      const process: WatchProcess = await this.app.getTasks().installPlugins();
      await process.wait();
    });
  }

  private bindList(): void {
    this.ipc.handle(RoutesPlugins.LIST, async (event: IpcMainInvokeEvent, id: string): Promise<any> => this.app.getPlugins().getList(id));
  }
}