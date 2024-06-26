import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class Gstreamer extends AbstractPlugin {
  protected readonly code: string = 'plugins.gstreamer';
  protected readonly name: string = 'GStreamer';
  protected readonly type: PluginType['type'] = 'settings';
  protected readonly description: string = 'WineGStreamer (Disabling helps in cases where the prefix creation process hangs)';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

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
      value: this.settings.isGstreamer(),
      template: this.template,
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