import {AbstractModule} from '../../modules/abstract-module';
import type {App} from '../../app';
import type {BrowserWindow, IpcMain} from 'electron';

export abstract class AbstractRouteModule extends AbstractModule {
  protected readonly app: App;
  protected readonly ipc: IpcMain;
  protected window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super();
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;
  }

  public abstract init(): Promise<any>;

  public setWindow(window: BrowserWindow): void {
    this.window = window;
  }
}