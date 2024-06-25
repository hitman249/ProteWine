import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class Mono extends AbstractPlugin {
  protected code: string = 'mono';
  protected name: string = 'Mono';
  protected type: PluginType['type'] = 'settings';
  protected description: string = '.NET Framework compatible counterpart';

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
    return false;
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
    this.wineDllOverrides.add('mscoree', DllOverrides.DISABLE);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return !this.settings.isMono();
  }

  public async clear(): Promise<void> {
  }
}