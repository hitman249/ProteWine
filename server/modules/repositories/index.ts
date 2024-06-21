import {AbstractModule} from '../abstract-module';
import AbstractRepository from './abstract-repository';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Network from '../network';
import type System from '../system';
import type Tasks from '../tasks';
import type {App} from '../../app';
import type Kernels from '../kernels';
import Kron4ek from './kron4ek';
import ProtonGE from './proton-ge';
import Lutris from './lutris';
import WineGE from './wine-ge';
import BottlesDevs from './bottles-devs';
import Steam from './steam';
import Archiver, {ArchiverEvent, Progress} from '../archiver';
import {RepositoriesEvent} from './types';
import Utils from '../../helpers/utils';

export type ItemType = {
  name: string,
  type: 'file' | 'dir' | 'repository',
  url?: string,
  path?: string,
  items?: ItemType[],
};

export default class Repositories extends AbstractModule {
  private readonly KRON4EK: Kron4ek;
  private readonly PROTON_GE: ProtonGE;
  private readonly LUTRIS: Lutris;
  private readonly WINE_GE: WineGE;
  private readonly BOTTLES_DEVS: BottlesDevs;
  private readonly STEAM: Steam;

  private readonly modules: AbstractRepository[] = [];

  protected readonly appFolders: AppFolders;
  protected readonly fs: FileSystem;
  protected readonly network: Network;
  protected readonly system: System;
  protected readonly tasks: Tasks;
  protected readonly kernels: Kernels;
  protected readonly app: App;

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network, system: System, tasks: Tasks, kernels: Kernels, app: App) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.network = network;
    this.system = system;
    this.tasks = tasks;
    this.kernels = kernels;
    this.app = app;

    this.KRON4EK = new Kron4ek(appFolders, fs, network, system);
    this.PROTON_GE = new ProtonGE(appFolders, fs, network, system);
    this.LUTRIS = new Lutris(appFolders, fs, network, system);
    this.WINE_GE = new WineGE(appFolders, fs, network, system);
    this.BOTTLES_DEVS = new BottlesDevs(appFolders, fs, network, system);
    this.STEAM = new Steam(appFolders, fs, network, system);

    this.modules.push(
      this.KRON4EK,
      this.PROTON_GE,
      this.LUTRIS,
      this.WINE_GE,
      this.BOTTLES_DEVS,
      this.STEAM,
    );
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public async getListByName(name: string): Promise<ItemType[]> {
    for await (const module of this.modules) {
      if (module.getName() === name) {
        return module.getList();
      }
    }
  }

  public async getList(): Promise<ItemType[]> {
    const results: ItemType[] = [];

    for await (const module of this.modules) {
      results.push({
        name: module.getName(),
        type: 'repository',
      });
    }

    return results;
  }

  private async download(url: string, progress?: (value: Progress) => void): Promise<string> {
    const cacheDir: string = await this.appFolders.getCacheDir();
    const filename: string = this.fs.basename(url);
    const dest: string = `${cacheDir}/${filename}`;

    return this.network.download(url, dest, progress).then(() => dest);
  }

  public async install(url: string): Promise<void> {
    const progress: (value: Progress) => void = (value: Progress) => this.fireEvent(RepositoriesEvent.PROGRESS, value);
    const isPath: boolean = await this.fs.exists(url);
    const wine: string = await this.appFolders.getWineDir();
    const filename: string = this.fs.basename(url);

    const chmod: () => Promise<void> = async (): Promise<void> => {
      const dirs: string[] = [
        `${wine}/bin`,
        `${wine}/proton`,
        `${wine}/files/bin`,
      ];

      for await (const dir of dirs) {
        if (await this.fs.exists(dir)) {
          await this.fs.chmod(dir);
        }
      }
    };

    const removeWine: () => Promise<void> = async (): Promise<void> => {
      if (await this.fs.exists(wine)) {
        await this.fs.rm(wine);
      }
    };

    const setWineVersion: () => Promise<void> = async (): Promise<void> => {
      this.fireEvent(RepositoriesEvent.LOG, 'Update runner version.');

      await this.kernels.init();
      const version: string = await this.kernels.getKernel().version();

      if (version) {
        await this.fs.filePutContents(`${wine}/runner`, version);
      }
    };

    if (isPath) {
      this.fireEvent(RepositoriesEvent.RUN, 'Copy');
      await removeWine();
      await this.fs.cp(url, wine, undefined, progress);
      await setWineVersion();
      await chmod();
      this.fireEvent(RepositoriesEvent.EXIT);

      return;
    }

    this.fireEvent(RepositoriesEvent.RUN, `Downloading "${filename}".`);

    const src: string = await this.download(url, progress);
    const dest: string = await this.fs.createTmpDir();

    this.fireEvent(RepositoriesEvent.LOG, 'Extract archive.');

    const archiver: Archiver = new Archiver(this.fs, src, dest);
    archiver.on(ArchiverEvent.PROGRESS, (event: ArchiverEvent.PROGRESS, data: Progress) => progress(data));
    await (await archiver.unpack()).getProcess()?.wait();
    archiver.removeAllListeners();

    if (await this.fs.exists(src)) {
      await this.fs.rm(src);
    }

    const path: string = await this.findWineProtonDir(dest);

    if (!path) {
      this.fireEvent(RepositoriesEvent.ERROR, 'Wine \\ Proton distribution not found inside archive.');
      this.fireEvent(RepositoriesEvent.EXIT);

      if (await this.fs.exists(dest)) {
        await this.fs.rm(dest);
      }

      return;
    }

    await removeWine();
    await this.fs.mv(path, wine, undefined, progress);

    if (await this.fs.exists(dest)) {
      await this.fs.rm(dest);
    }

    await setWineVersion();
    await chmod();

    this.fireEvent(RepositoriesEvent.EXIT);
  }

  private async findWineProtonDir(path: string): Promise<string> {
    const files: string[] = [
      `${path}/bin/wine`,
      `${path}/bin/wine64`,
      `${path}/proton`,
      `${path}/files/bin/wine`,
      `${path}/files/bin/wine64`,
    ];

    for await (const file of files) {
      if ((await this.fs.exists(file)) && (await this.fs.isFile(file))) {
        return path;
      }
    }

    const items: string[] = await this.fs.glob(`${path}/*`);

    for await (const item of items) {
      if (await this.fs.isDirectory(item)) {
        const find: string = await this.findWineProtonDir(item);

        if (find) {
          return find;
        }
      }
    }
  }

  public getKron4ek(): Kron4ek {
    return this.KRON4EK;
  }

  public getLutris(): Lutris {
    return this.LUTRIS;
  }

  public getProtonGE(): ProtonGE {
    return this.PROTON_GE;
  }

  public getWineGE(): WineGE {
    return this.WINE_GE;
  }

  public getBottlesDevs(): BottlesDevs {
    return this.BOTTLES_DEVS;
  }

  public getSteam(): Steam {
    return this.STEAM;
  }
}