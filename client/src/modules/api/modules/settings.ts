import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesSettings} from '../../../../../server/routes/routes';
import type {SettingsType} from '../../../../../server/modules/settings';

export default class Settings extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async get(): Promise<SettingsType> {
    return (await window.electronAPI.invoke(RoutesSettings.LIST));
  }

  public async set(path: string, value: string | boolean | number): Promise<void> {
    return (await window.electronAPI.invoke(RoutesSettings.SAVE, path, value));
  }
}