import {BrowserWindow, IpcMain} from 'electron';
import {ApiKernel} from './rules';

export default class Index {
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow) {
    this.ipc = ipcMain;
    this.window = window;
  }

  public async init(): Promise<void> {
    this.setApiKernel();
  }

  private setApiKernel(): void {
    this.ipc.handle(ApiKernel.VERSION, async (): Promise<any> => global.$app.getKernels().getKernel().version());
  }
}