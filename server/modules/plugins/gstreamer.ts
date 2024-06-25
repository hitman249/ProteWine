import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class Gstreamer extends AbstractPlugin {
  protected code: string = 'gstreamer';
  protected name: string = 'Gstreamer';
  protected type: PluginType['type'] = 'settings';
  protected description: string = 'WineGStreamer (Disabling helps in cases where the prefix creation process hangs)';

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
    this.wineDllOverrides.add('winegstreamer', DllOverrides.DISABLE);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return !this.settings.isGstreamer();
  }

  public async clear(): Promise<void> {
  }
}