import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesGallery} from '../routes';

export default class GalleryRoutes extends AbstractModule {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super();
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;
  }

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