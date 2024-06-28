import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import {RoutesRepositories} from '../routes';

export default class RepositoriesRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindList();
    this.bindListByName();
    this.bindInstallRunner();
  }

  private bindInstallRunner(): void {
    this.ipc.handle(
      RoutesRepositories.INSTALL,
      async (event: IpcMainInvokeEvent, url: string): Promise<any> =>
        this.app.getTasks()
          .installRunner(url)
          .then(() => undefined),
    );
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesRepositories.LIST,
      async (): Promise<any> => this.app.getRepositories().getList(),
    );
  }

  private bindListByName(): void {
    this.ipc.handle(
      RoutesRepositories.LIST_BY_NAME,
      async (event: IpcMainInvokeEvent, name: string): Promise<any> => this.app.getRepositories().getListByName(name),
    );
  }
}