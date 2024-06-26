import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesPlugins} from '../routes';
import type WatchProcess from '../../helpers/watch-process';

export default class PluginsRoutes extends AbstractModule {
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