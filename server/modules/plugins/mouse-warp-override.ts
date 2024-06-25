import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';

export default class MouseWarpOverride extends AbstractPlugin {
  protected code: string = 'mouse-warp-override';
  protected name: string = 'MouseWarpOverride';
  protected type: PluginType['type'] = 'settings';
  protected description: string = '';

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

    const mode: string = this.settings.getMouseWarpOverride();

    switch (mode) {
      case 'enable':
        this.registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="enable"\n',
        );
        break;
      case 'force':
        this.registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="force"\n',
        );
        break;
      case 'disable':
        this.registry.push(
          "\n[HKEY_CURRENT_USER\\Software\\Wine\\DirectInput]\n",
          '"MouseWarpOverride"="disable"\n',
        );
        break;
    }

    await this.setMetadata(this.code, mode);

    this.value = mode;
    this.installed = true;

    return this.registry;
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
    this.value = undefined;
  }
}