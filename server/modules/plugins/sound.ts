import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';

export default class Sound extends AbstractPlugin {
  protected code: string = 'pulse';
  protected name: string = 'Sound';
  protected type: PluginType['type'] = 'settings';
  protected description: string = '';

  private installed: boolean;
  private value: boolean;

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
      remoteVersion: '',
      version: '',
    };
  }

  public async isRequired(): Promise<boolean> {
    return !await this.isInstalled();
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    if (!await this.isRequired()) {
      return [];
    }
    const value: boolean = (this.settings.isPulse() && await this.system.isPulse());
    await this.setMetadata(this.code, value);

    this.registry.push("\n[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n");

    if (value) {
      this.registry.push('"Audio"="pulse"\n');
    } else {
      this.registry.push('"Audio"="alsa"\n');
    }

    this.value = value;
    this.installed = true;

    return this.registry;
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = (this.settings.isPulse() && await this.system.isPulse()) === await this.getValue();

    return this.installed;
  }

  public async getValue(): Promise<boolean> {
    if (undefined !== this.value) {
      return this.value;
    }

    this.value = await this.getMetadata(this.code) as boolean;

    return this.value;
  }

  public async clear(): Promise<void> {
    this.value = undefined;
  }
}