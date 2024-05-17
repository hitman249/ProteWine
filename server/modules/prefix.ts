import Utils from '../helpers/utils';
import {AbstractModule} from './abstract-module';
import {KernelOperation, SessionType} from './kernels/abstract-kernel';
import type Command from './command';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import type Tasks from './tasks';
import type Settings from './settings';
import type Kernels from './kernels';
import type {Kernel} from './kernels';
import type System from './system';
import type WatchProcess from '../helpers/watch-process';
import type {Progress} from './archiver';

export default class Prefix extends AbstractModule {
  private readonly command: Command;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly kernels: Kernels;
  private readonly tasks: Tasks;
  private readonly settings: Settings;
  private readonly system: System;

  private processed: boolean = false;
  private itemsComplete: number = 0;
  private itemsCount: number = 6;
  private lastProgress: Progress;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, kernels: Kernels, tasks: Tasks, settings: Settings, system: System) {
    super();

    this.command = command;
    this.appFolders = appFolders;
    this.fs = fs;
    this.kernels = kernels;
    this.tasks = tasks;
    this.settings = settings;
    this.system = system;
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

      if ('c:' !== name) {
        await this.fs.rm(device);
      }
    }

    for await (const path of await this.fs.glob(`${await kernel.getDriveCDir()}/users/${await kernel.getUserName()}/*`)) {
      if (await this.fs.isSymbolicLink(path)) {
        await this.fs.rm(path);
        await this.fs.mkdir(path);
      }
    }

    await this.run(
      'reg delete "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Desktop\\Namespace\\{9D20AAE8-0625-44B0-9CA7-71889C2254D9}" /va /f',
    );


    this.sendProgress('Folders configuration', 60);

    /**
     * Create folders symlink
     */
    await this.updateFolders();


    this.sendProgress('Windows Version configuration', 70);

    /**
     * Set Windows Version
     */
    await this.updateWindowsVersion();


    this.sendProgress('Sound configuration', 80);

    /**
     * Set Pulse or Alsa
     */
    await this.updateSound();

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

  private async run(cmd: string): Promise<void> {
    const process: WatchProcess = await this.tasks.kernel(cmd, KernelOperation.INSTALL, SessionType.RUN_IN_PREFIX);
    await process.wait();
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
  }

  private async updateSound(): Promise<void> {
    const kernel: Kernel = this.kernels.getKernel();

    const pulse: boolean | undefined = await kernel.getMetadata('sound') as boolean | undefined;
    const newPulse: boolean = this.settings.isPulse() && await this.system.isPulse();

    if (pulse !== newPulse) {
      let regs: string[] = [
        "Windows Registry Editor Version 5.00\n",
        "[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n",
      ];

      const path: string = `${(await kernel.getDriveCDir())}/sound.reg`;

      if (newPulse) {
        regs.push('"Audio"="pulse"\n');
      } else {
        regs.push('"Audio"="alsa"\n');
      }

      await this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
      await this.run(`regedit "${path}"`);
      await kernel.setMetadata('sound', newPulse);
    }
  }

  private async updateWindowsVersion(): Promise<void> {
    const kernel: Kernel = this.kernels.getKernel();

    const windowsVersion: string = await kernel.getMetadata('windowsVersion') as string;
    const newWindowsVersion: string = this.settings.getWindowsVersion();

    if (windowsVersion !== newWindowsVersion) {
      let regs: string[] = [
        'Windows Registry Editor Version 5.00\n',
      ];

      let path: string = `${await kernel.getDriveCDir()}/windowsVersion.reg`;
      let append: {[key: string]: {[key: string]: string}} = {};

      switch (newWindowsVersion) {
        case 'win2k':
          await this.run('reg delete "HKLM\\System\\CurrentControlSet\\Control\\ProductOptions" /v ProductType /f');
          append = {
            'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
              'CSDVersion': 'Service Pack 4',
              'CurrentBuildNumber': '2195',
              'CurrentVersion': '5.0',
            },
            'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows': {
              'CSDVersion': 'dword:00000400',
            },
          };
          break;

        case 'winxp':
          await this.run('reg delete "HKLM\\System\\CurrentControlSet\\Control\\ProductOptions" /v ProductType /f');
          append = {
            'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
              'CSDVersion': 'Service Pack 3',
              'CurrentBuildNumber': '2600',
              'CurrentVersion': '5.1',
            },
            'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows': {
              'CSDVersion': 'dword:00000300',
            },
          };
          break;

        case 'win10':
          await this.run('reg add "HKLM\\System\\CurrentControlSet\\Control\\ProductOptions" /v ProductType /d WinNT /f');
          append = {
            'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
              'CSDVersion': '',
              'CurrentBuildNumber': '10240',
              'CurrentVersion': '10.0',
            },
            'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows': {
              'CSDVersion': 'dword:00000300',
            },
          };
          break;

        case 'win7':
        default:
          await this.run('reg add "HKLM\\System\\CurrentControlSet\\Control\\ProductOptions" /v ProductType /d WinNT /f');
          append = {
            'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion': {
              'CSDVersion': 'Service Pack 1',
              'CurrentBuildNumber': '7601',
              'CurrentVersion': '6.1',
            },
            'HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows': {
              'CSDVersion': 'dword:00000100',
            },
          };
      }

      Object.keys(append).forEach((path: string): void => {
        regs.push(`\n[${path}]\n`);

        Object.keys(append[path]).forEach(field => {
          let value: string = append[path][field];
          regs.push(`"${field}"="${value}"`);
        });
      });

      await this.fs.filePutContents(path, Utils.encode(regs.join('\n'), 'utf-16'));
      await this.run(`regedit "${path}"`);
      await kernel.setMetadata('windowsVersion', newWindowsVersion);
    }
  }
}