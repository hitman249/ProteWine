import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';

export default class Esync extends AbstractPlugin {
  protected code: string = 'esync';
  protected name: string = 'Esync';
  protected type: PluginType['type'] = 'config';
  protected description: string = '';

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
      value: Boolean(this.config) ? this.config.isEsync() : undefined,
    };
  }

  public async isRequired(): Promise<boolean> {
    return false;
  }

  public async getEnv(): Promise<EnvType> {
    if (!await this.isInstalled()) {
      return;
    }

    if (this.config.isEsync()) {
      return {
        WINEESYNC: '1',
        PROTON_NO_ESYNC: '0',
      };
    }

    return {
      WINEESYNC: '0',
      PROTON_NO_ESYNC: '1',
    };
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config);
  }

  public async clear(): Promise<void> {
  }
}