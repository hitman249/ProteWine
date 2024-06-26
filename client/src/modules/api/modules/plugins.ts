import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesPlugins} from '../../../../../server/routes/routes';
import type {MenuItemType} from '../../menu';
import type {PluginType} from '../../../../../server/modules/plugins/abstract-plugin';
import {ValueLabels, ValueTypes} from '../../value';

export default class Plugins extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async install(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesPlugins.INSTALL));
  }

  public async getList(id?: string): Promise<PluginType[]> {
    return (await window.electronAPI.invoke(RoutesPlugins.LIST, id));
  }

  private async getListByType(type: PluginType['type'], id?: string): Promise<MenuItemType[]> {
    const items: PluginType[] = await this.getList(id);
    const result: MenuItemType[] = [];

    for await  (const item of items) {
      if (type === item.type) {
        result.push({
          id: item.code,
          title: item.name,
          description: item.description,
          type: item.type,
          icon: 'settings',
          value: {
            value: item.value,
            labels: item.template as any,
            type: ValueTypes.SELECT,
            hidden: false,
          },
        });
      }
    }

    return result;
  }

  public async getPlugins(id?: string): Promise<MenuItemType[]> {
    return this.getListByType('plugin', id);
  }

  public async getConfigs(id?: string): Promise<MenuItemType[]> {
    return this.getListByType('config', id);
  }

  public async getSettings(id?: string): Promise<MenuItemType[]> {
    return this.getListByType('settings', id);
  }
}