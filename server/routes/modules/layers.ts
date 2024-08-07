import type {IpcMainInvokeEvent} from 'electron';
import {AbstractRouteModule} from './abstract-route-module';
import {RoutesLayers} from '../routes';
import type WatchProcess from '../../helpers/watch-process';
import Layer, {LayerType} from '../../modules/layers/layer';

export default class LayersRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindLayerBefore();
    this.bindLayerAfter();
    this.bindList();
    this.bindIsProcessed();
    this.bindChangeTitle();
    this.bindChangeActive();
    this.bindCancel();
    this.bindRemove();
    this.bindExist();
    this.bindDbList();
    this.bindDbAdd();
    this.bindDbRemove();
    this.bindDbExist();
    this.bindLayerAdd();
    this.bindLayerRemove();
  }

  private bindLayerBefore(): void {
    this.ipc.handle(
      RoutesLayers.BEFORE,
      async (event: IpcMainInvokeEvent): Promise<any> => {
        const process: WatchProcess = await this.app.getTasks().layerBefore();
        await process.wait();
      },
    );
  }

  private bindLayerAfter(): void {
    this.ipc.handle(
      RoutesLayers.AFTER,
      async (event: IpcMainInvokeEvent): Promise<any> => {
        const process: WatchProcess = await this.app.getTasks().layerAfter();
        await process.wait();
      },
    );
  }

  private bindCancel(): void {
    this.ipc.handle(
      RoutesLayers.CANCEL,
      async (event: IpcMainInvokeEvent): Promise<void> => await this.app.getLayers().cancel(),
    );
  }

  private bindList(): void {
    this.ipc.handle(
      RoutesLayers.LIST,
      async (event: IpcMainInvokeEvent): Promise<LayerType[]> => (await this.app.getLayers().getList()).map((layer: Layer) => layer.toObject()),
    );
  }

  private bindIsProcessed(): void {
    this.ipc.handle(
      RoutesLayers.IS_PROCESSED,
      async (event: IpcMainInvokeEvent): Promise<boolean> => (await this.app.getLayers().isProcessed()),
    );
  }

  private bindRemove(): void {
    this.ipc.handle(
      RoutesLayers.REMOVE,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().getById(id);

        if (layer) {
          await layer.remove();
        }
      },
    );
  }

  private bindChangeTitle(): void {
    this.ipc.handle(
      RoutesLayers.CHANGE_TITLE,
      async (event: IpcMainInvokeEvent, id: string, title: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().getById(id);

        if (layer) {
          await layer.setTitle(title);
        }
      },
    );
  }

  private bindChangeActive(): void {
    this.ipc.handle(
      RoutesLayers.CHANGE_ACTIVE,
      async (event: IpcMainInvokeEvent, id: string, value: boolean): Promise<void> => {
        const layer: Layer = await this.app.getLayers().getById(id);

        if (layer) {
          layer.set('active', value);
          await layer.save();
        }
      },
    );
  }

  private bindExist(): void {
    this.ipc.handle(
      RoutesLayers.EXIST,
      async (event: IpcMainInvokeEvent, id: string): Promise<boolean> => {
        const layer: Layer = await this.app.getLayers().database.getById(id);

        if (layer) {
          return await this.app.getLayers().exist(layer);
        }

        return false;
      },
    );
  }

  private bindDbList(): void {
    this.ipc.handle(
      RoutesLayers.DB_LIST,
      async (event: IpcMainInvokeEvent): Promise<LayerType[]> => (await this.app.getLayers().database.getList()).map((layer: Layer) => layer.toObject()),
    );
  }

  private bindDbAdd(): void {
    this.ipc.handle(
      RoutesLayers.DB_ADD,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().getById(id);

        if (layer) {
          await this.app.getLayers().database.addLayer(layer);
        }
      },
    );
  }

  private bindDbRemove(): void {
    this.ipc.handle(
      RoutesLayers.DB_REMOVE,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().database.getById(id);

        if (layer) {
          await this.app.getLayers().database.removeLayer(layer);
        }
      },
    );
  }

  private bindDbExist(): void {
    this.ipc.handle(
      RoutesLayers.DB_EXIST,
      async (event: IpcMainInvokeEvent, id: string): Promise<boolean> => {
        const layer: Layer = await this.app.getLayers().getById(id);

        if (layer) {
          return await this.app.getLayers().database.exist(layer);
        }

        return false;
      },
    );
  }

  private bindLayerAdd(): void {
    this.ipc.handle(
      RoutesLayers.LAYER_ADD,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().database.getById(id);

        if (layer) {
          await this.app.getLayers().addLayer(layer);
        }
      },
    );
  }

  private bindLayerRemove(): void {
    this.ipc.handle(
      RoutesLayers.LAYER_REMOVE,
      async (event: IpcMainInvokeEvent, id: string): Promise<void> => {
        const layer: Layer = await this.app.getLayers().database.getById(id);

        if (layer) {
          await this.app.getLayers().removeLayer(layer);
        }
      },
    );
  }
}