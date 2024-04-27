import {BrowserWindow, IpcMain} from 'electron';
import {AbstractModule} from '../../modules/abstract-module';

export enum ApiKernel {
  VERSION = 'kernel:version',
}

export enum ApiKernelEvent {
  LOG = 'kernel:log',
}

export default class KernelRoutes extends AbstractModule {
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow) {
    super();
    this.ipc = ipcMain;
    this.window = window;
  }

  public async init(): Promise<any> {
    this.bindVersion();
  }

  private bindVersion(): void {
    this.ipc.handle(
      ApiKernel.VERSION,
      async (): Promise<any> => global.$app.getKernels().getKernel().version(),
    );
  }
}