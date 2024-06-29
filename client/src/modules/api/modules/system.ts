import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesSystem} from '../../../../../server/routes/routes';
import type {SettingsType} from '../../../../../server/modules/settings';

export default class System extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async appExit(): Promise<SettingsType> {
    return (await window.electronAPI.invoke(RoutesSystem.APP_EXIT));
  }
}