import type {IpcMainInvokeEvent} from 'electron';
import {AbstractRouteModule} from './abstract-route-module';
import {RoutesNativeKeyboard} from '../routes';

export default class NativeKeyboardRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindOpen();
    this.bindClose();
  }

  private bindOpen(): void {
    this.ipc.handle(
      RoutesNativeKeyboard.OPEN,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getNativeKeyboard().open(),
    );
  }

  private bindClose(): void {
    this.ipc.handle(
      RoutesNativeKeyboard.CLOSE,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getNativeKeyboard().close(),
    );
  }
}