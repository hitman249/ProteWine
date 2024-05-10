import _ from 'lodash';
import path from 'path';
import process from 'process';
import Utils from '../helpers/utils';
import FileSystem from './file-system';
import {AbstractModule} from './abstract-module';
import type Settings from './settings';

export default class AppFolders extends AbstractModule {
  private readonly fs: FileSystem;
  private folders: string[];

  private rootDir: string;
  private binDir: string = '/bin';
  private linkInfoFile: string = '/bin/lnkinfo';
  private winetricksFile: string = '/bin/winetricks';
  private squashfuseFile: string = '/bin/squashfuse';
  private mksquashfsFile: string = '/bin/mksquashfs';
  private barFile: string = '/bin/bar';
  private dosboxFile: string = '/bin/dosbox';
  private fuseisoFile: string = '/bin/fuseiso';
  private cabextractFile: string = '/bin/cabextract';
  private shareDir: string = '/bin/share';
  private dataDir: string = '/data';
  private gamesDir: string = '/data/games';
  private gamesFile: string = '/data/games.squashfs';
  private savesDir: string = '/data/saves';
  private savesFoldersFile: string = '/data/saves/folders.json';
  private configsDir: string = '/data/configs';
  private dxvkConfFile: string = '/data/configs/dxvk.conf';
  private dosboxConfFile: string = '/data/configs/dosbox.conf';
  private dosboxRuLangFile: string = '/data/configs/russian.txt';
  private vkBasaltConfFile: string = '/data/configs/vkBasalt.conf';
  private cacheDir: string = '/data/cache';
  private implicitLayerDir: string = '/data/cache/implicit_layer.d';
  private runPidFile: string = '/data/cache/run.pid';
  private resolutionsFile: string = '/data/cache/resolutions.json';
  private logsDir: string = '/data/logs';
  private logFileManager: string = '/data/logs/filemanager.log';
  private logFileConfig: string = '/data/logs/config.log';
  private logFileProton: string = '/data/logs/proton.log';
  private logFileVkBasalt: string = '/data/logs/vkBasalt.log';
  private patchesDir: string = '/data/patches';
  private buildDir: string = '/build';
  private prefixDir: string = '/prefix';
  private wineDir: string = '/wine';
  private wineFile: string = '/wine.squashfs';
  private protonFile: string = '/wine/proton';

  constructor() {
    super();
    this.fs = new FileSystem(this);
  }

  public async init(): Promise<any> {
    await this.getFolders();
  }

  private async getFolders(): Promise<string[]> {
    if (undefined === this.folders) {
      this.folders = [
        await this.getRootDir(),
        await this.getBinDir(),
        await this.getDataDir(),
        await this.getLogsDir(),
        await this.getCacheDir(),
        await this.getConfigsDir(),
        await this.getShareDir(),
        await this.getGamesDir(),
        await this.getSavesDir(),
        await this.getPatchesDir(),
      ];
    }

    return this.folders;
  }

  public getFileSystem(): FileSystem {
    return this.fs;
  }

  public async create(): Promise<void> {
    if (await this.isCreated()) {
      return;
    }

    const folders: string[] = await this.getFolders();

    for await (const folder of folders) {
      if (!await this.fs.exists(folder)) {
        await this.fs.mkdir(folder);
      }
    }

    const settings: Settings = global.$app.getSettings();
    await settings.save();

    const saveFolders: {} = settings.getDefaultSaveFolders();
    const savesDir: string = await this.getSavesDir();

    for await (const folder of Object.keys(saveFolders)) {
      await this.fs.mkdir(`${savesDir}/${folder}`);
    }

    await this.fs.filePutContents(await this.getSavesFoldersFile(), Utils.jsonEncode(saveFolders));
  }

  public async isCreated(): Promise<boolean> {
    return (await this.fs.exists(await this.getDataDir())) && await this.fs.exists(await this.getBinDir());
  }

  public async getRootDir(): Promise<string> {
    if (undefined !== this.rootDir) {
      return this.rootDir;
    }

    let startFile: string = undefined;

    if (_.endsWith(path.resolve(__dirname), 'cache/server')) {
      startFile = path.resolve(__dirname, '..');
    }

    if (undefined === startFile) {
      startFile = process.env.APPIMAGE;
    }

    if (undefined === startFile) {
      startFile = path.resolve(__dirname);
    }

    this.rootDir = path.resolve(startFile, '..');

    const binDir: string = path.resolve(this.rootDir, '..') + this.binDir;
    const dataDir: string = path.resolve(this.rootDir, '..') + this.dataDir;

    if (await this.fs.exists(binDir) && await this.fs.exists(dataDir)) {
      this.rootDir = path.resolve(this.rootDir, '..');
    }

    return this.rootDir;
  }

