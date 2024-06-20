import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesKernel, RoutesRepositories} from '../routes';
import {KernelOperation} from '../../modules/kernels/abstract-kernel';

export default class RepositoriesRoutes extends AbstractModule {
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
    this.bindListByName();
    this.bindInstallRunner();
  }

  private bindInstallRunner(): void {
    this.ipc.handle(
      RoutesRepositories.INSTALL,
      async (event: IpcMainInvokeEvent, url: string): Promise<any> =>
        this.app.getTasks()
          .installRunner(url)
          .then(() => undefined),
    );
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesRepositories.LIST,
      async (): Promise<any> => this.app.getRepositories().getList(),
    );
  }

  private bindListByName(): void {
    this.ipc.handle(
      RoutesRepositories.LIST_BY_NAME,
      async (event: IpcMainInvokeEvent, name: string): Promise<any> => this.app.getRepositories().getListByName(name),
    );
  }
}