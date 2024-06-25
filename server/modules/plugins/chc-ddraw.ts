import AbstractPlugin, {PluginType} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';

export default class CncDdraw extends AbstractPlugin {
  protected code: string = 'cnc_ddraw';
  protected name: string = 'CnC ddraw';
  protected type: PluginType['type'] = 'plugin';
  protected description: string = 'Reimplentation of ddraw for CnC games';

  private installed: boolean;

  public async init(): Promise<void> {
  }

  public async isRequired(): Promise<boolean> {
    return !(!this.settings.isCncDdraw() || await this.isInstalled());
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      remoteVersion: '',
      version: '',
    };
  }

  public async install(): Promise<void> {
    if (!await this.isRequired()) {
      return;
    }

    this.events = this.kernels.getKernel();
    this.bindEvents();
    await this.app.getWineTricks().download();
    await this.setMetadata('cnc_ddraw', true);
    this.installed = true;
    const process: WatchProcess = await (this.events as Kernel).winetricks('cnc_ddraw');
    await process.wait();
    this.unbindEvents();
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = await this.getMetadata('cnc_ddraw') as boolean;

    return this.installed;
  }

  public async clear(): Promise<void> {
    this.installed = undefined;
  }
}