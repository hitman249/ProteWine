import {AbstractModule} from './abstract-module';
import {readVdf, writeVdf} from 'steam-binary-vdf';
import fs from 'fs';
import * as crc from 'crc';
import type Config from './games/config';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import type System from './system';
import Resizer from '../helpers/resizer';

export default class Steam extends AbstractModule {
  private shortcutsPaths: string[] = [];

  private readonly config: Config;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly system: System;

  constructor(config: Config, appFolders: AppFolders, fs: FileSystem, system: System) {
    super();

    this.config = config;
    this.appFolders = appFolders;
    this.fs = fs;
    this.system = system;
  }

  public async init(): Promise<any> {
    const home: string = await this.system.getHomeDir();
    this.shortcutsPaths = await this.fs.glob(`${home}/.steam/steam/userdata/*/config/shortcuts.vdf`);
  }

  public async create(): Promise<void> {
    for await (const path of this.shortcutsPaths) {
      await this.createByPath(path);
    }
  }

  public async remove(): Promise<void> {
    for await (const path of this.shortcutsPaths) {
      await this.removeByPath(path);
    }
  }

  public async exist(): Promise<boolean> {
    for await (const path of this.shortcutsPaths) {
      if (await this.existByPath(path)) {
        return true;
      }
    }

    return false;
  }
  public async getAppId(): Promise<number> {
    return (crc.crc32(`${await this.appFolders.getStartFile()}${this.config.title}`) | 0x80000000) >> 32 >>> 0;
  }

  private async createByPath(shortcutsPath: string): Promise<void> {
    const appId: number = await this.getAppId();

    const template: any = await this.getTemplate();
    const buffer: Buffer = await this.readFile(shortcutsPath);
    const shortcuts: any = readVdf(buffer);

    const index: number = Object.keys(shortcuts['shortcuts'] || {}).findIndex((index: string) => shortcuts['shortcuts'][index]['appid'] === appId);

    if (-1 !== index) {
      for (const field of Object.keys(template)) {
        shortcuts['shortcuts'][index][field] = template[field];
      }
    } else {
      const result: any = {};
      let i: number = 0;

      for (const index of Object.keys(shortcuts['shortcuts'])) {
        result[i] = shortcuts['shortcuts'][index];
        i++;
      }

      result[i] = template;
      shortcuts['shortcuts'] = result;
    }

    await this.writeFile(shortcutsPath, writeVdf(shortcuts));

    const poster: string = await this.config.getPoster();
    const grid: string = `${this.fs.dirname(shortcutsPath)}/grid`;

    if (!await this.fs.exists(grid)) {
      await this.fs.mkdir(grid);
    }

    if (poster) {
      const posterSteam: string = `${grid}/${appId}p.jpg`;

      if (await this.fs.exists(posterSteam)) {
        await this.fs.rm(posterSteam);
      }

      await Resizer.create(this.fs, poster, posterSteam).toJPEG();
    }
  }

  private async removeByPath(shortcutsPath: string): Promise<void> {
    const appId: number = await this.getAppId();
    const buffer: Buffer = await this.readFile(shortcutsPath);
    const shortcuts: any = readVdf(buffer);

    const result: any = {};
    let i: number = 0;
    let exist: boolean = false;

    for (const key of Object.keys(shortcuts['shortcuts'] || {})) {
      if (appId !== shortcuts['shortcuts'][key]['appid']) {
        result[i] = shortcuts['shortcuts'][key];
        i++;
      } else {
        exist = true;
      }
    }

    shortcuts['shortcuts'] = result;

    if (exist) {
      await this.writeFile(shortcutsPath, writeVdf(shortcuts));
    }

    const grid: string = `${this.fs.dirname(shortcutsPath)}/grid`;
    const posterSteam: string = `${grid}/${appId}p.jpg`;
    const heroSteam: string = `${grid}/${appId}_hero.jpg`;
    const logoSteam: string = `${grid}/${appId}_logo.jpg`;

    for await (const image of [posterSteam, heroSteam, logoSteam]) {
      if (await this.fs.exists(image)) {
        await this.fs.rm(image);
      }
    }
  }

  private async existByPath(shortcutsPath: string): Promise<boolean> {
    const appId: number = await this.getAppId();
    const buffer: Buffer = await this.readFile(shortcutsPath);
    const shortcuts: any = readVdf(buffer);

    for (const key of Object.keys(shortcuts['shortcuts'] || {})) {
      if (appId === shortcuts['shortcuts'][key]['appid']) {
        return true;
      }
    }

    return false;
  }

  private async getTemplate(): Promise<any> {
    return {
      appid: await this.getAppId(),
      AppName: this.config.title,
      Exe: `"${await this.appFolders.getStartFile()}"`,
      StartDir: `"${await this.appFolders.getRootDir()}"`,
      icon: (await this.config.getIcon()) || '',
      ShortcutPath: '',
      LaunchOptions: `headless game=${this.config.id}`,
      IsHidden: 0,
      AllowDesktopConfig: 1,
      AllowOverlay: 1,
      OpenVR: 0,
      Devkit: 0,
      DevkitGameID: '',
      DevkitOverrideAppID: 0,
      LastPlayTime: 0,
      FlatpakAppID: '',
      tags: {},
    };
  }

  private async readFile(filepath: string): Promise<Buffer> {
    return await new Promise((resolve: (value: Buffer) => void, reject: (err: any) => void) => {
      fs.readFile(filepath, (err: NodeJS.ErrnoException, buffer: Buffer) => {
        if (err) {
          reject(err);
        }

        return resolve(buffer);
      });
    });
  }

  private async writeFile(filepath: string, buffer: Buffer): Promise<void> {
    return await new Promise((resolve: () => void, reject: (err: any) => void) => {
      fs.writeFile(filepath, buffer, null, (err: NodeJS.ErrnoException) => {
        if (err) {
          reject(err);
        }

        return resolve();
      });
    });
  }
}