import AbstractPlugin, {PluginType} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';

export default class Vkd3dProton extends AbstractPlugin {
  protected code: string = 'vkd3d-proton';
  protected name: string = 'VKD3D Proton';
  protected type: PluginType['type'] = 'plugin';
  protected description: string = 'Vulkan-based implementation of D3D12';

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
      remoteVersion: await this.getRemoteVersion(),
      version: await this.getVersion(),
    };
  }

  public async install(): Promise<void> {
    if (!await this.isRequired()) {
      return;
    }

    this.events = this.kernels.getKernel();
    this.bindEvents();
    await this.app.getWineTricks().download();
    await this.setMetadata('vkd3d-proton', await this.getRemoteVersion());
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

    this.version = await this.getMetadata('vkd3d-proton') as string;

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