import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesUpdate} from '../../../../../server/routes/routes';
import type {SettingsType} from '../../../../../server/modules/settings';

export default class Update extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async appVersion(): Promise<SettingsType> {
    return (await window.electronAPI.invoke(RoutesUpdate.APP_VERSION));
  }
}