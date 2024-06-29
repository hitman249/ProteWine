import _ from 'lodash';
import {AbstractModule} from './abstract-module';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import type System from './system';
import type Config from './games/config';
import type Command from './command';

export default class Icon extends AbstractModule {
  private local: string;
  private folders: string[];

  private readonly config: Config;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly system: System;
  private readonly command: Command;

  constructor(config: Config, appFolders: AppFolders, fs: FileSystem, system: System, command: Command) {
    super();

    this.config = config;
    this.appFolders = appFolders;
    this.fs = fs;
    this.system = system;
    this.command = command;
  }

  public async init(): Promise<void> {
    const home: string = await this.system.getHomeDir();
    const desktop: string = await this.system.getDesktopDir();

    this.local = `${home}/.local/share/applications`;
    this.folders = [
      '/Рабочий стол/Games',
      '/Рабочий стол/games',
      '/Рабочий стол/Игры',
      '/Рабочий стол/игры',
      '/Рабочий стол',
      '/Desktop/Игры',
      '/Desktop/игры',
      '/Desktop/Games',
      '/Desktop/games',
      '/Desktop',
    ].map(path => home + path);

    if (desktop) {
      this.folders = _.uniq([
        `${desktop}/Games`,
        `${desktop}/games`,
        `${desktop}/Игры`,
        `${desktop}/игры`,
        desktop,
      ].concat(this.folders));
    }
  }

  private async getTemplate(): Promise<string> {
    return `[Desktop Entry]
Version=1.0
Exec=${await this.appFolders.getStartFile()} headless game=${this.config.id}
Path=${await this.appFolders.getRootDir()}
Icon=${await this.config.getIcon()}
Name=${this.config.title}
Terminal=false
TerminalOptions=
Type=Application
Categories=Game`;
  }

  private async findIconsDir(): Promise<string> {
    for await (const path of this.folders) {
      if ((await this.fs.exists(path)) && (await this.fs.isDirectory(path))) {
        return path;
      }
    }
  }

  private async findApplicationsDir(): Promise<string>  {
    if (!await this.fs.exists(this.local)) {
      return;
    }

    return this.local;
  }

  public async findIcons(menuOrDesktop: boolean = false): Promise<string[]> {
    const result: string[] = [];

    for await (const path of menuOrDesktop ? [this.local] : this.folders) {
      const v1: string = `${path}/${this.config.title}`;
      const v2: string = `${v1}.desktop`;

      if ((await this.fs.exists(v1)) && !(await this.fs.isDirectory(v1))) {
        result.push(v1);
      }

      if ((await this.fs.exists(v2)) && !(await this.fs.isDirectory(v2))) {
        result.push(v2);
      }
    }

    return result;
  }

  public async remove(menuOrDesktop: boolean = false): Promise<void> {
    for await (const path of await this.findIcons(menuOrDesktop)) {
      await this.fs.rm(path);
    }
  }

  public async create(menuOrDesktop: boolean = false): Promise<boolean> {
    let image: string = await this.config.getIcon();

    if (!image) {
      await this.fetchNativeIcon();
      image = await this.config.getIcon();

      if (!image) {
        return false;
      }
    }

    const dir: string = menuOrDesktop ? await this.findApplicationsDir() : await this.findIconsDir();
    const template: string = await this.getTemplate();
    const link: string = `${dir}/${this.config.title}.desktop`;

    if (await this.fs.exists(link)) {
      await this.fs.rm(link);
    }

    await this.fs.filePutContents(link, template);
    await this.fs.chmod(link);

    return true;
  }

  public async fetchNativeIcon(): Promise<void> {
    const configDir: string = this.config.getFolder();
    const png: string = `${configDir}/icon.png`;
    const ico: string = `${configDir}/icon.ico`;
    const exe: string = `${await this.appFolders.getGamesDir()}${this.config.getGamePath()}`;


    if ((await this.fs.exists(png)) || !(await this.fs.exists(exe)) || !(await this.system.isIcoSupport())) {
      return;
    }

    if (await this.fs.exists(ico)) {
      await this.fs.rm(ico);
    }

    await this.command.exec(`wrestool -x -t 14 "${exe}" > "${ico}"`);

    if (0 === await this.fs.size(ico)) {
      await this.fs.rm(ico);
      return;
    }

    const getValue = (line: string, field: string): number => {
      return parseInt((line.split(`--${field}=`)[1] || '').split(' ')[0] || '0');
    };

    const info: string[] = (await this.command.exec(`icotool -l "${ico}"`)).split('\n');

    let maxProfile: {index: number, width: number, bitDepth: number};

    for await (const line of info) {
      const profile: {index: number, width: number, bitDepth: number} = {
        index: getValue(line, 'index'),
        width: getValue(line, 'width'),
        bitDepth: getValue(line, 'bit-depth'),
      };

      if (0 === profile['bitDepth'] && 0 === profile['index'] && 0 === profile['width']) {
        continue;
      }

      if (!maxProfile) {
        maxProfile = profile;
      } else if (
        maxProfile['width'] < profile['width'] ||
        (maxProfile['width'] === profile['width'] && maxProfile['bitDepth'] < profile['bitDepth'])
      ) {
        maxProfile = profile;
      }
    }

    if (!maxProfile) {
      return;
    }

    await this.command.exec(`icotool -x --index=${maxProfile['index']} "${ico}" -o "${png}"`);
  }
}