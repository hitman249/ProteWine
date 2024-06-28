import {AbstractRouteModule} from './abstract-route-module';
import {RoutesPrefix} from '../routes';

export default class PrefixRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindExist();
    this.bindProcessed();
    this.bindCreate();
    this.bindRefresh();
    this.bindProgress();
  }

  private bindExist(): void {
    this.ipc.handle(
      RoutesPrefix.EXIST,
      async (): Promise<boolean> => this.app.getPrefix().isExist(),
    );
  }

  private bindProcessed(): void {
    this.ipc.handle(
      RoutesPrefix.PROCESSED,
      async (): Promise<boolean> => this.app.getPrefix().isProcessed(),
    );
  }

  private bindProgress(): void {
    this.ipc.handle(
      RoutesPrefix.PROGRESS,
      async (): Promise<void> => this.app.getPrefix().sendLastProgress(),
    );
  }

  private bindCreate(): void {
    this.ipc.handle(
      RoutesPrefix.CREATE,
      async (): Promise<any> => this.app.getPrefix().create(),
    );
  }

  private bindRefresh(): void {
    this.ipc.handle(
      RoutesPrefix.REFRESH,
      async (): Promise<any> => this.app.getPrefix().refresh(),
    );
  }
}