import type {BrowserWindow, IpcMain} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesAppFolders, RoutesGames} from '../routes';


export default class AppFoldersRoutes extends AbstractModule {
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
    this.bindGames();
  }

  private bindGames(): void {
    this.ipc.handle(
      RoutesAppFolders.GAMES,
      async (): Promise<any> => this.app.getAppFolders().getGamesDir(),
    );
  }
}