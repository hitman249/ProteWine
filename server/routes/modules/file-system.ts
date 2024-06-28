import _ from 'lodash';
import {AbstractRouteModule} from './abstract-route-module';
import Utils from '../../helpers/utils';
import type {IpcMainInvokeEvent} from 'electron';
import type FileSystem from '../../modules/file-system';
import type System from '../../modules/system';
import {RoutesFileSystem} from '../routes';

export default class FileSystemRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindLs();
    this.bindStorages();
    this.bindCopy();
    this.bindMove();
    this.bindSymlink();
    this.bindBasename();
    this.bindDirname();
  }

  private bindLs(): void {
    this.ipc.handle(
      RoutesFileSystem.LS,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => {
        const safePath: string = _.trimEnd(path, '/')
          .split('[').join('\\[').split(']').join('\\]')
          .split('(').join('\\(').split(')').join('\\)');

        const fs: FileSystem = this.app.getFileSystem();
        const list: string[] = await fs.glob(`${safePath}/*`);
        const result: any[] = [];

        for await (const pathfile of list) {
          const directory: boolean = await fs.isDirectory(pathfile);
          const size: number = directory ? 0 : await fs.size(pathfile);

          result.push({
            path: pathfile,
            directory,
            size,
            sizeFormat: directory ? '' : Utils.convertBytes(size),
            extension: _.toLower(fs.extension(pathfile)),
            basename: fs.basename(pathfile),
            dirname: fs.dirname(pathfile),
          });
        }

        const compare: (x: string, y: string) => number =
          (new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})).compare;

        return result.sort((a: any, b: any): number => {
          if (b.directory && !a.directory) {
            return 1;
          }

          if (a.directory && !b.directory) {
            return -1;
          }

          const ext: number = compare(a.extension, b.extension);

          if (-1 === ext || 1 === ext) {
            return ext;
          }

          return compare(a.path, b.path);
        });
      },
    );
  }

  private bindStorages(): void {
    this.ipc.handle(
      RoutesFileSystem.STORAGES,
      async (): Promise<any> => {
        const fs: FileSystem = this.app.getFileSystem();
        const system: System = this.app.getSystem();

        const storages: string[] = [];

        const media: string[] = [
          `/media/${await system.getUserName()}`,
          '/mnt',
          '/run/media',
        ];

        for await (const path of media) {
          if ((await fs.exists(path)) && (await fs.glob(`${path}/*`)).filter((path: string) => fs.isDirectory(path)).length > 0) {
            storages.push(path);
          }
        }

        storages.push(await system.getHomeDir());
        storages.push('/');

        return storages.map((path: string) => ({
          path,
          directory: true,
          size: 0,
          sizeFormat: '',
          extension: '',
          basename: fs.basename(path),
          dirname: fs.dirname(path),
        }));
      },
    );
  }

  private bindCopy(): void {
    this.ipc.handle(
      RoutesFileSystem.COPY,
      async (event: IpcMainInvokeEvent, src: string, dest: string): Promise<any> => this.app.getTasks().cp(src, dest),
    );
  }

  private bindMove(): void {
    this.ipc.handle(
      RoutesFileSystem.MOVE,
      async (event: IpcMainInvokeEvent, src: string, dest: string): Promise<any> => this.app.getTasks().mv(src, dest),
    );
  }

  private bindSymlink(): void {
    this.ipc.handle(
      RoutesFileSystem.SYMLINK,
      async (event: IpcMainInvokeEvent, src: string, dest: string): Promise<any> => this.app.getTasks().ln(src, dest),
    );
  }

  private bindBasename(): void {
    this.ipc.handle(
      RoutesFileSystem.BASENAME,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => this.app.getFileSystem().basename(path),
    );
  }

  private bindDirname(): void {
    this.ipc.handle(
      RoutesFileSystem.DIRNAME,
      async (event: IpcMainInvokeEvent, path: string): Promise<any> => this.app.getFileSystem().dirname(path),
    );
  }
}