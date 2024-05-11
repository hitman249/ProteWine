import process from 'process';
import Utils from '../helpers/utils';
import {AbstractModule} from './abstract-module';
import FileSystem from './file-system';
import AppFolders from './app-folders';
import Command from './command';
import Update from './update';
import System from './system';
import Kernels from './kernels';
import WatchProcess from '../helpers/watch-process';
import Tasks from './tasks';
import {KernelOperation, SessionType} from './kernels/abstract-kernel';
import type CallbackTask from './tasks/callback-task';
import type {Progress} from './archiver';

export enum IsoEvents {
  MOUNT = 'mount',
  UNMOUNT = 'unmount',
  ERROR_UNMOUNT = 'error_unmount',
}

export default class Iso extends AbstractModule {
  private appFolders: AppFolders;
  private command: Command;
  private fs: FileSystem;
  private update: Update;
  private system: System;
  private kernels: Kernels;
  private tasks: Tasks;

  private readonly image: string;
  private mounted: boolean = false;
  private folder: string;
  private folderMounted: string;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, update: Update, system: System, kernels: Kernels, tasks: Tasks, image: string) {
    super();

    this.appFolders = appFolders;
    this.command = command;
    this.fs = fs;
    this.update = update;
    this.system = system;
    this.kernels = kernels;
    this.tasks = tasks;
    this.image = image;

    this.doUnmount = this.doUnmount.bind(this);
  }

  public async init(): Promise<any> {
    this.folder = (await this.kernels.getKernel().getDosDevicesDir()) + '/d:';
    this.folderMounted = (await this.appFolders.getCacheDir()) + '/iso';
    this.system.registerShutdownFunction(this.doUnmount);
  }

  private async doUnmount(): Promise<void> {
    let start: boolean = false;

    if (this.isMounted()) {
      start = true;
    }

    await this.unmount();

    if (start) {
      if (this.isMounted()) {
        this.fireEvent(IsoEvents.ERROR_UNMOUNT, {
          src: this.image,
          dest: this.folderMounted,
          basename: this.fs.basename(this.image),
        });
      } else {
        this.fireEvent(IsoEvents.UNMOUNT, {
          src: this.image,
          dest: this.folderMounted,
          basename: this.fs.basename(this.image),
        });
      }
    }
  }

  public isMounted(): boolean {
    return this.mounted;
  }

  public async mount(): Promise<void> {
    if (!(await this.fs.exists(this.image)) || this.isMounted()) {
      return Promise.resolve();
    }

    await this.unmount();

    if (this.isMounted()) {
      return;
    }

    if ((await this.fs.exists(this.image)) && !(await this.fs.exists(this.folderMounted))) {
      await this.fs.mkdir(this.folderMounted);
    }

    await this.tasks.wait();

    const process: WatchProcess = await this.tasks.kernel(
      'reg add "HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives" /v d: /d cdrom /f',
      KernelOperation.RUN,
      SessionType.RUN_IN_PREFIX,
    );

    await process.wait();

    this.mounted = true;

    await this.fuseIso();
    await this.fs.lnOfRoot(this.folderMounted, this.folder);

    this.fireEvent(IsoEvents.MOUNT, {
      src: this.image,
      dest: this.folderMounted,
      basename: this.fs.basename(this.image),
    });
  }

  public async unmount(): Promise<void> {
    if (await this.fs.exists(this.folder)) {
      await this.fs.rm(this.folder);
    }

    await this.tasks.wait();

    const process: WatchProcess = await this.tasks.kernel(
      'reg delete "HKEY_LOCAL_MACHINE\\Software\\Wine\\Drives" /v d: /f',
      KernelOperation.RUN,
      SessionType.RUN_IN_PREFIX,
    );

    await process.wait();

    if (!(await this.fs.exists(this.image)) || !(await this.fs.exists(this.folderMounted))) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let i = 0;

      let iterator = async (): Promise<void> => {
        if (i++ >= 9) {
          return resolve();
        }

        if (!this.isMounted() || (this.isMounted() && !await this.fs.exists(this.folderMounted))) {
          if (await this.fs.exists(this.folderMounted)) {
            await this.fs.rm(this.folderMounted);
          }

          this.mounted = false;

          return resolve();
        }

        if (await this.fs.exists(this.folderMounted)) {
          await this.command.exec(`fusermount -u "${this.folderMounted}"`);
          await this.killProcess();
          await this.fs.rm(this.folderMounted);

          if (await this.fs.exists(this.folder)) {
            await this.fs.rm(this.folder);
          }
        } else {
          this.mounted = false;
          return resolve();
        }

        return Utils.sleep(1000).then(() => iterator());
      };

      return iterator();
    });
  }

  public async fuseIso(): Promise<void> {
    await this.tasks.wait();

    const process: WatchProcess = await this.tasks.callback(async (task: CallbackTask): Promise<void> => {
      task.sendRun('Check "fuseiso".');

      await this.update.downloadFuseIso((value: Progress) => {
        task.sendProgress(value);
      });

      const fuseIso: string = await this.appFolders.getFuseIsoFile();
      const image: string = this.image;
      const dir: string = this.folderMounted;
      const cmd: string = `"${fuseIso}" -p "${image}" "${dir}"`;

      task.sendLog('Mount game image.');
      task.sendLog(cmd);

      await this.command.exec(cmd);

      task.sendExit();
    });

    await process.wait();
  }

  public async size(): Promise<number> {
    if (this.isMounted()) {
      return this.fs.size(this.image);
    }

    return this.fs.size(this.folderMounted);
  }

  public getFolder(): string {
    return this.folder;
  }

  public getFolderMounted(): string {
    return this.folderMounted;
  }

  public getImageFile(): string {
    return this.image;
  }

  public async killProcess(): Promise<boolean> {
    let pid: number | string = await this.command.exec(`pidof "${await this.appFolders.getFuseIsoFile()}"`);

    if (!pid || !/^[0-9]+$/.test(pid)) {
      return false;
    }

    pid = parseInt(pid);

    try {
      process.kill(-pid);
    } catch (e) {
      try {
        process.kill(pid);
      } catch (e) {
      }
    }
  }
}