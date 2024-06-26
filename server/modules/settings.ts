import _ from 'lodash';
import Utils from '../helpers/utils';
import {AbstractModule} from './abstract-module';
import type AppFolders from './app-folders';
import type Command from './command';
import type FileSystem from './file-system';
import type System from './system';

export type SettingsType = {
  windowsVersion: 'winxp' | 'win7' | 'win10',
  plugins: {
    dxvk: boolean,
    vkd3dProton: boolean,
    isskin: boolean,
    d8vk: boolean,
    d3d8to9: boolean,
    mf: boolean,
    cncDdraw: boolean,
    dgVoodoo2: boolean,
    mono: boolean,
    gecko: boolean,
    gstreamer: boolean,
  },
  libs: {
    mangohud: boolean,
  },
  fixes: {
    pulse: boolean,
    focus: boolean,
    noCrashDialog: boolean,
    mouseWarpOverride: 'enable' | 'disable' | 'force',
  },
};

export default class Settings extends AbstractModule {
  private readonly path: string = '/data/configs/settings.json';
  private config: SettingsType;

  private readonly appFolders: AppFolders;
  private readonly command: Command;
  private readonly fs: FileSystem;
  private readonly system: System;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, system: System) {
    super();

    this.appFolders = appFolders;
    this.command = command;
    this.fs = fs;
    this.system = system;
  }

  public async init(): Promise<any> {
    await this.load();
  }

  private async load(): Promise<void> {
    const path: string = await this.getPath();

    if (await this.fs.exists(path)) {
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

  public getWindowsVersion(): string {
    return this.get('windowsVersion', 'win7') as string;
  }

  public isPulse(): boolean {
    return this.get('fixes.pulse', true) as boolean;
  }

  public isFocus(): boolean {
    return this.get('fixes.focus', false) as boolean;
  }

  public isNoCrashDialog(): boolean {
    return this.get('fixes.noCrashDialog', false) as boolean;
  }

  public isDxvk(): boolean {
    return this.get('plugins.dxvk', true) as boolean;
  }

  public isIsskin(): boolean {
    return this.get('plugins.isskin', true) as boolean;
  }

  public isCncDdraw(): boolean {
    return this.get('plugins.cncDdraw', true) as boolean;
  }

  public isVkd3dProton(): boolean {
    return this.get('plugins.vkd3dProton', true) as boolean;
  }

  public isMediaFoundation(): boolean {
    return this.get('plugins.mf', false) as boolean;
  }

  public isMono(): boolean {
    return this.get('plugins.mono', true) as boolean;
  }

  public isGstreamer(): boolean {
    return this.get('plugins.gstreamer', true) as boolean;
  }

  public isGecko(): boolean {
    return this.get('plugins.gecko', true) as boolean;
  }

  public getMouseWarpOverride(): SettingsType['fixes']['mouseWarpOverride'] {
    return this.get('fixes.mouseWarpOverride', 'enable') as any;
  }

  public getDefaultConfig(): SettingsType {
    return {
      windowsVersion: 'win7',  // Windows version (win11, win10, win7, winxp, win2k),
      plugins: {
        dxvk: true,
        vkd3dProton: true,
        isskin: true,
        d8vk: false,
        d3d8to9: false,
        mf: false,
        cncDdraw: false,
        dgVoodoo2: false,
        mono: true,
        gecko: true,
        gstreamer: true,
      },
      libs: {
        mangohud: false,
      },
      fixes: {
        pulse: true,
        focus: false,          // Fix focus
        noCrashDialog: false,  // No crash dialog
        mouseWarpOverride: 'enable',
      },
    };
  }

  public toConfig(): SettingsType {
    return this.config;
  }

  public async set(path: string, value: string | boolean | number): Promise<void> {
    _.set(this.config, path, value);
    await this.save();
  }

  public get(path: string, defaultValue: string | boolean | undefined): string | boolean {
    return _.get(this.config, path, defaultValue);
  }
}