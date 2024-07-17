import _ from 'lodash';
import {AbstractModule} from './abstract-module';
import {KernelOperation} from './kernels/abstract-kernel';
import type Command from './command';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import type Tasks from './tasks';
import type Kernels from './kernels';
import type {Kernel} from './kernels';
import type WatchProcess from '../helpers/watch-process';
import type {Progress} from './archiver';
import type Layers from './layers';

export default class Prefix extends AbstractModule {
  private readonly command: Command;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly kernels: Kernels;
  private readonly tasks: Tasks;
  private readonly layers: Layers;

  private processed: boolean = false;
  private itemsComplete: number = 0;
  private itemsCount: number = 6;
  private lastProgress: Progress;
  private registry: string[] = [];

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, kernels: Kernels, tasks: Tasks, layers: Layers) {
    super();

    this.command = command;
    this.appFolders = appFolders;
    this.fs = fs;
    this.kernels = kernels;
    this.tasks = tasks;
    this.layers = layers;
  }

  public async init(): Promise<any> {

  }

  public setProcessed(value: boolean): void {
    this.processed = value;
  }

  private sendProgress(name: string, progress: number, success: boolean = false): void {
    this.lastProgress = {
      success,
      progress,
      totalBytes: 0,
      transferredBytes: 0,
      totalBytesFormatted: '',
      transferredBytesFormatted: '',
      itemsComplete: ++this.itemsComplete,
      itemsCount: this.itemsCount,
      path: '',
      name,
      event: 'prefix',
    } as Progress;

    this.sendLastProgress();
  }

  public sendLastProgress(): void {
    if (this.lastProgress) {
      this.tasks.sendProgress(this.lastProgress);
    }
  }

  public async create(): Promise<void> {
    this.processed = true;
    this.itemsComplete = 0;
    this.lastProgress = undefined;
    this.registry = [];

    this.tasks.sendBus({
      event: 'creating',
      module: 'prefix',
      value: undefined,
    });

    this.sendProgress('Creating prefix', 10);
    await this.createPrefix();


    this.sendProgress('Creating metadata', 30);
    const kernel: Kernel = this.kernels.getKernel();
    await kernel.setMetadata('kernel', await kernel.version());
    await kernel.setMetadata('arch', 'win64');


    this.sendProgress('Sandbox configuration', 40);

    /**
     * Sandbox disable
     */
    const timestamp: string = (await kernel.getPrefixDir()) + '/.update-timestamp';

    if ((await this.fs.exists(timestamp)) && 'disable' === (await this.fs.fileGetContents(timestamp))) {
      return;
    }

    await this.fs.filePutContents(timestamp, 'disable');

    for await (const device of await this.fs.glob(`${await kernel.getDosDevicesDir()}/*`)) {
      const name: string = this.fs.basename(device);

      if ('c:' !== name && 'z:' !== name) {
        await this.fs.rm(device);
      }
    }

    for await (const path of await this.fs.glob(`${await kernel.getDriveCDir()}/users/${await kernel.getUserName()}/*`)) {
      if (await this.fs.isSymbolicLink(path)) {
        await this.fs.rm(path);
        await this.fs.mkdir(path);
      }
    }

    this.registry.push(
      "[-HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}]\n"
    );

    this.sendProgress('Folders configuration', 60);

    /**
     * Create folders symlink
     */
    await this.updateFolders();

    /**
     * Install layers
     */
    this.sendProgress('Install layers', 70);

    await this.layers.install();

    this.sendProgress('Registry', 80);

    this.registry.push(...await this.layers.getRegistry());

    this.sendProgress('Install plugins', 85);

    const process: WatchProcess = await this.tasks.installPlugins(this.registry);
    await process.wait();

    this.processed = false;

    this.sendProgress('', 100, true);

    this.tasks.sendBus({
      event: 'created',
      module: 'prefix',
      value: undefined,
    });
  }

  public async isExist(): Promise<boolean> {
    return await this.fs.exists(await this.appFolders.getPrefixDir());
  }

  public isProcessed(): boolean {
    return this.processed;
  }

  public async refresh(): Promise<void> {
    await this.deletePrefix();
    await this.create();
  }

  private async createPrefix(): Promise<WatchProcess> {
    const process: WatchProcess = await this.tasks.kernel('', KernelOperation.CREATE_PREFIX);
    await process.wait();

    return process;
  }

  private async deletePrefix(): Promise<void> {
    return this.kernels.getKernel().deletePrefix();
  }

  private async updateFolders(): Promise<void> {
    const kernel: Kernel = this.kernels.getKernel();

    const gamesDir: string = await this.appFolders.getGamesDir();
    const logsDir: string = await this.appFolders.getLogsDir();
    const cacheDir: string = await this.appFolders.getCacheDir();
    const prefixGamesDir: string = await kernel.getGamesDir();
    const prefixLogsDir: string = await kernel.getLogsDir();
    const prefixCacheDir: string = await kernel.getCacheDir();

    if ((await this.fs.exists(await kernel.getPrefixDir())) && await this.fs.exists(prefixGamesDir)) {
      return;
    }

    await this.fs.lnOfRoot(gamesDir, prefixGamesDir);
    await this.fs.lnOfRoot(logsDir, prefixLogsDir);
    await this.fs.lnOfRoot(cacheDir, prefixCacheDir);

    const savesDir: string = await this.appFolders.getSavesDir();
    const driveC: string = await kernel.getDriveCDir();
    const user: string = await kernel.getUserName();
    const userDir: string = `${driveC}/users/${user}`;

    if (await this.fs.exists(savesDir)) {
      await this.fs.rm(userDir);
    } else {
      await this.fs.mv(userDir, savesDir);
    }

    await this.fs.lnOfRoot(savesDir, userDir);

    for await (const path of await this.fs.glob(`${savesDir}/**`)) {
      if ((await this.fs.isSymbolicLink(path)) && (await this.fs.isDirectory(path))) {
        const link: string = await this.fs.readSymbolicLink(path);

        if (link && (_.startsWith(link, '/') || _.startsWith(link, '~/'))) {
          await this.fs.rm(path);
          await this.fs.mkdir(path);
        }
      }
    }
  }
}