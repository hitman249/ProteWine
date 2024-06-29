import type {AbstractModule} from './modules/abstract-module';
import type WatchProcess from './helpers/watch-process';
import AppFolders from './modules/app-folders';
import Command from './modules/command';
import Driver from './modules/driver';
import FileSystem from './modules/file-system';
import GlobalCache from './modules/global-cache';
import Monitor from './modules/monitor';
import Network from './modules/network';
import System from './modules/system';
import Update from './modules/update';
import Kernels from './modules/kernels';
import Settings from './modules/settings';
import Mount from './modules/mount';
import LinkInfo from './modules/link-info';
import Tasks from './modules/tasks';
import Games from './modules/games';
import Iso from './modules/iso';
import Prefix from './modules/prefix';
import Gallery from './modules/gallery';
import WineTricks from './modules/winetricks';
import Environment from './modules/kernels/environment';
import Repositories, {type ItemType} from './modules/repositories';
import Plugins from './modules/plugins';
import Icon from './modules/icon';
import Config from './modules/games/config';

export class App {
  private readonly initOrder: AbstractModule[];

  private readonly COMMAND: Command;
  private readonly APP_FOLDERS: AppFolders;
  private readonly FILE_SYSTEM: FileSystem;
  private readonly NETWORK: Network;
  private readonly UPDATE: Update;
  private readonly CACHE: GlobalCache;
  private readonly SYSTEM: System;
  private readonly DRIVER: Driver;
  private readonly MONITOR: Monitor;
  private readonly KERNELS: Kernels;
  private readonly SETTINGS: Settings;
  private readonly LINK_INFO: LinkInfo;
  private readonly TASKS: Tasks;
  private readonly GAMES: Games;
  private readonly PREFIX: Prefix;
  private readonly GALLERY: Gallery;
  private readonly WINETRICKS: WineTricks;
  private readonly REPOSITORIES: Repositories;
  private readonly PLUGINS: Plugins;
  private MOUNT_WINE: Mount;
  private MOUNT_DATA: Mount;


