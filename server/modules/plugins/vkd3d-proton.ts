import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';

export default class Vkd3dProton extends AbstractPlugin {
  protected readonly code: string = 'plugins.vkd3dProton';
  protected readonly name: string = 'VKD3D Proton';
  protected readonly type: PluginType['type'] = 'plugin';
  protected readonly description: string = 'Vulkan-based implementation of D3D12';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

  private version: string;
  private remoteVersion: string;

  public async init(): Promise<void> {
  }

  public async isRequired(): Promise<boolean> {
    return !(!this.settings.isVkd3dProton() || await this.getVersion());
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async getEnv(): Promise<EnvType> {
    return {
      VKD3D_SHADER_CACHE_PATH: await this.kernels.getKernel().getCacheDir(),
      VKD3D_LOG_FILE: `${await this.kernels.getKernel().getLogsDir()}/vkd3d.log`,
    };
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      value: this.settings.isVkd3dProton(),
      template: this.template,
    };
  }

  public async install(): Promise<void> {
    if (!await this.isRequired()) {
      return;
    }

    this.events = this.kernels.getKernel();
    this.bindEvents();
    await this.app.getWineTricks().download();
    await this.setMetadata(this.code, await this.getRemoteVersion());
    this.version = this.remoteVersion;
    const process: WatchProcess = await (this.events as Kernel).winetricks('vkd3d');
    await process.wait();
    this.unbindEvents();
  }

  public async getRemoteVersion(): Promise<string> {
    if (undefined !== this.remoteVersion) {
      return this.remoteVersion;
    }

    this.remoteVersion = (await this.getReleases())[0].tag_name;

    return this.remoteVersion;
  }

  public async getVersion(): Promise<string> {
    if (undefined !== this.version) {
      return this.version;
    }

    this.version = await this.getMetadata(this.code) as string;

    return this.version;
  }

  private async getReleases(): Promise<any> {
    return await this.network.getJSON('https://api.github.com/repos/HansKristian-Work/vkd3d-proton/releases');
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(await this.getVersion());
  }

  public async clear(): Promise<void> {
    this.version = undefined;
  }
}