import {AbstractModule} from '../../../../server/modules/abstract-module';
import FileSystem from './modules/file-system';
import Kernel from './modules/kernel';
import Tasks from './modules/tasks';
import Games from './modules/games';
import Iso from './modules/iso';
import Prefix from './modules/prefix';
import AppFolders from './modules/app-folders';
import Gallery from './modules/gallery';
import WineTricks from './modules/winetricks';
import Repositories from './modules/repositories';
import Settings from './modules/settings';
import Plugins from './modules/plugins';
import System from './modules/system';
import Update from './modules/update';
import NativeKeyboard from './modules/native-keyboard';
import Layers from './modules/layers';

export default class Api extends AbstractModule {
  private readonly FILE_SYSTEM: FileSystem = new FileSystem();
  private readonly KERNEL: Kernel = new Kernel();
  private readonly TASKS: Tasks = new Tasks();
  private readonly GAMES: Games = new Games();
  private readonly ISO: Iso = new Iso();
  private readonly PREFIX: Prefix = new Prefix();
  private readonly APP_FOLDERS: AppFolders = new AppFolders();
  private readonly GALLERY: Gallery = new Gallery();
  private readonly WINETRICKS: WineTricks = new WineTricks();
  private readonly REPOSITORIES: Repositories = new Repositories();
  private readonly SETTINGS: Settings = new Settings();
  private readonly PLUGINS: Plugins = new Plugins();
  private readonly SYSTEM: System = new System();
  private readonly UPDATE: Update = new Update();
  private readonly LAYERS: Layers = new Layers();
  private readonly NATIVE_KEYBOARD: NativeKeyboard = new NativeKeyboard();

  private readonly modules: AbstractModule[] = [
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
    this.UPDATE,
    this.LAYERS,
    this.NATIVE_KEYBOARD,
  ];

  public async init(): Promise<any> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public getFileSystem(): FileSystem {
    return this.FILE_SYSTEM;
  }

  public getKernel(): Kernel {
    return this.KERNEL;
  }

  public getTasks(): Tasks {
    return this.TASKS;
  }

  public getGames(): Games {
    return this.GAMES;
  }

  public getIso(): Iso {
    return this.ISO;
  }

  public getPrefix(): Prefix {
    return this.PREFIX;
  }

  public getGallery(): Gallery {
    return this.GALLERY;
  }

  public getWineTricks(): WineTricks {
    return this.WINETRICKS;
  }

  public getRepositories(): Repositories {
    return this.REPOSITORIES;
  }

  public getSettings(): Settings {
    return this.SETTINGS;
  }

  public getPlugins(): Plugins {
    return this.PLUGINS;
  }

  public getSystem(): System {
    return this.SYSTEM;
  }

  public getUpdate(): Update {
    return this.UPDATE;
  }

  public getLayers(): Layers {
    return this.LAYERS;
  }

  public getNativeKeyboard(): NativeKeyboard {
    return this.NATIVE_KEYBOARD;
  }

  public getAppFolders(): AppFolders {
    return this.APP_FOLDERS;
  }
}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>,
      receive: (channel: string, listener: (...args: any[]) => void) => void,
      send: (channel: string, ...args: any[]) => void,
    };
  }
}