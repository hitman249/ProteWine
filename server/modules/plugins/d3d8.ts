import type {EnvType} from '../kernels/environment';
import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';
import {DllOverrides} from '../kernels/wine-dll-overrides';

export default class D3d8 extends AbstractPlugin {
  protected readonly code: string = 'kernel.d3d8';
  protected readonly name: string = 'd3d8';
  protected readonly type: PluginType['type'] = 'config';
  protected readonly description: string = 'DXVK or OpenGL';
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
      value: Boolean(this.config) ? this.config.isD3d8() : undefined,
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
    this.wineDllOverrides.add('d3d8', DllOverrides.BUILT_IN);
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async isInstalled(): Promise<boolean> {
    return Boolean(this.config) && !this.config.isD3d8();
  }

  public async clear(): Promise<void> {
  }
}