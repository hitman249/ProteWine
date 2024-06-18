import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesWineTricks} from '../routes';

export default class WineTricksRoutes extends AbstractModule {
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
    this.bindList();
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesWineTricks.LIST,
      async (): Promise<any> => this.app.getWineTricks().getList(),
    );
  }
}