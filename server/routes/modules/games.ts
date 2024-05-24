import type {BrowserWindow, IpcMain} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesGames} from '../routes';

export default class GamesRoutes extends AbstractModule {
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
    this.bindFindLinks();
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesGames.LIST,
      async (): Promise<any> => this.app.getGames().getList(),
    );
  }

  private bindFindLinks(): void {
    this.ipc.handle(
      RoutesGames.FIND_LINKS,
      async (): Promise<any> => this.app.getLinkInfo().findLinks(),
    );
  }
}