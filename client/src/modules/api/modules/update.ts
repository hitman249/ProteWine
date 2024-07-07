import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesUpdate} from '../../../../../server/routes/routes';
import type {SettingsType} from '../../../../../server/modules/settings';
import type {UpdateItem} from '../../../../../server/routes/modules/update';
import type {MenuItemType} from '../../menu';
import {ValueLabels, ValueTypes} from '../../value';

export default class Update extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async appVersion(): Promise<SettingsType> {
    return (await window.electronAPI.invoke(RoutesUpdate.APP_VERSION));
  }

  public async getList(): Promise<MenuItemType[]> {
    const items: UpdateItem[] = await window.electronAPI.invoke(RoutesUpdate.LIST);
    const result: MenuItemType[] = [];

    for await  (const item of items) {
      result.push({
        id: item.code,
        title: item.name,
        description: `Update ${item.version} -> ${item.remoteVersion}`,
        type: 'update',
        icon: 'protewine' === item.code ? 'update-self' : 'update-layer',
        item: {...item, type: 'update'},
        value: {
          value: '',
          labels: ValueLabels.FILE_MANAGER,
          type: ValueTypes.SELECT,
          hidden: false,
        },
      });
    }

    return result;
  }

  public async update(code: UpdateItem['code']): Promise<void> {
    return (await window.electronAPI.invoke(RoutesUpdate.UPDATE, code));
  }
}