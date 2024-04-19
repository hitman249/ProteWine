import _ from 'lodash';
import path from 'path';
import {glob} from 'glob';
import md5_file from 'md5-file';
import fs, {type WriteFileOptions, type Stats} from 'fs';
import {AbstractModule} from './abstract-module';
import AppFolders from './app-folders';
import Command from './command';
import Utils from '../helpers/utils';
import CopyDir, {CopyDirEvent, type Options} from '../helpers/copy-dir';
import Archiver, {type Progress} from './archiver';
import CopyFile, {CopyFileEvent} from '../helpers/copy-file';

export default class FileSystem extends AbstractModule {
  private readonly appFolders: AppFolders;

  private DEFAULT_MODE_FILE: number = 0o644;
  private DEFAULT_MODE_DIR: number = 0o755;
  private FILE_APPEND: string = 'a';

  constructor(appFolders: AppFolders) {
    super();
    this.appFolders = appFolders;
  }

  public async init(): Promise<any> {
  }

  public async exec(cmd: string): Promise<string> {
    return await Command.create().exec(cmd);
  }

  public async exists(path: string): Promise<boolean> {
    return await new Promise((resolve: (exists: boolean) => void): void => {
      fs.access(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException): void => resolve(!err));
    });
  }

  public async isDirectory(path: string): Promise<boolean> {
    return await new Promise((resolve: (value: boolean) => void): void => {
      fs.stat(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException, stats: Stats): void => {
        if (err) {
          return resolve(false);
        }

        resolve(stats.isDirectory());
      });
    });
  }

  public async isFile(path: string): Promise<boolean> {
    return await new Promise((resolve: (value: boolean) => void): void => {
      fs.lstat(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException, stats: Stats): void => {
        if (err) {
          return resolve(false);
        }

        resolve(stats.isFile());
      });
    });
  }

  public async isSymbolicLink(path: string): Promise<boolean> {
    return await new Promise((resolve: (value: boolean) => void): void => {
      fs.lstat(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException, stats: Stats): void => {
        if (err) {
          return resolve(false);
        }

        resolve(stats.isSymbolicLink());
      });
    });
  }

  public async getCreateDate(path: string): Promise<Date> {
    return await new Promise((resolve: (value: Date) => void, reject: (err: any) => void): void => {
      fs.lstat(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException, stats: Stats): void => {
        if (err) {
          return reject(err);
        }

        resolve(stats.ctime);
      });
    });
  }

  public async mkdir(path: string): Promise<boolean> {
    return await this.exists(path)
      .then((exists: boolean): Promise<boolean> => {
        if (exists) {
          return;
        }

        return new Promise<boolean>((resolve: (value: boolean) => void): void => {
          const pathDir: string = _.trimEnd(path, '/');

          fs.mkdir(pathDir, {recursive: true, mode: this.DEFAULT_MODE_DIR}, (err: NodeJS.ErrnoException): void => {
            if (err) {
              return resolve(false);
            }

            resolve(true);
          });
        });
      });
  }

  public async size(path: string): Promise<number> {
    if (!await this.exists(path)) {
      return 0;
    }

    if (await this.isDirectory(path) && !await this.isSymbolicLink(path)) {
      return (await this.directoryAnalysis(path)).getSize();
    }

    return await new CopyFile(this, path).getSize();
  }

  public async directoryAnalysis(path: string): Promise<CopyDir> {
    return new CopyDir(this, path);
  }

  public convertBytes(bytes: number): string {
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
      return 'n/a';
    }

    const i: number = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

    if (i === 0) {
      return bytes + ' ' + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }

  public async rm(path: string): Promise<boolean> {
    path = _.trimEnd(path, '/');

    if (await this.isFile(path) || await this.isSymbolicLink(path)) {
      return await new Promise((resolve: (value: boolean) => void) => {
        fs.unlink(path, (err: NodeJS.ErrnoException) => {
          if (err) {
            resolve(false);
          }

          resolve(true);
        });
      });
    }

    return await new Promise((resolve: (value: boolean) => void) => {
      fs.rm(path, {recursive: true, force: true}, (err: NodeJS.ErrnoException) => {
        if (err) {
          resolve(false);
        }

        resolve(true);
      });
    });
  }

  public async mv(src: string, dest: string, options?: Options, callback?: (progress: Progress) => void): Promise<void> {
    if (await this.isDirectory(src)) {
      const copyDir: CopyDir = new CopyDir(this, src, dest);
      copyDir.on(
        CopyDirEvent.PROGRESS,
        (event: CopyDirEvent.PROGRESS, progress: Progress) => callback ? callback(progress) : undefined,
      );

      return copyDir.move(options);
    }

    const copyFile: CopyFile = new CopyFile(this, src, dest);
    copyFile.on(
      CopyFileEvent.PROGRESS,
      (event: CopyDirEvent.PROGRESS, progress: Progress) => callback ? callback(progress) : undefined,
    );

    return copyFile.move(options);
  }

  public async cp(src: string, dest: string, options?: Options, callback?: (progress: Progress) => void): Promise<void> {
    if (await this.isDirectory(src)) {
      const copyDir: CopyDir = new CopyDir(this, src, dest);
      copyDir.on(
        CopyDirEvent.PROGRESS,
        (event: CopyDirEvent.PROGRESS, progress: Progress) => callback ? callback(progress) : undefined,
      );

      return copyDir.copy(options);
    }

    const copyFile: CopyFile = new CopyFile(this, src, dest);
    copyFile.on(
      CopyFileEvent.PROGRESS,
      (event: CopyDirEvent.PROGRESS, progress: Progress) => callback ? callback(progress) : undefined,
    );

    return copyFile.copy(options);
  }

  public async resetFileTimestamps(path: string): Promise<boolean> {
    return await new Promise<boolean>((resolve: (value: boolean) => void) => {
      fs.open(path, 'r+', path, (err: NodeJS.ErrnoException, fd: number): void => {
        if (err) {
          return resolve(false);
        }

        fs.futimes(fd, Date.now(), Date.now(), (err: NodeJS.ErrnoException) => {
          if (err) {
            return resolve(false);
          }

          return resolve(true);
        });
      });
    });
  }

  public async cpHardLink(src: string, dest: string): Promise<string> {
    if (await this.isDirectory(src)) {
      return await this.exec(`\\cp -ra --link "${src}" "${dest}"`);
    }

    return await this.exec(`\\cp -a --link "${src}" "${dest}"`);
  }

  public async glob(path: string): Promise<string[]> {
    return await glob(path, {dot: true});
  }

  public async fileGetContents(filepath: string, autoEncoding: boolean = false): Promise<string> {
    return await new Promise((resolve: (value: string) => void, reject: (err: any) => void) => {
      fs.readFile(filepath, (err: NodeJS.ErrnoException, buffer: Buffer) => {
        if (err) {
          reject(err);
        }

        if (autoEncoding) {
          return resolve(Utils.normalize(buffer));
        }

        return resolve(buffer.toString());
      });
    });
  }

  public async fileGetContentsByEncoding(filepath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return await new Promise((resolve: (value: string) => void, reject: (err: any) => void) => {
      fs.readFile(filepath, {encoding}, (err: NodeJS.ErrnoException, buffer: Buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer.toString());
      });
    });
  }

  public async filePutContents(filepath: string, data: string | Buffer, flag?: string): Promise<void> {
    return await new Promise((resolve: (value: void) => void, reject: (err: any) => void) => {
      const options: WriteFileOptions = Object.assign(
        {mode: this.DEFAULT_MODE_FILE},
        flag ? {flag} : {},
      );

      fs.writeFile(filepath, data, options, (err: NodeJS.ErrnoException) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  }

  public async relativePath(absPath: string, path?: string): Promise<string> {
    if (undefined !== path) {
      return _.trimStart(absPath.replace(path, '').trim(), '/');
    }

    return _.trimStart(absPath.replace(await this.appFolders.getRootDir(), '').trim(), '/');
  }

  public async chmod(path: string): Promise<string> {
    return await this.exec('chmod +x -R ' + Utils.quote(path));
  }

  public async ln(path: string, dest: string): Promise<string> {
    return await this.exec(`cd "${await this.appFolders.getRootDir()}" && ln -sfr "${path}" "${dest}"`);
  }

  public async lnOfRoot(path: string, dest: string): Promise<void> {
    if (!await this.exists(path)) {
      await this.mkdir(path);
    }

    if (!await this.exists(dest)) {
      await this.mkdir(dest);
    }

    if (!await this.isEmptyDir(dest) && await this.isEmptyDir(path)) {
      await this.mv(dest, path, {overwrite: true});
    }

    if (await this.exists(dest)) {
      await this.rm(dest);
    }

    await this.ln(await this.relativePath(path), dest);
  }

  public async isEmptyDir(path: string): Promise<boolean> {
    return (await this.glob(`${_.trimEnd(path, '/')}/*`)).length === 0;
  }

  public dirname(src: string): string {
    return path.dirname(src);
  }

  public basename(src: string): string {
    return path.basename(src);
  }

  public extension(src: string): string {
    return _.trimStart(path.extname(src), '.');
  }

  public async getMd5File(src: string): Promise<string> {
    return await md5_file(src);
  }

  public async unpack(src: string, dest: string): Promise<Archiver> {
    return new Archiver(this, src, dest).unpack();
  }

  public isArchive(path: string): boolean {
    return Archiver.isArchive(path);
  }

  public async pack(path: string): Promise<Archiver> {
    return new Archiver(this, path).pack();
  }

  public getAppFolders(): AppFolders {
    return this.appFolders;
  }
}