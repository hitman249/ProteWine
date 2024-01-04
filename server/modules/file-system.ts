import AppFolders from './app-folders';
import Utils from '../helpers/utils';
import _ from 'lodash';
import child_process from 'child_process';
import fs, {WriteFileOptions} from 'fs';
import {glob} from 'glob';
import md5_file from 'md5-file';
import path from 'path';
import type {ExecException} from 'child_process';
import type {Stats} from 'fs';

type TypeFile = 'directory' | 'file';

type CopyMoveOptions = {
  move?: boolean,
  overwrite?: boolean,
  preserveFileDate?: boolean,
  filter?: (path: string, type: TypeFile) => boolean,
};

type ArchiveType = {path: string, size: number};

export default class FileSystem {
  private appFolders: AppFolders;

  private DEFAULT_MODE_FILE: number = 0o644;
  private DEFAULT_MODE_DIR: number = 0o755;
  private FILE_APPEND: string = 'a';

  constructor(appFolders: AppFolders) {
    this.appFolders = appFolders;
  }

  public async exec(cmd: string): Promise<string> {
    return await new Promise<string>((resolve: (value: string) => void): void => {
      child_process.exec(cmd, (error: ExecException, stdout: string): void => resolve(String(stdout).trim()));
    });
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
    if (await this.isDirectory(path) && !await this.isSymbolicLink(path)) {
      return await this.getDirectorySize(path);
    }

    if (!await this.exists(path)) {
      return 0;
    }

    return await this.getSize(path);
  }

