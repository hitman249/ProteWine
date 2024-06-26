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
  totalBytesFormatted: string,
  transferredBytesFormatted: string,
  path?: string,
  name?: string,
  itemsCount?: number,
  itemsComplete?: number,
  event?: 'copy' | 'extract' | 'packing' | 'download' | 'prefix',
};

const ARCHIVES: string[] = [
  '.7z',
  '.bz',
  '.bz2',
  '.exe',
  '.gz',
  '.jar',
  '.pol',
  '.rar',
  '.tar',
  '.tar.bz2',
  '.tar.gz',
  '.tar.xz',
  '.tar.zst',
  '.tbz2',
  '.tgz',
  '.xz',
  '.zip',
  '.zst',
];

export default class Archiver extends EventListener {
  private readonly fs: FileSystem;
  private readonly appFolders: AppFolders;

  private readonly src: string;
  private readonly dest: string;
  private process: WatchProcess;

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
    if (Utils.endsWith(this.src, ['.tar.gz', '.tgz'])) {
      return await this.extract('tar', 'xzpf -');
    }
    if (Utils.endsWith(this.src, ['.tar.bz2', '.tbz2', '.tar.bz', '.tbz'])) {
      return await this.extract('tar', '-xvjf');
    }
    if (Utils.endsWith(this.src, ['.tar.xz', '.xz'])) {
      return await this.extract('tar', 'xJf -');
    }
    if (Utils.endsWith(this.src, ['.tar.zst', '.zst'])) {
      return await this.extract('tar', '-I zstd -xf -');
    }
    if (_.endsWith(this.src, '.pol')) {
      return await this.extract('tar', 'xjf -');
    }
    if (Utils.endsWith(this.src, ['.exe', '.rar'])) {
      return await this.extract('unrar', 'x');
    }
    if (Utils.endsWith(this.src, ['.zip', '.jar'])) {
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

    const size: number = await this.fs.size(this.src);
    const fileName: string = this.fs.basename(this.src);
    const mvFile: string = `${this.dest}/${fileName}`;

    await this.fs.mv(this.src, mvFile, {overwrite: true}, (progress: Progress) => {
      this.fireEvent(ArchiverEvent.PROGRESS, {
        success: false,
        progress: progress.progress,
        totalBytes: progress.totalBytes,
        transferredBytes: progress.transferredBytes,
        totalBytesFormatted: Utils.convertBytes(progress.totalBytes),
        transferredBytesFormatted: Utils.convertBytes(progress.transferredBytes),
        itemsCount: progress.itemsCount,
        itemsComplete: progress.itemsComplete,
        path: progress.path,
        name: this.fs.basename(progress.path),
        event: 'copy',
      } as Progress);
    });

    this.fireEvent(ArchiverEvent.PROGRESS, Utils.getFullProgress('copy'));

    if (!await this.fs.exists(mvFile)) {
      throw new Error(`Error found file: ${mvFile}`);
    }

    const skipProgress: boolean = Archiver.SKIP_PROGRESS.includes(archiver);

    const bar: string = skipProgress ? '' : `"${await this.appFolders.getBarFile()}" -w 100 -n "${fileName}" |`;
    this.process = await this.watch(`cd "${this.dest}" && ${bar} ${archiver} ${args}`);

    if (!skipProgress) {
      let prevPercent: string = undefined;

      this.process.on(WatchProcessEvent.STDERR, (event: WatchProcessEvent.STDERR, line: string) => {
        const percent: string = _.trim(line).match(/([0-9]{1,3})% \[/gm)?.join('').split('%')?.[0];

        if (undefined === percent || prevPercent === percent) {
          return;
        }

        prevPercent = percent;

        const transferredBytes: number = size / 100 * Utils.toInt(percent);

        this.fireEvent(ArchiverEvent.PROGRESS, {
          success: false,
          progress: Utils.toInt(percent),
          totalBytes: size,
          transferredBytes,
          totalBytesFormatted: Utils.convertBytes(size),
          transferredBytesFormatted: Utils.convertBytes(transferredBytes),
          itemsCount: 1,
          itemsComplete: 1,
          path: this.src,
          name: this.fs.basename(this.src),
          event: 'extract',
        } as Progress);
      });
    }

    this.process.wait().then(() => {
      this.fireEvent(ArchiverEvent.PROGRESS, Utils.getFullProgress('extract'));
      this.fs.rm(mvFile);
    });

    return this;
  }

  private async watch(cmd: string): Promise<WatchProcess> {
    return await Command.create().watch(cmd);
  }

  public async clear(): Promise<this> {
    if (this.dest && await this.fs.exists(this.dest)) {
      await this.fs.rm(this.dest);
    }

    return this;
  }

  public static isArchive(path: string): boolean {
    return Utils.endsWith(path, ARCHIVES);
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

  public async packSquashfs(maxLevel: boolean = false): Promise<this> {
    if (!await this.fs.exists(this.src)) {
      throw new Error(`Error squashfs packing: "${this.src}"`);
    }

    const total: number = await this.fs.size(this.src);
    const mksquashfs: string = await this.fs.getAppFolders().getMkSquashFsFile();

    const cmd: string = maxLevel
      ? `"${mksquashfs}" "${this.src}" "${this.src}.squashfs" -progress -b 1048576 -comp xz -Xdict-size 100% -percentage`
      : `"${mksquashfs}" "${this.src}" "${this.src}.squashfs" -progress -b 1048576 -comp lz4 -Xhc -percentage`;

    this.process = await this.watch(`cd "${this.src}" && ${cmd}`);

    let prevPercent: string = undefined;

    this.process.on(WatchProcessEvent.STDOUT, (event: WatchProcessEvent.STDOUT, line: string) => {
      const percent: string = Array.from(line.matchAll(/^([0-9]{1,2})$/gm))[0]?.[1];

      if (undefined === percent || prevPercent === percent) {
        return;
      }

      prevPercent = percent;

      const progress: number = Utils.toInt(percent);
      const totalBytes: number = total;
      const transferredBytes: number = total / 100 * progress;

      this.fireEvent(ArchiverEvent.PROGRESS, {
        success: false,
        progress,
        totalBytes,
        transferredBytes,
        totalBytesFormatted: Utils.convertBytes(totalBytes),
        transferredBytesFormatted: Utils.convertBytes(transferredBytes),
        itemsCount: 1,
        itemsComplete: 1,
        path: this.src,
        name: this.fs.basename(this.src),
        event: 'packing',
      } as Progress);
    });

    this.process.wait().then(() => this.fireEvent(ArchiverEvent.PROGRESS, Utils.getFullProgress('packing')));

    return this;
  }

  public getProcess(): WatchProcess {
    return this.process;
  }
}