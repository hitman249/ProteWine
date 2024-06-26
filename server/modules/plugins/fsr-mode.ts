import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

/**
 * 4K:
 * {1920, 1080},  /* 16:9 - 'FSR 2160p Performance'
 * {2259, 1270}, /* 16:9 - 'FSR 2160p Balanced'
 * {2560, 1440},  /* 16:9 - 'FSR 2160p Quality'
 * {2954, 1662}, /* 16:9 - 'FSR 2160p Ultra Quality'
 *
 * Ultra-wide:
 * {1720, 720}, /* 21:9 - 'FSR ultra-wide Performance'
 * {2024, 847}, /* 21:9 - 'FSR ultra-wide Balanced'
 * {2293, 960}, /* 21:9 - 'FSR ultra-wide Quality'
 * {2646, 1108}, /* 21:9 - 'FSR ultra-wide Ultra Quality'
 *
 * 2K:
 * {1280, 720},  /* 16:9 - 'FSR 1440p Performance'
 * {1506, 847},  /* 16:9 - 'FSR 1440p Balanced'
 * {1706, 960},  /* 16:9 - 'FSR 1440p Quality'
 * {1970, 1108}, /* 16:9 - 'FSR 1440p Ultra Quality'
 *
 * 1080p:
 * {960, 640},  /* 16:9 - 'FSR 1080p Performance'
 * {1129, 635},  /* 16:9 - 'FSR 1080p Balanced'
 * {1280, 720},  /* 16:9 - 'FSR 1080p Quality'
 * {1477, 831},  /* 16:9 - 'FSR 1080p Ultra Quality'
 */

export default class FsrMode extends AbstractPlugin {
  protected readonly code: string = 'kernel.fsrMode';
  protected readonly name: string = 'FSR Mode';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = 'FidelityFX Super Resolution Upscaling Resolution Mode';
  protected readonly template: ValueTemplate = ValueTemplate.FSR_MODE;

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
      value: Boolean(this.config) ? this.config.getFrsMode() : undefined,
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
      WINE_FULLSCREEN_FSR: '1',
      WINE_FULLSCREEN_FSR_MODE: this.config.getFrsMode(),
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