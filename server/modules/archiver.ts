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
};

export default class Archiver extends EventListener {
  private readonly fs: FileSystem;
  private readonly appFolders: AppFolders;

  private readonly src: string;
  private readonly dest: string;

  constructor(fs: FileSystem, src: string, dest: string) {
    super();

    this.fs = fs;
    this.appFolders = this.fs.getAppFolders();
    this.src = src;
    this.dest = _.trimEnd(dest, '/');
  }

  // public async unpack(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
  //   if (_.endsWith(inFile, '.tar.xz')) {
  //     return await this.extract(inFile, outDir, 'xf', '', 'tar', simple);
  //   }
  //   if (_.endsWith(inFile, '.tar.gz') || _.endsWith(inFile, '.tgz')) {
  //     return await this.extract(inFile, outDir, simple);
  //   }
  //   if (_.endsWith(inFile, '.pol')) {
  //     return await this.extract(inFile, outDir, simple);
  //   }
  //   if (_.endsWith(inFile, '.exe') || _.endsWith(inFile, '.rar')) {
  //     return await this.extract(inFile, outDir, simple);
  //   }
  //   if (_.endsWith(inFile, '.zip')) {
  //     return await this.extract(inFile, outDir, simple);
  //   }
  //
  //   return false;
  // }

  public async extract(type: string = 'xzpf -', archiver: string = 'tar'): Promise<void> {
    console.log(this.src);
    if (!await this.fs.exists(this.src) || await this.fs.isDirectory(this.src)) {
      console.log('step1', await this.fs.exists(this.src), await this.fs.isDirectory(this.src));
      return;
    }

    if (await this.fs.exists(this.dest)) {
      await this.fs.rm(this.dest);
    }

    const tmpDir: string = (await this.appFolders.getCacheDir()) + `/tmp_${Utils.rand(10000, 99999)}`;
    await this.fs.mkdir(tmpDir);

    console.log(tmpDir);

    if (!await this.fs.exists(tmpDir)) {
      throw new Error(`Error create dir: ${tmpDir}`);
    }

    const size: number = await this.fs.size(this.src);
    const fileName: string = this.fs.basename(this.src);
    const mvFile: string = `${tmpDir}/${fileName}`;
    await this.fs.mv(this.src, mvFile);

    if (!await this.fs.exists(mvFile)) {
      throw new Error(`Error found file: ${mvFile}`);
    }

    const bar: string = `"${await this.appFolders.getBarFile()}" -w 100 -n "${fileName}" |`;
    const process: WatchProcess = await this.watch(`cd "${tmpDir}" && ${bar} ${archiver} ${type}`);

    console.log(size, mvFile, `cd "${tmpDir}" && ${bar} ${archiver} ${type}`);

    let prevPercent: string = undefined;

    process.on(WatchProcessEvent.STDOUT, (event: WatchProcessEvent.STDOUT, line: string) => {
      const percent: string = Array.from(line.matchAll(/ ([0-9]{1,2})% \[/gm))[0]?.[1];

      if (undefined === percent || prevPercent === percent) {
        return;
      }

      prevPercent = percent;

      const progress: Progress = {
        success: true,
        progress: Utils.toInt(percent),
        totalBytes: size,
        transferredBytes: size / 100 * Utils.toInt(percent),
      };

      this.fireEvent(ArchiverEvent.PROGRESS, progress);
    });

    await process.wait();

    // await this.fs.rm(mvFile);
  }

  private async watch(cmd: string): Promise<WatchProcess> {
    return await Command.create().watch(cmd);
  }
}