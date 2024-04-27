import {BrowserWindow, IpcMain} from 'electron';
import FileSystemRoutes from './modules/file-system';
import {AbstractModule} from '../modules/abstract-module';
import KernelRoutes from './modules/kernel';

export default class Index {
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  private readonly FILE_SYSTEM: FileSystemRoutes;
  private readonly KERNEL: KernelRoutes;

  private readonly modules: AbstractModule[] = [];

  constructor(ipcMain: IpcMain, window: BrowserWindow) {
    this.ipc = ipcMain;
    this.window = window;

    this.FILE_SYSTEM = new FileSystemRoutes(ipcMain, window);
    this.KERNEL = new KernelRoutes(ipcMain, window);

    this.modules.push(
      this.FILE_SYSTEM,
      this.KERNEL,
    );
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }
}