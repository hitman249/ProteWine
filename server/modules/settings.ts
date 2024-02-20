import {AbstractModule} from './abstract-module';
import Utils from '../helpers/utils';
import type AppFolders from './app-folders';
import type Command from './command';
import type FileSystem from './file-system';
import type System from './system';
import type Kernels from './kernels';
import type {Kernel} from './kernels';

export default class Settings extends AbstractModule {
  private readonly path: string = '/data/configs/settings.json';
  private config: {};

  private readonly appFolders: AppFolders;
  private readonly command: Command;
  private readonly fs: FileSystem;
  private readonly system: System;
  private readonly kernels: Kernels;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, system: System, kernels: Kernels) {
    super();

    this.appFolders = appFolders;
    this.command = command;
    this.fs = fs;
    this.system = system;
    this.kernels = kernels;
  }

  public async init(): Promise<any> {
    await this.load();
  }

  private async load(): Promise<void> {
    const path: string = await this.getPath();

    if (!this.config && await this.fs.exists(path)) {
      this.config = Utils.jsonDecode(await this.fs.fileGetContents(path));
    }

    if (!this.config) {
      this.config = this.getDefaultConfig();
    }
  }

  public async save(): Promise<void> {
    const path: string = await this.getPath();

    if (!this.config) {
      await this.load();
    }

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }

    return this.fs.filePutContents(path, Utils.jsonEncode(this.config));
  }

  private async getPath(): Promise<string> {
    return (await this.appFolders.getRootDir()) + this.path;
  }

  public getKernel(): Kernel {
    return this.kernels.getKernel();
  }

  public getDefaultConfig(): {} {
    return {
      windowsVersion: 'win7',  // Windows version (win11, win10, win7, winxp, win2k),
      plugins: {
        dxvk: false,
        d8vk: false,
        d3d8to9: false,
        vkd3dProton: false,
        mf: false,
        cncDdraw: false,
        dgVoodoo2: false,
        isskin: false,
        mono: true,
        gecko: true,
        gstreamer: true,
      },
      libs: {
        mangohud: false,
      },
      fixes: {
        focus: false,          // Fix focus
        noCrashDialog: false,  // No crash dialog
        wineMenuBuilder: false,
      },
    };
  }

  public getDefaultSaveFolders(): {} {
    return {
      'Documents': 'users/{USER}/Documents',
      'Documents Extra': 'users/{USER}/Мои документы',
      'Documents Public': 'users/Public/Documents',
      'Documents Public Extra': 'users/Public/Мои документы',
      'Application Data': 'users/{USER}/Application Data',
      'Local Settings': 'users/{USER}/Local Settings',
    };
  }
}