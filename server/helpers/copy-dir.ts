import _ from 'lodash';
import Utils from './utils';
import fs from 'fs';
import EventListener from './event-listener';
import type {Progress} from '../modules/archiver';
import type FileSystem from '../modules/file-system';
import CopyFile, {CopyFileEvent} from './copy-file';

export enum CopyDirEvent {
  PROGRESS = 'progress',
}

export type Options = {
  overwrite?: boolean,
};

type Source = {
  src: string,
  dest: string,
};

export default class CopyDir extends EventListener {
  private readonly fs: FileSystem;
  private readonly src: string;
  private readonly srcLen: number;
  private readonly dest: string;

  private files: string[];
  private filesLen: number;
  private symlinks: string[];
  private symlinksLen: number;
  private dirs: string[];
  private dirsLen: number;

  private size: number;
  private count: number;

  constructor(fs: FileSystem, src: string, dest: string = '') {
    super();

    this.fs = fs;
    this.src = _.trimEnd(src, '/');
    this.dest = _.trimEnd(dest, '/');
    this.srcLen = this.src.length;
  }

  public async move({overwrite = true}: Options = {}): Promise<void> {
    if (await this.fs.exists(this.dest)) {
      if (overwrite) {
        await this.fs.rm(this.dest);
      } else {
        throw new Error(`Error, destination exist "${this.dest}"`);
      }
    }

    return new Promise((resolve: () => void, reject: (err?: string) => void) => {
      fs.rename(this.src, this.dest, (err: NodeJS.ErrnoException) => {
        if (err) {
          if ('EXDEV' === String(err.code).toUpperCase()) {
            return this.copy({overwrite})
              .then(() => this.fs.rm(this.src))
              .then(() => resolve(), () => reject(`Error move "${this.src}"`));
          } else {
            return reject(err.message);
          }
        }

        return resolve();
      });
    });
  }

  public async copy({overwrite = true}: Options = {}): Promise<void> {
    await this.scan();

    let itemsComplete: number = 0;
    let bytesCopied: number = 0;

    for await (const path of this.dirs) {
      const source: Source = this.prepareSrc(path);
      await this.fs.mkdir(source.dest);
      itemsComplete++;

      this.fireEvent(CopyDirEvent.PROGRESS, {
        success: false,
        progress: 100,
        path: source.dest,
        name: this.fs.basename(source.dest),
        itemsCount: this.count,
        itemsComplete,
        totalBytes: this.size,
        transferredBytes: 0,
        totalBytesFormatted: Utils.convertBytes(this.size),
        transferredBytesFormatted: Utils.convertBytes(0),
        event: 'copy',
      } as Progress);
    }

    for await (const path of this.symlinks) {
      itemsComplete++;

      const source: Source = this.prepareSrc(path);
      const file: CopyFile = new CopyFile(this.fs, source.src, source.dest);
      await file.copy({overwrite});

      this.fireEvent(CopyDirEvent.PROGRESS, {
        success: false,
        progress: 100,
        path: source.dest,
        name: this.fs.basename(source.dest),
        itemsCount: this.count,
        itemsComplete,
        totalBytes: this.size,
        transferredBytes: 0,
        event: 'copy',
      } as Progress);
    }

    for await (const path of this.files) {
      itemsComplete++;

      const source: Source = this.prepareSrc(path);
      const file: CopyFile = new CopyFile(this.fs, source.src, source.dest);

      file.on(CopyFileEvent.PROGRESS, (event: CopyFileEvent.PROGRESS, progress: Progress) => {
        const transferredBytes: number = bytesCopied + progress.transferredBytes;

        this.fireEvent(CopyDirEvent.PROGRESS, {
          success: false,
          progress: ((transferredBytes / this.size) * 100),
          path: source.dest,
          name: this.fs.basename(source.dest),
          itemsCount: this.count,
          itemsComplete,
          totalBytes: this.size,
          transferredBytes: transferredBytes,
          totalBytesFormatted: Utils.convertBytes(this.size),
          transferredBytesFormatted: Utils.convertBytes(transferredBytes),
          event: 'copy',
        } as Progress);
      });

      await file.copy({overwrite});

      bytesCopied = bytesCopied + await file.getSize();
    }

    this.fireEvent(CopyDirEvent.PROGRESS, Utils.getFullProgress('copy'));
  }

  private prepareSrc(src: string): Source {
    return {
      src,
      dest: this.dest + src.substring(this.srcLen),
    };
  }

  private async scan(): Promise<void> {
    if (undefined !== this.size) {
      return;
    }

    this.size = 0;
    this.files = [];
    this.symlinks = [];
    this.dirs = [];

    for await (const path of await this.fs.glob(this.src + '/**')) {
      if (await this.fs.isSymbolicLink(path)) {
        this.symlinks.push(path);
      } else if (await this.fs.isDirectory(path)) {
        this.dirs.push(path);
      } else {
        this.files.push(path);
        this.size += await new CopyFile(this.fs, path).getSize();
      }
    }

    this.filesLen = this.files.length;
    this.symlinksLen = this.symlinks.length;
    this.dirsLen = this.dirs.length;
    this.count = this.filesLen + this.symlinksLen + this.dirsLen;
  }

  public async getSize(): Promise<number> {
    await this.scan();
    return this.size;
  }

  public async getFiles(): Promise<string[]> {
    await this.scan();
    return this.files;
  }

  public async getSymlinks(): Promise<string[]> {
    await this.scan();
    return this.symlinks;
  }

  public async getDirs(): Promise<string[]> {
    await this.scan();
    return this.dirs;
  }
}