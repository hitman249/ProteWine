import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
export default class FsrStrength extends AbstractPlugin {
  protected code: string = 'fsr';
  protected name: string = 'FSR Sharpening Strength';
  protected type: PluginType['type'] = 'config';
  protected description: string = 'FidelityFX Super Resolution Sharpening Strength';

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