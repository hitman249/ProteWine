import type {BrowserWindow, IpcMain} from 'electron';
import type {App} from '../app';
import {AbstractRouteModule} from './modules/abstract-route-module';
import FileSystemRoutes from './modules/file-system';
import KernelRoutes from './modules/kernel';
import TasksRoutes from './modules/tasks';
import GamesRoutes from './modules/games';
import IsoRoutes from './modules/iso';
import PrefixRoutes from './modules/prefix';
import AppFoldersRoutes from './modules/app-folders';
import GalleryRoutes from './modules/gallery';
import WineTricksRoutes from './modules/winetricks';
import RepositoriesRoutes from './modules/repositories';
import SettingsRoutes from './modules/settings';
import PluginsRoutes from './modules/plugins';
import SystemRoutes from './modules/system';

export default class Index {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private window: BrowserWindow;

  private readonly FILE_SYSTEM: FileSystemRoutes;
  private readonly KERNEL: KernelRoutes;
  private readonly TASKS: TasksRoutes;
  private readonly GAMES: GamesRoutes;
  private readonly ISO: IsoRoutes;
  private readonly PREFIX: PrefixRoutes;
  private readonly APP_FOLDERS: AppFoldersRoutes;
  private readonly GALLERY: GalleryRoutes;
  private readonly WINETRICKS: WineTricksRoutes;
  private readonly REPOSITORIES: RepositoriesRoutes;
  private readonly SETTINGS: SettingsRoutes;
  private readonly PLUGINS: PluginsRoutes;
  private readonly SYSTEM: SystemRoutes;

  private readonly modules: AbstractRouteModule[] = [];

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
    this.WINETRICKS = new WineTricksRoutes(ipcMain, window, app);
    this.REPOSITORIES = new RepositoriesRoutes(ipcMain, window, app);
    this.SETTINGS = new SettingsRoutes(ipcMain, window, app);
    this.PLUGINS = new PluginsRoutes(ipcMain, window, app);
    this.SYSTEM = new SystemRoutes(ipcMain, window, app);

    this.modules.push(
      this.FILE_SYSTEM,
      this.KERNEL,
      this.TASKS,
      this.GAMES,
      this.ISO,
      this.PREFIX,
      this.APP_FOLDERS,
      this.GALLERY,
      this.WINETRICKS,
      this.REPOSITORIES,
      this.SETTINGS,
      this.PLUGINS,
      this.SYSTEM,
    );
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public setWindow(window: BrowserWindow): void {
    this.window = window;

    for (const module of this.modules) {
      module.setWindow(window);
    }
  }
}