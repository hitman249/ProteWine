import type {BrowserWindow, IpcMain} from 'electron';
import type {App} from '../app';
import {AbstractModule} from '../modules/abstract-module';
import FileSystemRoutes from './modules/file-system';
import KernelRoutes from './modules/kernel';
import TasksRoutes from './modules/tasks';
import GamesRoutes from './modules/games';
import IsoRoutes from './modules/iso';
import PrefixRoutes from './modules/prefix';
import AppFoldersRoutes from './modules/app-folders';
import GalleryRoutes from './modules/gallery';

export default class Index {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  private readonly FILE_SYSTEM: FileSystemRoutes;
  private readonly KERNEL: KernelRoutes;
  private readonly TASKS: TasksRoutes;
  private readonly GAMES: GamesRoutes;
  private readonly ISO: IsoRoutes;
  private readonly PREFIX: PrefixRoutes;
  private readonly APP_FOLDERS: AppFoldersRoutes;
  private readonly GALLERY: GalleryRoutes;

  private readonly modules: AbstractModule[] = [];

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;

    this.FILE_SYSTEM = new FileSystemRoutes(ipcMain, window, app);
    this.KERNEL = new KernelRoutes(ipcMain, window, app);
    this.TASKS = new TasksRoutes(ipcMain, window, app);
    this.GAMES = new GamesRoutes(ipcMain, window, app);
    this.ISO = new IsoRoutes(ipcMain, window, app);
    this.PREFIX = new PrefixRoutes(ipcMain, window, app);
    this.APP_FOLDERS = new AppFoldersRoutes(ipcMain, window, app);
    this.GALLERY = new GalleryRoutes(ipcMain, window, app);

    this.modules.push(
      this.FILE_SYSTEM,
      this.KERNEL,
      this.TASKS,
      this.GAMES,
      this.ISO,
      this.PREFIX,
      this.APP_FOLDERS,
      this.GALLERY,
    );
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }
}