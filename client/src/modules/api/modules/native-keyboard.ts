import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesNativeKeyboard} from '../../../../../server/routes/routes';

export default class NativeKeyboard extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async open(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesNativeKeyboard.OPEN));
  }

  public async close(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesNativeKeyboard.CLOSE));
  }
}