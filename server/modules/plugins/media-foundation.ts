import AbstractPlugin, {PluginType} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';

export default class MediaFoundation extends AbstractPlugin {
  protected code: string = 'mf';
  protected name: string = 'Media Foundation';
  protected type: PluginType['type'] = 'plugin';
  protected description: string = 'Multimedia framework from Microsoft to replace DirectShow, available starting with Windows Vista';

  private installed: boolean;

  public async init(): Promise<void> {
  }

  public async isRequired(): Promise<boolean> {
    return !(!this.settings.isMediaFoundation() || await this.isInstalled());
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      value: this.settings.isMediaFoundation(),
    };
  }

  public async install(): Promise<void> {
    if (!await this.isRequired()) {
      return;
    }

    this.events = this.kernels.getKernel();
    this.bindEvents();
    await this.app.getWineTricks().download();
    await this.setMetadata('mf', true);
    this.installed = true;
    const process: WatchProcess = await (this.events as Kernel).winetricks('mf');
    await process.wait();
    this.unbindEvents();
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = await this.getMetadata('mf') as boolean;

    return this.installed;
  }

  public async clear(): Promise<void> {
    this.installed = undefined;
  }
}