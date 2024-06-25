import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class D3d10 extends AbstractPlugin {
  protected code: string = 'd3d10';
  protected name: string = 'd3d10';
  protected type: PluginType['type'] = 'config';
  protected description: string = 'DXVK or OpenGL';

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
      value: Boolean(this.config) ? this.config.isD3d10() : undefined,
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
      .add('d3d10', DllOverrides.BUILT_IN)
      .add('d3d10_1', DllOverrides.BUILT_IN)
      .add('d3d10core', DllOverrides.BUILT_IN);

    if (!this.config.isD3d11()) {
      this.wineDllOverrides.add('dxgi', DllOverrides.BUILT_IN);
    }
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && !this.config.isD3d10();
  }

  public async clear(): Promise<void> {
  }
}