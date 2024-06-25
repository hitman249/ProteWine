import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class Nvapi extends AbstractPlugin {
  protected code: string = 'nvapi';
  protected name: string = 'Nvapi';
  protected type: PluginType['type'] = 'config';
  protected description: string = 'Nvidia Api';

  public async init(): Promise<void> {
  }

  public async install(): Promise<void> {
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      value: Boolean(this.config) ? this.config.isNvapi() : undefined,
    };
  }

  public async isRequired(): Promise<boolean> {
    return false;
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
    this.wineDllOverrides
      .add('nvapi', DllOverrides.DISABLE)
      .add('nvapi64', DllOverrides.DISABLE)
      .add('nvcuda', DllOverrides.DISABLE)
      .add('nvcuda64', DllOverrides.DISABLE);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && !this.config.isNvapi();
  }

  public async clear(): Promise<void> {
  }
}