import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class FsrStrength extends AbstractPlugin {
  protected readonly code: string = 'kernel.fsrStrength';
  protected readonly name: string = 'FSR Sharpening Strength';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = 'FidelityFX Super Resolution Sharpening Strength';
  protected readonly template: ValueTemplate = ValueTemplate.FSR_STRENGTH;

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
      value: Boolean(this.config) ? this.config.getFsrStrength() : undefined,
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
      WINE_FULLSCREEN_FSR_STRENGTH: this.config.getFsrStrength(),
    };
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && Boolean(this.config.getFrsMode());
  }

  public async clear(): Promise<void> {
  }
}