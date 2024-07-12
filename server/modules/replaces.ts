import {AbstractModule} from './abstract-module';
import type AppFolders from './app-folders';
import type System from './system';
import type FileSystem from './file-system';
import type Monitor from './monitor';
import type {Resolution} from './monitor';
import type Kernels from './kernels';
import type {Kernel} from './kernels';

export type ReplacesType = {
  '{HOSTNAME}': string,
  '{DRIVE_C}': string,
  '{WIDTH}': number,
  '{HEIGHT}': number,
  '{DOSDEVICES}': string,
  '{PREFIX}': string,
  '{ROOT_DIR}': string,
  '{USER}': string
};

export default class Replaces extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly system: System;
  private readonly fs: FileSystem;
  private readonly monitor: Monitor;
  private readonly kernels: Kernels;

  constructor(appFolders: AppFolders, system: System, fs: FileSystem, monitor: Monitor, kernels: Kernels) {
    super();

    this.appFolders = appFolders;
    this.system = system;
    this.fs = fs;
    this.monitor = monitor;
    this.kernels = kernels;
  }

  public async init(): Promise<void> {

  }

  public async getReplaces(): Promise<ReplacesType> {
    const kernel: Kernel = this.kernels.getKernel();
    const resolution: Resolution = await this.monitor.getResolution();

    return {
      '{WIDTH}': resolution.width,
      '{HEIGHT}': resolution.height,
      '{USER}': await kernel.getUserName(),
      '{HOSTNAME}': await this.system.getHostname(),
      '{PREFIX}': await kernel.getPrefixDir(),
      '{DRIVE_C}': await kernel.getDriveCDir(),
      '{DOSDEVICES}': await kernel.getDosDevicesDir(),
      '{ROOT_DIR}': await this.appFolders.getRootDir(),
    };
  }

  public async replaceByString(text: string): Promise<string> {
    let replaces: ReplacesType = await this.getReplaces();

    for (const mask of Object.keys(replaces) as Array<keyof ReplacesType>) {
      const value: string = String(replaces[mask]);
      text = text.split(mask).join(value);
    }

    return text;
  }

  public async replaceByFile(path: string, backup: boolean = false): Promise<boolean> {
    if (backup) {
      const backupPath: string = `${path}.backup`;

      if (!await this.fs.exists(backupPath)) {
        await this.fs.cp(path, backupPath);
      }

      if (await this.fs.exists(backupPath)) {
        const text: string = await this.fs.fileGetContents(backupPath, true);
        await this.fs.filePutContents(path, await this.replaceByString(text));

        return true;
      }
    } else if (await this.fs.exists(path)) {
      const text: string = await this.fs.fileGetContents(path, true);
      await this.fs.filePutContents(path, await this.replaceByString(text));

      return true;
    }

    return false;
  }

  public async replaceToTemplateByString(text: string): Promise<string> {
    const kernel: Kernel = this.kernels.getKernel();
    const username: string = await kernel.getUserName();
    const hostname: string = await this.system.getHostname();
    const root: string = await this.appFolders.getRootDir();

    const replaces: {[mask: string]: string} = {
      [root]: '{ROOT_DIR}',

      [`'${username}'`]: '\'{USER}\'',
      [`"${username}"`]: '"{USER}"',
      [`/${username}/`]: '/{USER}/',
      [`\\${username}\\`]: '\\{USER}\\',

      [`'${hostname}'`]: '\'{HOSTNAME}\'',
      [`"${hostname}"`]: '"{HOSTNAME}"',
      [`/${hostname}/`]: '/{HOSTNAME}/',
      [`\\${hostname}\\`]: '\\{HOSTNAME}\\',
    };

    for (const mask of Object.keys(replaces)) {
      text = text.split(mask).join(replaces[mask]);
    }

    return text;
  }
}