  public async getStartFilename(): Promise<string> {
    return 'start';
  }

  public async getStartFile(): Promise<string> {
    const rootDir: string = await this.getRootDir();
    const path: string = `${rootDir}/${await this.getStartFilename()}`;

    if (await this.fs.exists(path)) {
      return path;
    }

    return `${await this.getBinDir()}/${await this.getStartFilename()}`;
  }

  public async getBinDir(): Promise<string> {
    return await this.getRootDir() + this.binDir;
  }

  public async getShareDir(): Promise<string> {
    return await this.getRootDir() + this.shareDir;
  }

  public async getDataDir(): Promise<string> {
    return await this.getRootDir() + this.dataDir;
  }

  public async getGamesDir(): Promise<string> {
    return await this.getRootDir() + this.gamesDir;
  }

  public async getGamesFile(): Promise<string> {
    return await this.getRootDir() + this.gamesFile;
  }

  public async getSavesDir(): Promise<string> {
    return await this.getRootDir() + this.savesDir;
  }

  public async getSavesFoldersFile(): Promise<string> {
    return await this.getRootDir() + this.savesFoldersFile;
  }

  public async getCacheDir(): Promise<string> {
    return await this.getRootDir() + this.cacheDir;
  }

  public async getCacheImplicitLayerDir(): Promise<string> {
    return await this.getRootDir() + this.implicitLayerDir;
  }

  public async getWineDir(): Promise<string> {
    return await this.getRootDir() + this.wineDir;
  }

  public async getPrefixDir(): Promise<string> {
    return await this.getRootDir() + this.prefixDir;
  }

  public async getWineFile(): Promise<string> {
    return await this.getRootDir() + this.wineFile;
  }

  public async getProtonFile(): Promise<string> {
    return await this.getRootDir() + this.protonFile;
  }

  public async getConfigsDir(): Promise<string> {
    return await this.getRootDir() + this.configsDir;
  }

  public async getLogsDir(): Promise<string> {
    return await this.getRootDir() + this.logsDir;
  }

  public async getLogFileManager(): Promise<string> {
    return await this.getRootDir() + this.logFileManager;
  }

  public async getLogFileProton(): Promise<string> {
    return await this.getRootDir() + this.logFileProton;
  }

  public async getLogFileVkBasalt(): Promise<string> {
    return await this.getRootDir() + this.logFileVkBasalt;
  }

  public async getLogFileConfig(): Promise<string> {
    return await this.getRootDir() + this.logFileConfig;
  }

  public async getPatchesDir(): Promise<string> {
    return await this.getRootDir() + this.patchesDir;
  }

  public async getDxvkConfFile(): Promise<string> {
    return await this.getRootDir() + this.dxvkConfFile;
  }

  public async getDosboxConfFile(): Promise<string> {
    return await this.getRootDir() + this.dosboxConfFile;
  }

  public async getDosboxRuLangFile(): Promise<string> {
    return await this.getRootDir() + this.dosboxRuLangFile;
  }

  public async getVkBasaltConfFile(): Promise<string> {
    return await this.getRootDir() + this.vkBasaltConfFile;
  }

  public async getRunPidFile(): Promise<string> {
    return await this.getRootDir() + this.runPidFile;
  }

  public async getBuildDir(): Promise<string> {
    return await this.getRootDir() + this.buildDir;
  }

  public async getWineTricksFile(): Promise<string> {
    return await this.getRootDir() + this.winetricksFile;
  }

  public async getLinkInfoFile(): Promise<string> {
    return await this.getRootDir() + this.linkInfoFile;
  }

  public async getSquashFuseFile(): Promise<string> {
    return await this.getRootDir() + this.squashfuseFile;
  }

  public async getMkSquashFsFile(): Promise<string> {
    return await this.getRootDir() + this.mksquashfsFile;
  }

  public async getBarFile(): Promise<string> {
    return await this.getRootDir() + this.barFile;
  }

  public async getDosboxFile(): Promise<string> {
    return await this.getRootDir() + this.dosboxFile;
  }

  public async getFuseIsoFile(): Promise<string> {
    return await this.getRootDir() + this.fuseisoFile;
  }

  public async getCabExtractFile(): Promise<string> {
    return await this.getRootDir() + this.cabextractFile;
  }

  public async getResolutionsFile(): Promise<string> {
    return await this.getRootDir() + this.resolutionsFile;
  }
}