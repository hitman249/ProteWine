import AbstractPlugin, {PluginType, ValueTemplate} from './abstract-plugin';
import type {Kernel} from '../kernels';
import type WatchProcess from '../../helpers/watch-process';
import type {EnvType} from '../kernels/environment';

export default class Isskin extends AbstractPlugin {
  protected readonly code: string = 'plugins.isskin';
  protected readonly name: string = 'Isskin';
  protected readonly type: PluginType['type'] = 'plugin';
  protected readonly description: string = 'Fix game installers error';
  protected readonly template: ValueTemplate = ValueTemplate.BOOLEAN;

  private installed: boolean;

  public async init(): Promise<void> {
  }

  public async isRequired(): Promise<boolean> {
    return !(!this.settings.isIsskin() || await this.isInstalled());
  }

  public async getRegistry(): Promise<string[]> {
    return [];
  }

  public async getEnv(): Promise<EnvType> {
    return;
  }

  public async setDllOverrides(): Promise<void> {
  }

  public async toObject(): Promise<PluginType> {
    return {
      code: this.code,
      name: this.name,
      type: this.type,
      description: this.description,
      value: this.settings.isIsskin(),
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
    await this.setMetadata(this.code, true);
    this.installed = true;
    const process: WatchProcess = await (this.events as Kernel).winetricks('mfc42');
    await process.wait();
    this.unbindEvents();
  }

  public async isInstalled(): Promise<boolean> {
    if (undefined !== this.installed) {
      return this.installed;
    }

    this.installed = await this.getMetadata(this.code) as boolean;

    return this.installed;
  }

  public async clear(): Promise<void> {
    this.installed = undefined;
  }
}