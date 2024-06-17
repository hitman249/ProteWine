import type {BrowserWindow, IpcMain, IpcMainInvokeEvent} from 'electron';
import type {App} from '../../app';
import {AbstractModule} from '../../modules/abstract-module';
import {RoutesGames} from '../routes';
import type {ConfigType} from '../../modules/games/config';
import type {ImageType} from '../../modules/gallery';

export default class GamesRoutes extends AbstractModule {
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
    this.bindCreate();
    this.bindDebug();
    this.bindFindLinks();
    this.bindKill();
    this.bindList();
    this.bindRemove();
    this.bindRun();
    this.bindRunningGame();
    this.bindUpdateArguments();
    this.bindUpdateExe();
    this.bindUpdateImage();
    this.bindUpdateTitle();
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesGames.LIST,
      async (): Promise<any> => this.app.getGames().getList(),
    );
  }

  private bindFindLinks(): void {
    this.ipc.handle(
      RoutesGames.FIND_LINKS,
      async (): Promise<any> => this.app.getLinkInfo().findLinks(),
    );
  }

  private bindCreate(): void {
    this.ipc.handle(
      RoutesGames.CREATE,
      async (event: IpcMainInvokeEvent, data: ConfigType['game']): Promise<any> => this.app.getGames().create(data),
    );
  }

  private bindRemove(): void {
    this.ipc.handle(
      RoutesGames.REMOVE,
      async (event: IpcMainInvokeEvent, id: string | number): Promise<any> => this.app.getGames().removeById(id),
    );
  }

  private bindRun(): void {
    this.ipc.handle(
      RoutesGames.RUN,
      async (event: IpcMainInvokeEvent, id: string | number): Promise<any> => this.app.getGames().runById(id),
    );
  }

  private bindDebug(): void {
    this.ipc.handle(
      RoutesGames.DEBUG,
      async (event: IpcMainInvokeEvent, id: string | number): Promise<any> => this.app.getGames().debugById(id),
    );
  }

  private bindRunningGame(): void {
    this.ipc.handle(
      RoutesGames.RUNNING_GAME,
      async (event: IpcMainInvokeEvent): Promise<ConfigType> => this.app.getGames().getRunningGame()?.getConfig(),
    );
  }

  private bindKill(): void {
    this.ipc.handle(
      RoutesGames.KILL,
      async (event: IpcMainInvokeEvent): Promise<void> => this.app.getGames().kill(),
    );
  }

  private bindUpdateImage(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_IMAGE,
      async (event: IpcMainInvokeEvent, image: ImageType, id: string, type: 'poster' | 'icon'): Promise<any> =>
        this.app.getGames().updateImage(image, id, type),
    );
  }

  private bindUpdateExe(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_EXE,
      async (event: IpcMainInvokeEvent, id: string, path: string): Promise<void> => this.app.getGames().updateExeById(id, path),
    );
  }

  private bindUpdateArguments(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_ARGUMENTS,
      async (event: IpcMainInvokeEvent, id: string, cmd: string): Promise<void> => this.app.getGames().updateArgumentsById(id, cmd),
    );
  }

  private bindUpdateTitle(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_TITLE,
      async (event: IpcMainInvokeEvent, id: string, title: string): Promise<void> => this.app.getGames().updateTitleById(id, title),
    );
  }
}