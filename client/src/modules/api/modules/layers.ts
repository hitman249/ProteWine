import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesLayers} from '../../../../../server/routes/routes';
import type {LayerType} from '../../../../../server/modules/layers/layer';
import type {MenuItemType} from '../../menu';
import {ValueLabels, ValueTypes} from '../../value';

export default class Layers extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async layerBefore(): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.BEFORE);
  }

  public async layerAfter(): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.AFTER);
  }

  public async cancel(): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.CANCEL);
  }

  public async remove(id: string): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.REMOVE, id);
  }

  public async updateTitle(id: string, title: string): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.CHANGE_TITLE, id, title);
  }

  public async updateActive(id: string, value: boolean): Promise<void> {
    return await window.electronAPI.invoke(RoutesLayers.CHANGE_ACTIVE, id, value);
  }

  public async isProcessed(): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.IS_PROCESSED));
  }

  public async exist(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.EXIST, id));
  }

  public async dbList(): Promise<LayerType[]> {
    return (await window.electronAPI.invoke(RoutesLayers.DB_LIST));
  }

  public async dbAdd(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.DB_ADD, id));
  }

  public async dbRemove(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.DB_REMOVE, id));
  }

  public async dbExist(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.DB_EXIST, id));
  }

  public async layerAdd(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.LAYER_ADD, id));
  }

  public async layerRemove(id: string): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesLayers.LAYER_REMOVE, id));
  }

  public async getList(): Promise<MenuItemType[]> {
    const items: LayerType[] = (await window.electronAPI.invoke(RoutesLayers.LIST));
    const result: MenuItemType[] = [];

    for await  (const item of items) {
      result.push({
        id: item.id,
        title: item.title,
        description: item.sizeFormatted,
        type: 'layers',
        icon: 'layers-list',
        item: {...item, type: 'layers'},
        value: {
          value: '',
          labels: ValueLabels.LAYER,
          type: ValueTypes.SELECT,
          hidden: true,
        },
      });
    }

    return result;
  }
}