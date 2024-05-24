import fs, {type ReadStream, type Stats} from 'fs';
import EventListener from './event-listener';
import type {Progress} from '../modules/archiver';
import type FileSystem from '../modules/file-system';
import type {Options} from './copy-dir';
import Utils from './utils';

export enum CopyFileEvent {
  PROGRESS = 'progress',
}

export default class CopyFile extends EventListener {
  private readonly fs: FileSystem;
  private readonly hw: {highWaterMark: number} = {highWaterMark: 1024 * 1024}; // chunk 1Mb
  private readonly src: string;
  private readonly dest: string;
  private size: number;

  constructor(fs: FileSystem, src: string, dest: string = '') {
    super();

    this.fs = fs;
    this.src = src;
    this.dest = dest;
  }

  public async move({overwrite = true}: Options = {}): Promise<void> {
    await this.overwrite(overwrite);
    await this.getSize();

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
    await this.overwrite(overwrite);

    if (await this.fs.isSymbolicLink(this.src)) {
      await this.copySymlink();

      this.fireEvent(CopyFileEvent.PROGRESS, {
        success: true,
        progress: 100,
        totalBytes: 0,
        transferredBytes: 0,
        totalBytesFormatted: Utils.convertBytes(0),
        transferredBytesFormatted: Utils.convertBytes(0),
        path: this.dest,
        name: this.fs.basename(this.dest),
        itemsCount: 1,
        itemsComplete: 1,
      } as Progress);

      return;
    }

    const filesize: number = await this.getSize();

    return new Promise((resolve: () => void, reject: (err: string) => void) => {
      if (filesize <= this.hw.highWaterMark) {
        this.fireEvent(CopyFileEvent.PROGRESS, {
          success: false,
          progress: 100,
          totalBytes: filesize,
          transferredBytes: filesize,
          totalBytesFormatted: Utils.convertBytes(filesize),
          transferredBytesFormatted: Utils.convertBytes(filesize),
          path: this.dest,
          name: this.fs.basename(this.dest),
          itemsCount: 1,
          itemsComplete: 1,
          event: 'copy',
        } as Progress);
      }

      let bytesCopied: number = 0;

      const readStream: ReadStream = fs.createReadStream(this.src, this.hw);

      readStream.on('end', () => {
        this.fireEvent(CopyFileEvent.PROGRESS, Utils.getFullProgress('copy'));
        resolve();
      });
      readStream.on('error', (err: NodeJS.ErrnoException) => {
        this.fireEvent(CopyFileEvent.PROGRESS, Utils.getFullProgress('copy'));
        reject(err.message);
      });
      readStream.on('data', (chunk: Buffer): void => {
        bytesCopied += chunk.length;

        this.fireEvent(CopyFileEvent.PROGRESS, {
          success: false,
          progress: ((bytesCopied / filesize) * 100),
          totalBytes: filesize,
          transferredBytes: bytesCopied,
          totalBytesFormatted: Utils.convertBytes(filesize),
          transferredBytesFormatted: Utils.convertBytes(bytesCopied),
          path: this.dest,
          name: this.fs.basename(this.dest),
          itemsCount: 1,
          itemsComplete: 1,
          event: 'copy',
        } as Progress);
      });

      readStream.pipe(fs.createWriteStream(this.dest, this.hw));
    });
  }

  private async overwrite(overwrite: boolean = false): Promise<void> {
    if (await this.fs.exists(this.dest)) {
      if (overwrite) {
        await this.fs.rm(this.dest);
      } else {
        throw new Error(`Error, destination exist "${this.dest}"`);
      }
    }
  }

  private async copySymlink(): Promise<void> {
    return new Promise((resolve: () => void, reject: (err: string) => void) => {
      fs.readlink(this.src, (err: NodeJS.ErrnoException, linkPath: string) => {
        if (err) {
          return reject(err.message);
        }

        fs.symlink(linkPath, this.dest, (err: NodeJS.ErrnoException) => {
          if (err) {
            return reject(err.message);
          }

          return resolve();
        });
      });
    });
  }

  public async getSize(): Promise<number> {
    if (undefined !== this.size) {
      return this.size;
    }

    return new Promise((resolve: (value: number) => void, reject: (err: string) => void) => {
      fs.lstat(this.src, (err: NodeJS.ErrnoException, stat: Stats): void => {
        if (err) {
          return reject(err.message);
        }

        this.size = stat.size;

        return resolve(this.size);
      });
    });
  }
}