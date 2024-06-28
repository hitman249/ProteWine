import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import {RoutesSettings} from '../routes';

export default class SettingsRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindSettings();
    this.bindSet();
  }

  private bindSettings(): void {
    this.ipc.handle(
      RoutesSettings.LIST,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getSettings().toConfig(),
    );
  }

  private bindSet(): void {
    this.ipc.handle(
      RoutesSettings.SAVE,
      async (event: IpcMainInvokeEvent, path: string, value: string | boolean | number): Promise<any> => this.app.getSettings().set(path, value),
    );
  }
}