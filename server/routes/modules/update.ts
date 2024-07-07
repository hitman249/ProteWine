import type {IpcMainInvokeEvent} from 'electron';
import {AbstractRouteModule} from './abstract-route-module';
import {RoutesUpdate} from '../routes';
import type WatchProcess from '../../helpers/watch-process';
import type Plugins from '../../modules/plugins';
import type Update from '../../modules/update';

export type UpdateItem = {
  code: 'protewine' | 'dxvk' | 'vkd3d-proton' | string,
  name: string,
  version: string,
  remoteVersion: string,
};

export default class UpdateRoutes extends AbstractRouteModule {

  public async init(): Promise<any> {
    this.bindAppVersion();
    this.bindList();
    this.bindUpdate();
  }

  private bindAppVersion(): void {
    this.ipc.handle(
      RoutesUpdate.APP_VERSION,
      async (event: IpcMainInvokeEvent): Promise<any> => this.app.getUpdate().getVersion(),
    );
  }

  private bindUpdate(): void {
    this.ipc.handle(
      RoutesUpdate.UPDATE,
      async (event: IpcMainInvokeEvent, code: UpdateItem['code']): Promise<void> => {
        let process: WatchProcess;

        switch (code) {
          case 'protewine':
            process = await this.app.getTasks().updateSelf();
            await process.wait();
            break;

          case 'dxvk':
            await (await this.app.getPlugins().getDxvk().removeMetadata()).clear();
            process = await this.app.getTasks().installPlugins();
            await process.wait();
            break;

          case 'vkd3d-proton':
            await (await this.app.getPlugins().getVkd3dProton().removeMetadata()).clear();
            process = await this.app.getTasks().installPlugins();
            await process.wait();
            break;
        }
      },
    );
  }

  private bindList(): void {
    this.ipc.handle(RoutesUpdate.LIST, async (): Promise<UpdateItem[]> => {
      const result: UpdateItem[] = [];

      const update: Update = this.app.getUpdate();

      const selfVersion: string = update.getVersion();
      const selfRemoteVersion: string = await update.getRemoteVersion();

      if (selfVersion !== selfRemoteVersion && selfRemoteVersion && selfVersion) {
        result.push({
          code: 'protewine',
          name: 'ProteWine',
          version: selfVersion,
          remoteVersion: selfRemoteVersion,
        });
      }

      const plugins: Plugins = this.app.getPlugins();

      if (await plugins.getDxvk().isInstalled()) {
        const dxvkVersion: string = await plugins.getDxvk().getVersion();
        const dxvkRemoteVersion: string = await plugins.getDxvk().getRemoteVersion();

        if (dxvkVersion !== dxvkRemoteVersion && dxvkRemoteVersion && dxvkVersion) {
          result.push({
            code: 'dxvk',
            name: 'DXVK',
            version: dxvkVersion,
            remoteVersion: dxvkRemoteVersion,
          });
        }
      }

      if (await plugins.getVkd3dProton().isInstalled()) {
        const vkd3dProtonVersion: string = await plugins.getVkd3dProton().getVersion();
        const vkd3dProtonRemoteVersion: string = await plugins.getVkd3dProton().getRemoteVersion();

        if (vkd3dProtonVersion !== vkd3dProtonRemoteVersion && vkd3dProtonRemoteVersion && vkd3dProtonVersion) {
          result.push({
            code: 'vkd3d-proton',
            name: 'VKD3D Proton',
            version: vkd3dProtonVersion,
            remoteVersion: vkd3dProtonRemoteVersion,
          });
        }
      }

      return result;
    });
  }
}