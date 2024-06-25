import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesSettings} from '../routes';

export default class SettingsRoutes extends AbstractModule {
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
      async (event: IpcMainInvokeEvent, path: string, value: string | boolean): Promise<any> => this.app.getSettings().set(path, value),
    );
  }
}