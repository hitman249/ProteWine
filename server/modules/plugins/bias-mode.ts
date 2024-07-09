import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class BiasMode extends AbstractPlugin {
  protected readonly code: string = 'kernel.bias';
  protected readonly name: string = 'Bias Mode';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = '"WINE_VULKAN_NEGATIVE_MIP_BIAS" - This results in textures with higher resolution.';
  protected readonly template: ValueTemplate = ValueTemplate.BIAS_MODE;

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
      value: Boolean(this.config) ? this.config.getBiasMode() : undefined,
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

    return {
      WINE_VULKAN_NEGATIVE_MIP_BIAS: this.config.getBiasMode(),
    };
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && Boolean(this.config.getBiasMode());
  }

  public async clear(): Promise<void> {
  }
}