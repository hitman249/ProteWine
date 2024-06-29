import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';
import type Plugins from './index';

export default class Dxvk extends AbstractPlugin {
  protected readonly code: string = 'plugins.dxvk';
  protected readonly name: string = 'DXVK';
  protected readonly type: PluginType['type'] = 'plugin';
  protected readonly description: string = 'Vulkan-based implementation of D3D9, D3D10 and D3D11';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

  private version: string;
  private remoteVersion: string;

  constructor(plugins: Plugins) {
    super(plugins);
  }

  public async init(): Promise<void> {
  }

  public async isRequired(): Promise<boolean> {
    return !(!this.settings.isDxvk() || await this.getVersion());
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      value: this.settings.isDxvk(),
      template: this.template,
    };
  }

  public async getEnv(): Promise<EnvType> {
    return {
      DXVK_CONFIG_FILE: await this.kernels.getKernel().getDxvkFile(),
      DXVK_STATE_CACHE_PATH: await this.kernels.getKernel().getCacheDir(),
      DXVK_LOG_PATH: await this.kernels.getKernel().getLogsDir(),
    };
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async install(): Promise<void> {
    if (!await this.isRequired()) {
      return;
    }

    this.events = this.kernels.getKernel();
    this.bindEvents();
    await this.app.getWineTricks().download();
    await this.setMetadata(this.code, await this.getRemoteVersion());

    const configPath: string = await this.appFolders.getDxvkConfFile();

    if (!await this.fs.exists(configPath)) {
      const configText: string = await this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/dxvk.conf');

      if (configText) {
        await this.fs.filePutContents(configPath, configText);
      }
    }

    if (await this.fs.exists(configPath)) {
      const configPathByPrefix: string = await this.kernels.getKernel().getDxvkFile();

      if (!await this.fs.exists(configPathByPrefix)) {
        await this.fs.lnOfRoot(configPath, configPathByPrefix);
      }
    }

    this.version = this.remoteVersion;
    const process: WatchProcess = await (this.events as Kernel).winetricks('dxvk');
    await process.wait();
    this.unbindEvents();
  }

  public async getRemoteVersion(): Promise<string> {
    if (undefined !== this.remoteVersion) {
      return this.remoteVersion;
    }

    this.remoteVersion = ((await this.network.get('https://raw.githubusercontent.com/doitsujin/dxvk/master/RELEASE')) || '').trim();

    return this.remoteVersion;
  }

  public async getVersion(): Promise<string> {
    if (undefined !== this.version) {
      return this.version;
    }

    this.version = await this.getMetadata(this.code) as string;

    return this.version;
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(await this.getVersion());
  }

  public async clear(): Promise<void> {
    this.version = undefined;
  }
}