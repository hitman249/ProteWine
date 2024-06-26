import {AbstractRouteModule} from './abstract-route-module';
import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import Iso, {IsoEvents} from '../../modules/iso';
import {RoutesIso} from '../routes';

export type IsoData = {
  src: string,
  dest: string,
  basename: string,
};

export default class IsoRoutes extends AbstractRouteModule {
  private iso: Iso;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super(ipcMain, window, app);
    this.onEvents = this.onEvents.bind(this);
  }

  public async init(): Promise<any> {
    this.bindMount();
    this.bindUnmount();
  }

  private bindEvents(): void {
    if (!this.iso) {
      return;
    }

    this.unbindEvents();

    this.iso.on(IsoEvents.MOUNT, this.onEvents);
    this.iso.on(IsoEvents.UNMOUNT, this.onEvents);
    this.iso.on(IsoEvents.ERROR_UNMOUNT, this.onEvents);
  }

  private unbindEvents(): void {
    if (!this.iso) {
      return;
    }

    this.iso.off(IsoEvents.MOUNT, this.onEvents);
    this.iso.off(IsoEvents.UNMOUNT, this.onEvents);
    this.iso.off(IsoEvents.ERROR_UNMOUNT, this.onEvents);
  }

  private onEvents(event: IsoEvents, data: IsoData): void {
    this.app.getTasks().sendBus({
      event,
      module: 'iso',
      value: data,
    });
  }

  private bindMount(): void {
    this.ipc.handle(
      RoutesIso.MOUNT,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => {
        if (this.iso) {
          await this.iso.unmount();
        }

        this.iso = await this.app.createIso(path);
        this.bindEvents();
        await this.iso.mount();

        return this.iso.getFolderInPrefix();
      },
    );
  }

  private bindUnmount(): void {
    this.ipc.handle(
      RoutesIso.UNMOUNT,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => {
        if (this.iso) {
          await this.iso.unmount();
          this.iso = undefined;
        }

        this.unbindEvents();
      },
    );
  }
}