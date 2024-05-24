import type Command from './command';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import _ from 'lodash';
import {AbstractModule} from './abstract-module';
import Kernels, {Kernel} from './kernels';

export type LinkInfoData = {
  title: string,
  filename: string,
  arguments: string,
  path: string,
};

const SKIP: string[] = [
  '3dfx',
  'benchmark',
  'binkplay',
  'browser',
  'changer',
  'client',
  'compiler',
  'config',
  'console',
  'crash',
  'decode',
  'dedicated',
  'depend',
  'directx',
  'dos4gw',
  'dump',
  'edit',
  'encoder',
  'files',
  'framework',
  'gamespy',
  'glide',
  'help',
  'install',
  'language',
  'maindos',
  'manual',
  'modeler',
  'patch',
  'process',
  'profile',
  'remove',
  'replay',
  'report',
  'send',
  'server',
  'service',
  'setting',
  'setup',
  'soundtrack',
  'studio',
  'tool',
  'unins',
  'unwise',
  'update',
  'upgrade',
  'vcredist',
  'voodoo',
  'version',
  'repair',
];

const PRIORITY: string[] = [
  'launch',
  'start',
];

const BINS: string[] = [
  'bin',
  'binaries',
  'bin64',
  'win64',
  'x64',
  'bin32',
  'win32',
  'x32',
  'system',
  'engine',
];

type ExeCounters = {
  filename: string,
  path: string,
  link?: LinkInfoData,

  gameChunks: string[],     // имя папки в виде чанков
  filenameChunks: string[], // имя файла в виде чанков
  identicalChunks: number,  // идентичные слова из названия папки

  priority: boolean,        // содержит приоритетное слово, больше лучше
  first: number,            // количество совпадений первых букв со словами из названия папки, больше лучше
  lossFirst: number,        // количество символов не с первых мест, меньше лучше
  loss: number,             // количество букв не содержащихся в названии папки, меньше лучше
  count: number,            // общее количество совпадений букв в названии папки, больше лучше
  skips: number,            // количество совпадающих игнорирующих слов, меньше лучше
  size: number,             // размер exe файла
}

