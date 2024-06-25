import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class Gecko extends AbstractPlugin {
  protected code: string = 'gecko';
  protected name: string = 'Gecko';
  protected type: PluginType['type'] = 'settings';
  protected description: string = 'Gecko browser engine (needed to emulate IE WebView inside Wine)';

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
    this.wineDllOverrides.add('mshtml', DllOverrides.DISABLE);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return !this.settings.isGecko();
  }

  public async clear(): Promise<void> {
  }
}