  private async getSize(path: string): Promise<number> {
    return await new Promise((resolve: (size: number) => void) => {
      fs.lstat(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException, stats: Stats) => {
        if (err) {
          resolve(0);
        }

        resolve(stats.size);
      });
    });
  }

  public async getDirectorySize(path: string): Promise<number> {
    let totalSize: number = 0;

    const arrayOfFiles: string[] = await this.getAllFiles(path);

    for await (const filePath of arrayOfFiles) {
      if (await this.isDirectory(filePath) && !await this.isSymbolicLink(filePath)) {
        continue;
      }

      totalSize += await this.getSize(filePath);
    }

    return totalSize;
  }

  public async getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
    return await new Promise<string[]>((resolve: (files: string[]) => void, reject: (err: any) => void) => {
      dirPath = _.trimEnd(dirPath, '/');

      fs.readdir(dirPath, (err: NodeJS.ErrnoException, files: string[]) => {
        if (err) {
          return reject(err);
        }

        resolve(files);
      });
    })
      .then((files: string[]) => {
        let promise: Promise<string[]> = Promise.resolve() as any;

        files.forEach((file: string) => {
          arrayOfFiles.push(path.join(dirPath, file));

          let isDirectory: boolean;
          let isSymbolicLink: boolean;

          promise = promise
            .then(() => this.isDirectory(dirPath + '/' + file).then((value: boolean) => (isDirectory = value)))
            .then(() => this.isSymbolicLink(dirPath + '/' + file).then((value: boolean) => (isSymbolicLink = value)))
            .then((): Promise<string[]> | string[] => {
              if (isDirectory && !isSymbolicLink) {
                return this.getAllFiles(dirPath + '/' + file, arrayOfFiles);
              }

              return arrayOfFiles;
            });
        });

        return promise;
      });
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

  public async mv(src: string, dest: string, options: CopyMoveOptions = {}): Promise<boolean> {
    await this.cp(src, dest, Object.assign({move: true}, options));
    return await this.rm(src);
  }

  public async cp(src: string, dest: string, options: CopyMoveOptions = {}, symlinkSync: boolean = true): Promise<boolean> {
    const defaultOptions: CopyMoveOptions = {
      overwrite: true,
      preserveFileDate: true,
      move: false,
      filter: (): boolean => true,
    };

    const getType = async (path: string): Promise<TypeFile> => {
      const isDirectory: boolean = await this.isDirectory(path);
      const isSymbolicLink: boolean = await this.isSymbolicLink(path);

      return new Promise<TypeFile>((resolve: (value?: TypeFile) => void) => {
        fs.readlink(path, (err: NodeJS.ErrnoException, linkPath: string) => {
          if (err) {
            return resolve('file');
          }

          if (false === symlinkSync) {
            if (isSymbolicLink) {
              if (_.startsWith(linkPath, '/dev/') || _.startsWith(linkPath, '/proc/')) {
                return 'directory';
              }
            }

            return isDirectory ? 'directory' : 'file';
          }

          return isDirectory && !isSymbolicLink ? 'directory' : 'file';
        });
      });
    };

    const isSymlinkSync = async (path: string): Promise<boolean> => {
      if (symlinkSync) {
        return true;
      }

      const type: TypeFile = await getType(path);
      const symbolicLink: boolean = await this.isSymbolicLink(path);

      return symbolicLink && 'directory' === type;
    };

    const copySymbolic = async (src: string, dest: string): Promise<boolean> => {
      return new Promise((resolve: (value: boolean) => void) => {
        fs.readlink(src, (err: NodeJS.ErrnoException, linkPath: string) => {
          if (err) {
            return resolve(false);
          }

          fs.symlink(linkPath, dest, (err: NodeJS.ErrnoException) => {
            if (err) {
              return resolve(false);
            }

            return resolve(true);
          });
        });
      });
    };

    const srcPath: string = path.resolve(src);
    const destPath: string = path.resolve(dest);

    if (!path.relative(srcPath, destPath).startsWith('.')) {
      throw new Error('dest path must be out of src path');
    }

    const settings: CopyMoveOptions = Object.assign(defaultOptions, options);
    const operation: (src: string, dest: string, flag: number, move: boolean) => Promise<boolean> =
      async (src: string, dest: string, flag: number, move: boolean) => {
        return new Promise((resolve: (value: boolean) => void) => {
          if (move) {
            fs.rename(src, dest, (err: NodeJS.ErrnoException) => {
              if (err) {
                return resolve(false);
              }

              return resolve(true);
            });
          } else {
            fs.copyFile(srcPath, destPath, flag, (err: NodeJS.ErrnoException) => {
              if (err) {
                return resolve(false);
              }

              return resolve(true);
            });
          }
        });
      };

    if (await isSymlinkSync(srcPath) && !settings.move && await this.isSymbolicLink(srcPath)) {
      await copySymbolic(srcPath, destPath);
      return true;
    }

    if (await this.isFile(srcPath)) {
      await operation(srcPath, destPath, settings.overwrite ? 0 : fs.constants.COPYFILE_EXCL, settings.move);
      return true;
    }

    const copyDirSync0 = async (srcPath: string, destPath: string, settings: CopyMoveOptions): Promise<boolean> => {
      const readdir: (dirPath: string) => Promise<string[]> = async (dirPath: string): Promise<string[]> => {
        return await new Promise<string[]>((resolve: (files: string[]) => void, reject: (err: any) => void) => {
          fs.readdir(dirPath, (err: NodeJS.ErrnoException, files: string[]) => {
            if (err) {
              return reject(err);
            }

            resolve(files);
          });
        });
      };

      const files: string[] = await readdir(srcPath);

      if (!await this.exists(destPath)) {
        await this.mkdir(destPath);
      } else if (!await this.isDirectory(destPath)) {
        if (settings.overwrite) {
          throw new Error(`Cannot overwrite non-directory '${destPath}' with directory '${srcPath}'.`);
        }
        return;
      }

      for await (const filename of files) {
        const childSrcPath: string = path.join(srcPath, filename);
        const childDestPath: string = path.join(destPath, filename);
        const type: TypeFile = await getType(childSrcPath);

        if (!settings.filter(childSrcPath, type)) {
          continue;
        }

        if (await isSymlinkSync(childSrcPath) && !settings.move && await this.isSymbolicLink(childSrcPath)) {
          await copySymbolic(childSrcPath, childDestPath);
          continue;
        }

        if (type === 'directory') {
          await copyDirSync0(childSrcPath, childDestPath, settings);
        } else {
          await operation(childSrcPath, childDestPath, settings.overwrite ? 0 : fs.constants.COPYFILE_EXCL, settings.move);

          if (!settings.preserveFileDate) {
            await this.resetFileTimestamps(childDestPath);
          }
        }
      }
    };

    await copyDirSync0(srcPath, destPath, settings);
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
    return await glob(path);
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
    return await this.exec(`cd "${this.appFolders.getRootDir()}" && ln -sfr "${path}" "${dest}"`);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async unpackXz(inFile: string, outDir: string, type: string = 'xf', glob: string = '', archiver: string = 'tar', simple: boolean = false): Promise<boolean> {
    if (!await this.exists(inFile) || await this.isDirectory(inFile)) {
      return false;
    }

    if (await this.exists(outDir)) {
      await this.rm(outDir);
    }

    const tmpDir: string = this.appFolders.getCacheDir() + `/tmp_${Utils.rand(10000, 99999)}`;
    await this.mkdir(tmpDir);

    if (!await this.exists(tmpDir)) {
      return false;
    }

    const fileName: string = this.basename(inFile);
    const mvFile: string = `${tmpDir}/${fileName}`;
    await this.mv(inFile, mvFile);

    await this.exec(`cd "${tmpDir}" && ${archiver} ${type} "./${fileName}"`);
    await this.rm(mvFile);

    if (simple) {
      await this.mv(tmpDir, outDir);
      return true;
    }

    const finds: string[] = (await this.glob(`${tmpDir}/*`))
      .filter((path: string) => this.exists(`${path}/bin`) || this.exists(`${path}/proton`));

    if (finds.length === 0) {
      const root: string[] = await this.glob(`${tmpDir}/*`);

      for await (const level1 of root) {
        const listFiles: string[] = await this.glob(`${level1}/*`);

        for await (const level2 of listFiles) {
          if (await this.exists(`${level2}/bin`) || await this.exists(`${level2}/proton`)) {
            finds.push(level2);
          }
        }
      }
    }

    let path: string = tmpDir;

    if (finds.length > 0) {
      path = _.head(finds);
    }

    if (await this.exists(`${path}/bin`) || await this.exists(`${path}/proton`)) {
      if (await this.exists(`${path}/proton`)) {
        await this.chmod(`${path}/proton`);
      }

      if (await this.exists(`${path}/bin`)) {
        await this.chmod(`${path}/bin`);
      }

      await this.mv(path, outDir);
    } else {
      let archives: ArchiveType[] =
        (await this.glob(`${tmpDir}/*`))
          .filter((path: string) => this.isArchive(path))
          .map((path: string) => ({path, size: 0}));

      if (archives.length === 0) {
        const root: string[] = await this.glob(`${tmpDir}/*`);

        for (const level1 of root) {
          const listFiles: string[] = await this.glob(`${level1}/*`);

          for (const level2 of listFiles) {
            if (this.isArchive(level2)) {
              archives.push({path: level2, size: 0});
            }
          }
        }
      }

      for await (const archive of archives) {
        archive.size = await this.size(archive.path);
      }

      archives = archives.sort((a: ArchiveType, b: ArchiveType): number => {
        const sa: number = a.size;
        const sb: number = b.size;

        if (sa > sb) {
          return -1;
        }
        if (sa < sb) {
          return -1;
        }

        return 0;
      });

      if (archives.length > 0) {
        await this.unpack(_.head(archives).path, outDir);
      }
    }

    if (await this.exists(tmpDir)) {
      await this.rm(tmpDir);
    }

    return true;
  }

  public async unpackGz(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
    return await this.unpackXz(inFile, outDir, '-xzf', '', 'tar', simple);
  }

  public async unpackPol(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
    return await this.unpackXz(inFile, outDir, '-xjf', 'wineversion/', 'tar', simple);
  }

  public async unpackRar(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
    return await this.unpackXz(inFile, outDir, 'x', '', 'unrar', simple);
  }

  public async unpackZip(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
    return await this.unpackXz(inFile, outDir, '', '', 'unzip', simple);
  }

  public async unpack(inFile: string, outDir: string, simple: boolean = false): Promise<boolean> {
    if (_.endsWith(inFile, '.tar.xz')) {
      return await this.unpackXz(inFile, outDir, 'xf', '', 'tar', simple);
    }
    if (_.endsWith(inFile, '.tar.gz') || _.endsWith(inFile, '.tgz')) {
      return await this.unpackGz(inFile, outDir, simple);
    }
    if (_.endsWith(inFile, '.pol')) {
      return await this.unpackPol(inFile, outDir, simple);
    }
    if (_.endsWith(inFile, '.exe') || _.endsWith(inFile, '.rar')) {
      return await this.unpackRar(inFile, outDir, simple);
    }
    if (_.endsWith(inFile, '.zip')) {
      return await this.unpackZip(inFile, outDir, simple);
    }

    return false;
  }

  public async unpackSimpleZip(inFile: string, outDir: string): Promise<boolean> {
    const tmpDir: string = this.appFolders.getCacheDir() + `/tmp_${Utils.rand(10000, 99999)}`;
    await this.mkdir(tmpDir);

    if (!await this.exists(tmpDir)) {
      return false;
    }

    const fileName: string = this.basename(inFile);
    const mvFile: string = `${tmpDir}/${fileName}`;
    await this.mv(inFile, mvFile);

    await this.exec(`cd "${tmpDir}" && unzip "./${fileName}"`);
    await this.rm(mvFile);

    const finds: string[] = await this.glob(`${tmpDir}/*`);
    let path: string = tmpDir;

    if (finds.length === 1 && await this.isDirectory(finds[0])) {
      path = finds[0];
    }

    await this.mv(path, outDir);

    if (await this.exists(tmpDir)) {
      await this.rm(tmpDir);
    }

    return true;
  }

  public isArchive(path: string): boolean {
    if (_.endsWith(path, '.tar.xz')) {
      return true;
    }
    if (_.endsWith(path, '.tar.gz') || _.endsWith(path, '.tgz')) {
      return true;
    }
    if (_.endsWith(path, '.pol')) {
      return true;
    }
    if (_.endsWith(path, '.exe') || _.endsWith(path, '.rar')) {
      return true;
    }
    if (_.endsWith(path, '.zip')) {
      return true;
    }
  }

  public async pack(folder: string): Promise<boolean> {
    folder = _.trimEnd(folder, '\\/');

    if (!await this.exists(folder) || await this.exists(`${folder}.tar.gz`)) {
      return false;
    }

    await this.exec(`cd "${folder}" && tar -zcf "${folder}.tar.gz" -C "${folder}" .`);

    return await this.exists(`${folder}.tar.gz`);
  }
}