export default class LinkInfo extends AbstractModule {
  private readonly command: Command;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly kernels: Kernels;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, kernels: Kernels) {
    super();

    this.command = command;
    this.appFolders = appFolders;
    this.fs = fs;
    this.kernels = kernels;
  }

  public async init(): Promise<any> {
  }

  private async parseFile(path: string): Promise<LinkInfoData> {
    const result: LinkInfoData = {
      title: '',
      filename: '',
      arguments: '',
      path: '',
    };

    const start: string = 'Link information:';
    const local: string = 'Local path';
    const working: string = 'Working directory';
    const args: string = 'Command line arguments';

    const output: string[] = (await this.command.exec(`"${await this.appFolders.getLinkInfoFile()}" "${path}"`)).split('\n');

    let isStarted: boolean = false;

    for (const line of output) {
      const fixLine: string = _.trim(line, ' \t');

      if (!isStarted) {
        if (-1 !== fixLine.indexOf(start)) {
          isStarted = true;
        }

        continue;
      }

      if (0 === fixLine.indexOf(local)) {
        result.path = _.trim(fixLine.split(':').slice(1).join(':'), ' \t').split('\\').join('/');
        result.filename = this.fs.basename(result.path);
        continue;
      }

      if (0 === fixLine.indexOf(working)) {
        continue;
      }

      if (0 === fixLine.indexOf(args)) {
        result.arguments = _.trim(fixLine.split(':').slice(1).join(':'), ' \t');
        continue;
      }

      if ('' === fixLine) {
        break;
      }
    }

    result.title = this.fs.basename(path).split('.').slice(0, -1).join('.');

    return result;
  }

  private async findExeFiles(path: string, allFiles: string[] = []): Promise<string[]> {
    const exeFiles: string[] = await this.fs.glob(`${path}/*.{EXE,exe,Exe}`);

    if (exeFiles.length > 0) {
      allFiles.push(...exeFiles);
      return allFiles;
    }

    const folders: string[] = [];

    for await (const folder of await this.fs.glob(`${path}/*`)) {
      if (await this.fs.isDirectory(folder)) {
        folders.push(folder);
      }
    }

    for await (const bin of BINS) {
      for await (const folder of folders) {
        const name: string = this.fs.basename(folder).toLowerCase();

        if (bin === name) {
          const result: string[] = await this.findExeFiles(folder, allFiles);

          if (result.length > 0) {
            return result;
          }
        }
      }
    }

    return allFiles;
  }

  private async getExeFiles(path: string): Promise<string[]> {
    const exeFiles: string[] = await this.findExeFiles(path);

    if (exeFiles.length > 0) {
      return exeFiles;
    }

    return await this.fs.glob(`${path}/**/*.{EXE,exe,Exe}`);
  }

  private getIdenticalChunks(gameChunks: string[], filenameChunks: string[]): number {
    let i: number = 0;

    for (const file of filenameChunks) {
      for (const game of gameChunks) {
        if (-1 !== game.indexOf(file)) {
          i++;
        }
      }
    }

    return i;
  }

  private isPriority(filename: string): boolean {
    for (const item of PRIORITY) {
      if (-1 !== filename.indexOf(item)) {
        return true;
      }
    }

    return false;
  }

  private getSkipChunks(filename: string): number {
    let i: number = 0;

    for (const item of SKIP) {
      if (-1 !== filename.indexOf(item)) {
        i++;
      }
    }

    return i;
  }

  private dropExtension(name: string): string {
    const chunks: string[] = name.split('.');
    chunks.pop();

    return chunks.join('.');
  }

  private getChunks(name: string): string[] {
    return _.snakeCase(name).split('_');
  }

  private getSymbolsCounter(filename: string, gameChunks: string[]): {first: number, lossFirst: number, loss: number, count: number} {
    let first: number = 0;
    let lossFirst: number = 0;
    let loss: number = 0;
    let count: number = 0;

    for (const symbol of filename.split('')) {
      for (const chunk of gameChunks) {
        const position: number = chunk.indexOf(symbol);

        if (0 === position) {
          first++;
        } else if (-1 !== position) {
          lossFirst++;
        } else {
          loss++;
        }
      }
    }

    count = first + lossFirst;

    return {first, lossFirst, loss, count};
  }

  private async findAutoLink(path: string): Promise<LinkInfoData> {
    const allFiles: ExeCounters[] = [];
    const exeFiles: string[] = await this.getExeFiles(path);
    const gameName: string = this.fs.basename(path);

    for await (const path of exeFiles) {
      const filename: string = this.fs.basename(path);
      const filenameLowCase: string = this.dropExtension(filename).toLowerCase();
      const file: ExeCounters = {
        filename,
        path,

        gameChunks: this.getChunks(gameName),
        filenameChunks: this.getChunks(this.dropExtension(filename)),
        identicalChunks: 0,

        priority: this.isPriority(filenameLowCase),
        first: 0,
        lossFirst: 0,
        loss: 0,
        count: 0,
        skips: this.getSkipChunks(filenameLowCase),
        size: await this.fs.size(path),
      };

      file.identicalChunks = this.getIdenticalChunks(file.gameChunks, file.filenameChunks);

      const {first, lossFirst, loss, count}: {first: number, lossFirst: number, loss: number, count: number}
        = this.getSymbolsCounter(file.filenameChunks.join(''), file.gameChunks);

      file.first = first;
      file.lossFirst = lossFirst;
      file.loss = loss;
      file.count = count;

      allFiles.push(file);
    }

    const up: number = -1;
    const down: number = 1;
    const equal: number = 0;


    allFiles.sort((a: ExeCounters, b: ExeCounters): number => {
      if (a.priority && !b.priority) {
        return up;
      }
      if (!a.priority && b.priority) {
        return down;
      }

      if (a.skips < b.skips) {
        return up;
      }
      if (a.skips > b.skips) {
        return down;
      }

      if (a.identicalChunks > b.identicalChunks) {
        return up;
      }
      if (a.identicalChunks < b.identicalChunks) {
        return down;
      }

      if (a.first > b.first) {
        return up;
      }
      if (a.first < b.first) {
        return down;
      }

      if (a.lossFirst > b.lossFirst) {
        return down;
      }
      if (a.lossFirst < b.lossFirst) {
        return up;
      }

      if (a.loss < b.loss) {
        return up;
      }
      if (a.loss > b.loss) {
        return down;
      }

      if (a.count > b.count) {
        return up;
      }
      if (a.count < b.count) {
        return down;
      }

      if (a.size > b.size) {
        return up;
      }
      if (a.size < b.size) {
        return down;
      }

      return equal;
    });

    if (0 === allFiles.length) {
      return;
    }

    const gamePath: string = allFiles?.[0]?.path;

    return {
      path: gamePath,
      arguments: '',
      filename: this.fs.basename(gamePath),
      title: this.fs.basename(path),
    };
  }

  private async findGamePath(pathExe: string): Promise<string> {
    let gamesDir: string = await this.kernels.getKernel().getGamesDir();
    let games: string = gamesDir;

    let chunks: string[] = pathExe.split(':/');
    chunks.shift();
    chunks = chunks.join(':/').toLowerCase().split('/');

    let items: string[] = await this.fs.glob(`${games}/*`);
    let current: string = chunks.shift();

    while (current) {
      for await (const path of items) {
        const name: string = this.fs.basename(path).toLowerCase();

        if (name === current) {
          games = path;

          if (!await this.fs.isFile(path)) {
            items = await this.fs.glob(`${games}/*`);
          }
        }
      }

      current = chunks.shift();
    }

    if (games !== gamesDir) {
      return games;
    }

    return;
  }

  private isExistLink(link: LinkInfoData, links: LinkInfoData[]): boolean {
    for (const item of links) {
      if (item.filename === link.filename && item.arguments === link.arguments) {
        return true;
      }
    }

    return false;
  }

  public async findLinks(): Promise<LinkInfoData[]> {
    const links: LinkInfoData[] = [];

    const kernel: Kernel = this.kernels.getKernel();
    const fs: FileSystem = this.fs;

    const usersDir: string = `${await kernel.getDriveCDir()}/users`;
    const gamesDir: string = `${await kernel.getGamesDir()}`;

    const usersPaths: string[] = (await fs.glob(`${usersDir}/**/*.{LNK,lnk}`));
    const gamesPaths: string[] = (await fs.glob(`${gamesDir}/**/*.{LNK,lnk}`));
    const gamesListPaths: string[] = (await fs.glob(`${gamesDir}/*`));

    for await (const paths of [usersPaths, gamesPaths]) {
      for await (const path of paths) {
        const link: LinkInfoData = await this.parseFile(path);

        if (link) {
          link.path = await this.findGamePath(link.path);

          if (link.path) {
            links.push(link);
          }
        }
      }
    }

    for await (const path of gamesListPaths) {
      if (await fs.isDirectory(path)) {
        const link: LinkInfoData = await this.findAutoLink(path);

        if (link && !this.isExistLink(link, links)) {
          links.push(link);
        }
      }
    }

    return links;
  }
}