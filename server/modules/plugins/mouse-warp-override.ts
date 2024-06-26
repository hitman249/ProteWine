import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class MouseWarpOverride extends AbstractPlugin {
  protected readonly code: string = 'fixes.mouseWarpOverride';
  protected readonly name: string = 'Mouse warp acceleration';
  protected readonly type: PluginType['type'] = 'settings';
  protected readonly description: string = 'Mouse warp override on Wine / Proton';
  protected readonly template: ValueTemplate = ValueTemplate.MOUSE_OVERRIDE_ACCELERATION;

  private installed: boolean;
  private value: string;

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
      value: this.settings.getMouseWarpOverride(),
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

    const mode: string = this.settings.getMouseWarpOverride();
    const registry: string[] = [];

    switch (mode) {
      case 'enable':
        registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="enable"\n',
        );
        break;
      case 'force':
        registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="force"\n',
        );
        break;
      case 'disable':
        registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="disable"\n',
        );
        break;
    }

    await this.setMetadata(this.code, mode);

    this.value = mode;
    this.installed = true;

    return registry;
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = this.settings.getMouseWarpOverride() === await this.getValue();

    return this.installed;
  }

  public async getValue(): Promise<string> {
    if (undefined !== this.value) {
      return this.value;
    }

    this.value = await this.getMetadata(this.code) as string;

    return this.value;
  }

  public async clear(): Promise<void> {
    this.installed = undefined;
    this.value = undefined;
  }
}