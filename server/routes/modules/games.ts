import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import type {ConfigType} from '../../modules/games/config';
import type {ImageType} from '../../modules/gallery';
import {RoutesGames} from '../routes';

export default class GamesRoutes extends AbstractRouteModule {
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
    this.bindUpdateConfig();
    this.bindInfo();
    this.bindCreateIcon();
    this.bindRemoveIcon();
    this.bindCreateSteamIcon();
    this.bindRemoveSteamIcon();
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

  private bindInfo(): void {
    this.ipc.handle(
      RoutesGames.INFO,
      async (event: IpcMainInvokeEvent, id: string | number): Promise<ConfigType> => (await this.app.getGames().getInfoById(id)),
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

  private bindCreateIcon(): void {
    this.ipc.handle(
      RoutesGames.CREATE_ICON,
      async (event: IpcMainInvokeEvent, id: string, menuOrDesktop: boolean = false): Promise<void> => this.app.getGames().createIconById(id, menuOrDesktop),
    );
  }

  private bindRemoveIcon(): void {
    this.ipc.handle(
      RoutesGames.REMOVE_ICON,
      async (event: IpcMainInvokeEvent, id: string, menuOrDesktop: boolean = false): Promise<void> => this.app.getGames().removeIconsById(id, menuOrDesktop),
    );
  }

  private bindCreateSteamIcon(): void {
    this.ipc.handle(
      RoutesGames.CREATE_STEAM_ICON,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => this.app.getGames().createSteamIconById(id),
    );
  }

  private bindRemoveSteamIcon(): void {
    this.ipc.handle(
      RoutesGames.REMOVE_STEAM_ICON,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => this.app.getGames().removeSteamIconById(id),
    );
  }

  private bindUpdateConfig(): void {
    this.ipc.handle(
      RoutesGames.UPDATE_CONFIG,
      async (event: IpcMainInvokeEvent, id: string, path: string, value: string | boolean | number): Promise<void> => this.app.getGames().updateConfig(id, path, value),
    );
  }
}