  constructor() {
    this.COMMAND = new Command();
    this.NETWORK = new Network();
    this.APP_FOLDERS = new AppFolders();
    this.GALLERY = new Gallery();
    this.FILE_SYSTEM = new FileSystem(this.APP_FOLDERS);
    this.CACHE = new GlobalCache(this.APP_FOLDERS);
    this.SYSTEM = new System(this.APP_FOLDERS, this.CACHE, this);
    this.DRIVER = new Driver(this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    this.UPDATE = new Update(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK, this.COMMAND);
    this.MONITOR = new Monitor(this.APP_FOLDERS, this.COMMAND, this.SYSTEM, this.FILE_SYSTEM);
    this.KERNELS = new Kernels(this.SYSTEM, this);
    this.SETTINGS = new Settings(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.SYSTEM);
    this.LINK_INFO = new LinkInfo(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.KERNELS);
    this.TASKS = new Tasks(this.COMMAND, this.KERNELS, this.FILE_SYSTEM, this);
    this.GAMES = new Games(this.APP_FOLDERS, this.FILE_SYSTEM, this.SETTINGS, this.NETWORK, this.TASKS, this.MONITOR, this);
    this.PREFIX = new Prefix(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.KERNELS, this.TASKS, this.SETTINGS, this.SYSTEM);
    this.WINETRICKS = new WineTricks(this.APP_FOLDERS, this.FILE_SYSTEM, this.UPDATE);
    this.REPOSITORIES = new Repositories(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK, this.SYSTEM, this.TASKS, this.KERNELS, this);
    this.PLUGINS = new Plugins(this.APP_FOLDERS, this.FILE_SYSTEM, this.NETWORK, this.SYSTEM, this.TASKS, this.KERNELS, this, this.SETTINGS);

    this.initOrder = [
      this.COMMAND,
      this.NETWORK,
      this.APP_FOLDERS,
      this.FILE_SYSTEM,
      this.UPDATE,
      this.CACHE,
      this.SYSTEM,
      this.DRIVER,
      this.MONITOR,
      this.KERNELS,
      this.SETTINGS,
      this.LINK_INFO,
      this.TASKS,
      this.GAMES,
      this.PREFIX,
      this.GALLERY,
      this.WINETRICKS,
      this.REPOSITORIES,
      this.PLUGINS,
    ];
  }

  public async init(): Promise<any> {
    this.MOUNT_WINE = new Mount(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, await this.APP_FOLDERS.getWineDir());
    this.MOUNT_DATA = new Mount(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, await this.APP_FOLDERS.getGamesDir());

    this.initOrder.push(this.MOUNT_WINE);
    this.initOrder.push(this.MOUNT_DATA);

    for await (const module of this.initOrder) {
      await module.init();
    }

    await this.APP_FOLDERS.create();
    await this.MOUNT_WINE.mount();
    await this.MOUNT_DATA.mount();

    await this.UPDATE.downloadBar();
    await this.UPDATE.downloadLinkInfo();

    if (!await this.KERNELS.getKernel().existDir()) {
      const fetchWine = async () => {
        const dirs: ItemType[] = await this.REPOSITORIES.getKron4ek().getList();

        for await (const dir of dirs) {
          if (dir.items.length > 0 && dir.items[0].url) {
            const process: WatchProcess = await this.TASKS.installRunner(dir.items[0].url);
            await process.wait();
            await this.KERNELS.init();
            break;
          }
        }

        if (!await this.PREFIX.isExist()) {
          this.PREFIX.setProcessed(true);
          this.PREFIX.create().then(() => undefined);
        }
      };

      this.PREFIX.setProcessed(true);

      fetchWine();
    } else {
      if (!await this.PREFIX.isExist()) {
        this.PREFIX.setProcessed(true);
        this.PREFIX.create().then(() => undefined);
      }
    }
  }

  public async createIso(path: string): Promise<Iso> {
    const iso: Iso = new Iso(this.APP_FOLDERS, this.COMMAND, this.FILE_SYSTEM, this.UPDATE, this.SYSTEM, this.KERNELS, this.TASKS, path);
    await iso.init();

    return iso;
  }

  public async createEnv(): Promise<Environment> {
    const env: Environment = new Environment(this.APP_FOLDERS, this.COMMAND, this.DRIVER);
    await env.init();

    return env;
  }

  public async createIcon(config: Config): Promise<Icon> {
    const icon: Icon = new Icon(config, this.APP_FOLDERS, this.FILE_SYSTEM, this.SYSTEM, this.COMMAND);
    await icon.init();

    return icon;
  }

  public getCommand(): Command {
    return this.COMMAND;
  }

  public getAppFolders(): AppFolders {
    return this.APP_FOLDERS;
  }

  public getFileSystem(): FileSystem {
    return this.FILE_SYSTEM;
  }

  public getCache(): GlobalCache {
    return this.CACHE;
  }

  public getSystem(): System {
    return this.SYSTEM;
  }

  public getDriver(): Driver {
    return this.DRIVER;
  }

  public getMonitor(): Monitor {
    return this.MONITOR;
  }

  public getNetwork(): Network {
    return this.NETWORK;
  }

  public getUpdate(): Update {
    return this.UPDATE;
  }

  public getKernels(): Kernels {
    return this.KERNELS;
  }

  public getSettings(): Settings {
    return this.SETTINGS;
  }

  public getLinkInfo(): LinkInfo {
    return this.LINK_INFO;
  }

  public getTasks(): Tasks {
    return this.TASKS;
  }

  public getGames(): Games {
    return this.GAMES;
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

  public getPlugins(): Plugins {
    return this.PLUGINS;
  }

  public getMountWine(): Mount {
    return this.MOUNT_WINE;
  }

  public getMountData(): Mount {
    return this.MOUNT_DATA;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var $app: App;
}

global.$app = new App();

export default global.$app;