import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class Fsync extends AbstractPlugin {
  protected readonly code: string = 'kernel.fsync';
  protected readonly name: string = 'Fsync';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = '';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

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
      value: Boolean(this.config) ? this.config.isFsync() : undefined,
      template: this.template,
    };
  }

  public async isRequired(): Promise<boolean> {
    return false;
  }

  public async getEnv(): Promise<EnvType> {
    if (!await this.isInstalled()) {
      return;
    }

    if (this.config.isFsync()) {
      return {
        WINEFSYNC: '1',
        PROTON_NO_FSYNC: '0',
      };
    }

    return {
      WINEFSYNC: '0',
      PROTON_NO_FSYNC: '1',
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