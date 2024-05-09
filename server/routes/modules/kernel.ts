import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {KernelOperation} from '../../modules/kernels/abstract-kernel';
import {RoutesKernel} from '../routes';


export default class KernelRoutes extends AbstractModule {
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
    this.bindVersion();
    this.bindRun();
    this.bindInstall();
  }

  private bindVersion(): void {
    this.ipc.handle(
      RoutesKernel.VERSION,
      async (): Promise<any> => this.app.getKernels().getKernel().version(),
    );
  }

  private bindRun(): void {
    this.ipc.handle(
      RoutesKernel.RUN,
      async (event: IpcMainInvokeEvent, cmd: string): Promise<any> =>
        this.app.getTasks()
          .kernel(cmd, KernelOperation.RUN)
          .then(() => undefined),
    );
  }

  private bindInstall(): void {
    this.ipc.handle(
      RoutesKernel.INSTALL,
      async (event: IpcMainInvokeEvent, cmd: string): Promise<any> =>
        this.app.getTasks()
          .kernel(cmd, KernelOperation.INSTALL)
          .then(() => undefined),
    );
  }
}