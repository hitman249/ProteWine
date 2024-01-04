import path from 'path';
// import Utils from '../helpers/utils';
import FileSystem from './file-system';

export default class AppFolders {
  private readonly fs: FileSystem;
  private folders: string[];

  private rootDir: string;
  private binDir: string = '/bin';
  private winetricksFile: string = '/bin/winetricks';
  private squashfuseFile: string = '/bin/squashfuse';
  private dosboxFile: string = '/bin/dosbox';
  private fuseisoFile: string = '/bin/fuseiso';
  private cabextractFile: string = '/bin/cabextract';
  private libsDir: string = '/bin/libs/i386';
  private libs64Dir: string = '/bin/libs/x86-64';
  private shareDir: string = '/bin/share';
  private dataDir: string = '/data';
  private gamesDir: string = '/data/games';
  private gamesSymlinksDir: string = '/data/games/_symlinks';
  private gamesFile: string = '/data/games.squashfs';
  private savesDir: string = '/data/saves';
  private savesFoldersFile: string = '/data/saves/folders.json';
  private savesSymlinksDir: string = '/data/saves/symlinks';
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
  private wineDir: string = '/wine';
  private wineFile: string = '/wine.squashfs';
  private protonFile: string = '/wine/proton';

  constructor() {
    this.fs = new FileSystem(this);
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
        await this.getLibsDir(),
        await this.getLibs64Dir(),
        await this.getShareDir(),
        await this.getGamesDir(),
        await this.getGamesSymlinksDir(),
        await this.getSavesDir(),
        await this.getSavesSymlinksDir(),
        await this.getPatchesDir(),
      ];
    }

    return this.folders;
  }

  public getFileSystem(): FileSystem {
    return this.fs;
  }

  public async create(): Promise<boolean> {
    if (await this.isCreated()) {
      return false;
    }

    const folders: string[] = await this.getFolders();

    for await (const folder of folders) {
      if (!await this.fs.exists(folder)) {
        await this.fs.mkdir(folder);
      }
    }

    // const prefix = window.app.getPrefix();
    // const config: string = Utils.jsonEncode(prefix.getConfig());
    // const saveFolders = prefix.getDefaultSaveFolders();

    // this.fs.filePutContents(prefix.getPath(), config);

    // Object.keys(saveFolders).forEach(folder => this.fs.mkdir(`${this.getSavesDir()}/${folder}`));

    // this.fs.filePutContents(await this.getSavesFoldersFile(), Utils.jsonEncode(saveFolders));
  }

  public async isCreated(): Promise<boolean> {
    return await this.fs.exists(await this.getDataDir()) && await this.fs.exists(await this.getBinDir());
  }

  public async getRootDir(): Promise<string> {
    if (undefined !== this.rootDir) {
      return this.rootDir;
    }

    let startFile: string = window.process.env.APPIMAGE;

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

  public async getLibsDir(): Promise<string> {
    return await this.getRootDir() + this.libsDir;
  }

  public async getLibs64Dir(): Promise<string> {
    return await this.getRootDir() + this.libs64Dir;
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

  public async getGamesSymlinksDir(): Promise<string> {
    return await this.getRootDir() + this.gamesSymlinksDir;
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

  public async getSavesSymlinksDir(): Promise<string> {
    return await this.getRootDir() + this.savesSymlinksDir;
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

  public async getWinetricksFile(): Promise<string> {
    return await this.getRootDir() + this.winetricksFile;
  }

  public async getSquashfuseFile(): Promise<string> {
    return await this.getRootDir() + this.squashfuseFile;
  }

  public async getDosboxFile(): Promise<string> {
    return await this.getRootDir() + this.dosboxFile;
  }

  public async getFuseisoFile(): Promise<string> {
    return await this.getRootDir() + this.fuseisoFile;
  }

  public async getCabextractFile(): Promise<string> {
    return await this.getRootDir() + this.cabextractFile;
  }

  public async getResolutionsFile(): Promise<string> {
    return await this.getRootDir() + this.resolutionsFile;
  }
}