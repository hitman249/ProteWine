import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class Ntsync extends AbstractPlugin {
  protected readonly code: string = 'kernel.ntsync';
  protected readonly name: string = 'NTSync';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = 'Run "sudo modprobe ntsync && lsmod | grep -i ntsync" to enable NTSync';
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
      value: Boolean(this.config) ? this.config.isNtsync() : undefined,
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

    if (this.config.isNtsync()) {
      return {
        WINE_DISABLE_FAST_SYNC: '0',
        PROTON_USE_NTSYNC: '1',
      };
    }

    return {
      WINE_DISABLE_FAST_SYNC: '1',
      PROTON_USE_NTSYNC: '0',
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