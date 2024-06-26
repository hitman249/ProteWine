import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class Focus extends AbstractPlugin {
  protected readonly code: string = 'fixes.focus';
  protected readonly name: string = 'Fix focus';
  protected readonly type: PluginType['type'] = 'settings';
  protected readonly description: string = 'Required for games with focus loss';
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
      value: this.settings.isFocus(),
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

    const value: boolean = this.settings.isFocus();
    await this.setMetadata(this.code, value);

    const registry: string[] = [];

    if (value) {
      registry.push(
        "\n[HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver]\n",
        '"GrabFullscreen"="Y"',
        '"UseTakeFocus"="N"',
      );
    } else {
      registry.push(
        "\n[HKEY_CURRENT_USER\\Software\\Wine\\X11 Driver]\n",
        '"GrabFullscreen"=-',
        '"UseTakeFocus"=-',
      );
    }

    this.value = value;
    this.installed = true;

    return registry;
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = this.settings.isFocus() === await this.getValue();

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