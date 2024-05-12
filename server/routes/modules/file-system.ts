import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import System from '../../modules/system';
import type FileSystem from '../../modules/file-system';
import {AbstractModule} from '../../modules/abstract-module';
import _ from 'lodash';
import type {App} from '../../app';
import {RoutesFileSystem} from '../routes';
import Utils from '../../helpers/utils';

export default class FileSystemRoutes extends AbstractModule {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super();
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;
  }

  public async init(): Promise<any> {
    this.bindLs();
    this.bindStorages();
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
}