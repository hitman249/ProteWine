import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class Sound extends AbstractPlugin {
  protected readonly code: string = 'fixes.pulse';
  protected readonly name: string = 'Sound';
  protected readonly type: PluginType['type'] = 'settings';
  protected readonly description: string = 'Pulse / PipeWire or Alsa';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

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
      value: this.settings.isPulse(),
      template: this.template,
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

    const registry: string[] = [];

    registry.push("\n[HKEY_CURRENT_USER\\Software\\Wine\\Drivers]\n");

    if (value) {
      registry.push('"Audio"="pulse"\n');
    } else {
      registry.push('"Audio"="alsa"\n');
    }

    this.value = value;
    this.installed = true;

    return registry;
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
    this.installed = undefined;
    this.value = undefined;
  }
}