import _ from 'lodash';
import FileSystem from './file-system';
import AppFolders from './app-folders';
import Utils from '../helpers/utils';
import Command from './command';
import WatchProcess, {WatchProcessEvent} from '../helpers/watch-process';
import EventListener from '../helpers/event-listener';

export enum ArchiverEvent {
  PROGRESS = 'progress',
}

export type Progress = {
  success: boolean,
  progress: number,
  totalBytes: number,
  transferredBytes: number,
  path?: string,
  itemsCount?: number,
  itemsComplete?: number,
  event?: 'copy' | 'extract' | 'download',
};

export default class Archiver extends EventListener {
  private readonly fs: FileSystem;
  private readonly appFolders: AppFolders;

  private readonly src: string;
  private readonly dest: string;
  private tempDir: string;

  private static readonly SKIP_PROGRESS: string[] = [
    'unrar',
    'unzip',
    '7z',
  ];

  constructor(fs: FileSystem, src: string, dest: string = '') {
    super();

    this.fs = fs;
    this.appFolders = this.fs.getAppFolders();
    this.src = _.trimEnd(src, '/');
    this.dest = _.trimEnd(dest, '/');
  }

  public async unpack(): Promise<this> {
    if (_.endsWith(this.src, '.tar.gz') || _.endsWith(this.src, '.tgz')) {
      return await this.extract('tar', 'xzpf -');
    }
    if (_.endsWith(this.src, '.tar.xz')) {
      return await this.extract('tar', 'xJf -');
    }
    if (_.endsWith(this.src, '.tar.zst')) {
      return await this.extract('tar', '-I zstd -xf -');
    }
    if (_.endsWith(this.src, '.pol')) {
      return await this.extract('tar', 'xjf -');
    }
    if (_.endsWith(this.src, '.exe') || _.endsWith(this.src, '.rar')) {
      return await this.extract('unrar', 'x');
    }
    if (_.endsWith(this.src, '.zip')) {
      return await this.extract('unzip', '');
    }
    if (_.endsWith(this.src, '.7z')) {
      return await this.extract('7z', 'x');
    }

    throw new Error(`Unknown archive: "${this.src}"`);
  }

  private async extract(archiver: string = 'tar', args: string = 'xzpf -'): Promise<this> {
    if (!await this.fs.exists(this.src) || await this.fs.isDirectory(this.src)) {
      return this;
    }

    if (await this.fs.exists(this.dest)) {
      await this.fs.rm(this.dest);
    }

    this.tempDir = (await this.appFolders.getCacheDir()) + `/tmp_${Utils.rand(10000, 99999)}`;
    await this.fs.mkdir(this.tempDir);

    if (!await this.fs.exists(this.tempDir)) {
      throw new Error(`Error create dir: ${this.tempDir}`);
    }

    const size: number = await this.fs.size(this.src);
    const fileName: string = this.fs.basename(this.src);
    const mvFile: string = `${this.tempDir}/${fileName}`;

    await this.fs.mv(this.src, mvFile, {overwrite: true}, (progress: Progress) => {
      this.fireEvent(ArchiverEvent.PROGRESS, {
        success: true,
        progress: progress.progress,
        totalBytes: progress.totalBytes,
        transferredBytes: progress.transferredBytes,
        itemsCount: progress.itemsCount,
        itemsComplete: progress.itemsComplete,
        path: progress.path,
        event: 'copy',
      } as Progress);
    });

    if (!await this.fs.exists(mvFile)) {
      throw new Error(`Error found file: ${mvFile}`);
    }

    const skipProgress: boolean = Archiver.SKIP_PROGRESS.includes(archiver);

    const bar: string = skipProgress ? '' : `"${await this.appFolders.getBarFile()}" -w 100 -n "${fileName}" |`;
    const process: WatchProcess = await this.watch(`cd "${this.tempDir}" && ${bar} ${archiver} ${args}`);

    if (!skipProgress) {
      let prevPercent: string = undefined;

      process.on(WatchProcessEvent.STDERR, (event: WatchProcessEvent.STDERR, line: string) => {
        const percent: string = Array.from(line.matchAll(/ ([0-9]{1,2})% \[/gm))[0]?.[1];

        if (undefined === percent || prevPercent === percent) {
          return;
        }

        prevPercent = percent;

        this.fireEvent(ArchiverEvent.PROGRESS, {
          success: true,
          progress: Utils.toInt(percent),
          totalBytes: size,
          transferredBytes: size / 100 * Utils.toInt(percent),
          itemsCount: 1,
          itemsComplete: 1,
          path: this.src,
          event: 'extract',
        } as Progress);
      });
    }

    await process.wait();
    await this.fs.rm(mvFile);

    return this;
  }

  private async watch(cmd: string): Promise<WatchProcess> {
    return await Command.create().watch(cmd);
  }

  public async clear(): Promise<this> {
    if (this.tempDir && await this.fs.exists(this.tempDir)) {
      await this.fs.rm(this.tempDir);
    }

    return this;
  }

  public static isArchive(path: string): boolean {
    return Utils.endsWith(path, [
      '.tar.xz',
      '.tar.gz',
      '.tar.zst',
      '.tgz',
      '.exe',
      '.rar',
      '.zip',
      '.7z',
      '.pol',
    ]);
  }

  public async pack(): Promise<this> {
    if (!(await this.fs.exists(this.src)) || (await this.fs.exists(`${this.src}.tar.gz`))) {
      return this;
    }

    await this.fs.exec(`cd "${this.src}" && tar -zcf "${this.src}.tar.gz" -C "${this.src}" .`);

    if (!await this.fs.exists(`${this.src}.tar.gz`)) {
      throw new Error(`Error packing: "${this.src}"`);
    }

    return this;
  }
}