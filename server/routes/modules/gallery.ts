import type {IpcMainInvokeEvent} from 'electron';
import {AbstractRouteModule} from './abstract-route-module';
import {RoutesGallery} from '../routes';

export default class GalleryRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindPortraits();
    this.bindIcons();
  }

  private bindPortraits(): void {
    this.ipc.handle(
      RoutesGallery.PORTRAITS,
      async (event: IpcMainInvokeEvent, name: string): Promise<any> => this.app.getGallery().findPortraits(name),
    );
  }

  private bindIcons(): void {
    this.ipc.handle(
      RoutesGallery.ICONS,
      async (event: IpcMainInvokeEvent, name: string): Promise<any> => this.app.getGallery().findIcons(name),
    );
  }
}