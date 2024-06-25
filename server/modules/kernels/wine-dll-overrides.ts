import _ from 'lodash';
import {EnvType} from './environment';

export enum DllOverrides {
  NATIVE_BUILT_IN = 'n,b',
  BUILT_IN = 'b',
  NATIVE = 'n',
  BUILT_IN_NATIVE = 'b,n',
  DISABLE = '',
}

export type WineDllOverridesType = {[lib: string]: DllOverrides};

export default class WineDllOverrides {
  private readonly values: WineDllOverridesType = {};

  constructor(overrides?: string) {
    if (overrides) {
      overrides.split(';').forEach((chunk: string) => {
        const [lib, value]: string[] = chunk.split('=');
        this.values[lib] = value as DllOverrides;
      });
    }
  }

  public add(lib: string, override: DllOverrides): this {
    if (_.endsWith(lib, '.dll')) {
      const chunks: string[] = lib.split('');
      this.values[chunks.slice(0, chunks.length - 4).join('')] = override;
    } else {
      this.values[lib] = override;
    }

    return this;
  }

  public async getEnv(): Promise<EnvType> {
    return {
      WINEDLLOVERRIDES: Object.keys(this.values).map((lib: string) => `${lib}=${this.values[lib]}`).join(';'),
    };
  }
}