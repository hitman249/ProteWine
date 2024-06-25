import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class D3d12 extends AbstractPlugin {
  protected code: string = 'd3d12';
  protected name: string = 'd3d12';
  protected type: PluginType['type'] = 'config';
  protected description: string = 'Vkd3d Proton or Vkd3d';

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
      value: Boolean(this.config) ? this.config.isD3d12() : undefined,
    };
  }

  public async isRequired(): Promise<boolean> {
    return false;
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
    this.wineDllOverrides
      .add('d3d12', DllOverrides.BUILT_IN)
      .add('d3d12core', DllOverrides.BUILT_IN);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && !this.config.isD3d12();
  }

  public async clear(): Promise<void> {
  }
}