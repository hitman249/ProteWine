import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';

export default class WindowsVersion extends AbstractPlugin {
  protected readonly code: string = 'windowsVersion';
  protected readonly name: string = 'Windows version';
  protected readonly type: PluginType['type'] = 'settings';
  protected readonly description: string = '';
  protected readonly template: ValueTemplate = ValueTemplate.WINVER;

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
      value: this.settings.getWindowsVersion(),
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

    const registry: string[] = [];
    const windowsVersion: string = this.settings.getWindowsVersion();

    switch (windowsVersion) {
      case 'win2k':
        registry.push(
          "\n\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\ProductOptions]\n",
          '"ProductType"=-\n',

          '[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion]\n',
          '"CSDVersion"="Service Pack 4"',
          '"CurrentBuildNumber"="2195"',
          '"CurrentVersion"="5.0"\n',

          '\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows]\n',
          '"CSDVersion"="dword:00000400"\n',
        );
        break;

      case 'winxp':
        registry.push(
          "\n\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\ProductOptions]\n",
          '"ProductType"=-\n',

          '[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion]\n',
          '"CSDVersion"="Service Pack 3"',
          '"CurrentBuildNumber"="2600"',
          '"CurrentVersion"="5.1"\n',

          '\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows]\n',
          '"CSDVersion"="dword:00000400"\n',
        );
        break;

      case 'win10':
        registry.push(
          "\n\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\ProductOptions]\n",
          '"ProductType"="WinNT"\n',

          '[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion]\n',
          '"CSDVersion"=""',
          '"CurrentBuildNumber"="10240"',
          '"CurrentVersion"="10.0"\n',

          '\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows]\n',
          '"CSDVersion"="dword:00000300"\n',
        );
        break;

      case 'win7':
      default:
        registry.push(
          "\n\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\ProductOptions]\n",
          '"ProductType"="WinNT"\n',

          '[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion]\n',
          '"CSDVersion"="Service Pack 1"',
          '"CurrentBuildNumber"="7601"',
          '"CurrentVersion"="6.1"\n',

          '\n[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Windows]\n',
          '"CSDVersion"="dword:00000300"\n',
        );
    }

    await this.setMetadata(this.code, windowsVersion);

    this.value = windowsVersion;
    this.installed = true;

    return registry;
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = this.settings.getWindowsVersion() === await this.getVersion();

    return this.installed;
  }

  public async getVersion(): Promise<string> {
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