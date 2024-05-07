import {BrowserWindow, IpcMain} from 'electron';
import FileSystemRoutes from './modules/file-system';
import {AbstractModule} from '../modules/abstract-module';
import KernelRoutes from './modules/kernel';
import type {App} from '../app';
import TasksRoutes from './modules/tasks';

export default class Index {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  private readonly FILE_SYSTEM: FileSystemRoutes;
  private readonly KERNEL: KernelRoutes;
  private readonly TASKS: TasksRoutes;

  private readonly modules: AbstractModule[] = [];

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;

    this.FILE_SYSTEM = new FileSystemRoutes(ipcMain, window, app);
    this.KERNEL = new KernelRoutes(ipcMain, window, app);
    this.TASKS = new TasksRoutes(ipcMain, window, app);

    this.modules.push(
      this.FILE_SYSTEM,
      this.KERNEL,
      this.TASKS,
    );
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }
}