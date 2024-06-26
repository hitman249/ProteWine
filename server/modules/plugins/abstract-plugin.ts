import {AbstractModule} from '../abstract-module';
import type Plugins from './index';
import type FileSystem from '../file-system';
import type System from '../system';
import type {App} from '../../app';
import type AppFolders from '../app-folders';
import type Kernels from '../kernels';
import type Network from '../network';
import type Tasks from '../tasks';
import type Settings from '../settings';
import {RoutesTaskEvent} from '../../routes/routes';
import type {Progress} from '../archiver';
import type EventListener from '../../helpers/event-listener';
import type {EnvType} from '../kernels/environment';
import WineDllOverrides from '../kernels/wine-dll-overrides';
import {KernelEvent} from '../kernels/abstract-kernel';
import type Config from '../games/config';

export enum ValueTemplate {
  BOOLEAN = 'boolean',
  WINVER = 'winver',
  FSR_MODE = 'fsrMode',
  FSR_STRENGTH = 'fsrStrength',
  MOUSE_OVERRIDE_ACCELERATION = 'mouseOverrideAcceleration',
}

export type PluginType = {
  code: string,
  name: string,
  type: 'plugin' | 'settings' | 'config',
  description: string,
  value: string | boolean,
  template: ValueTemplate,
};

export default abstract class AbstractPlugin extends AbstractModule {
  protected abstract readonly code: string;
  protected abstract readonly name: string;
  protected abstract readonly type: PluginType['type'];
  protected abstract readonly description: string;
  protected abstract readonly template: ValueTemplate;

  protected readonly plugins: Plugins;

  protected events: EventListener;

  constructor(plugins: Plugins) {
    super();

    this.plugins = plugins;

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public abstract install(): Promise<void>;

  public abstract clear(): Promise<void>;

  public abstract isRequired(): Promise<boolean>;

  public abstract isInstalled(): Promise<boolean>;

  public abstract toObject(): Promise<PluginType>;

  public abstract getEnv(): Promise<EnvType>;

  public abstract setDllOverrides(): Promise<void>;

  public abstract getRegistry(): Promise<string[]>;

  public getType(): PluginType['type'] {
    return this.type;
  }

  public get wineDllOverrides(): WineDllOverrides {
    return this.plugins.wineDllOverrides;
  }

  public get fs(): FileSystem {
    return this.plugins.fs;
  }

  public get system(): System {
    return this.plugins.system;
  }

  public get app(): App {
    return this.plugins.app;
  }

  public get appFolders(): AppFolders {
    return this.plugins.appFolders;
  }

  public get kernels(): Kernels {
    return this.plugins.kernels;
  }

  public get network(): Network {
    return this.plugins.network;
  }

  public get tasks(): Tasks {
    return this.plugins.tasks;
  }

  public get settings(): Settings {
    return this.plugins.settings;
  }

  public get config(): Config | undefined {
    return this.plugins.config;
  }

  protected unbindEvents(): void {
    if (!this.events) {
      return;
    }

    this.events.off(KernelEvent.RUN, this.onRun);
    this.events.off(KernelEvent.LOG, this.onLog);
    // this.events.off(KernelEvent.PROGRESS, this.onProgress);
    this.events.off(KernelEvent.ERROR, this.onError);
    this.events.off(KernelEvent.EXIT, this.onExit);
  }

  protected bindEvents(): void {
    this.unbindEvents();

    if (!this.events) {
      return;
    }

    this.events.on(KernelEvent.RUN, this.onRun);
    this.events.on(KernelEvent.LOG, this.onLog);
    // this.events.on(KernelEvent.PROGRESS, this.onProgress);
    this.events.on(KernelEvent.ERROR, this.onError);
    this.events.on(KernelEvent.EXIT, this.onExit);
  }

  protected onRun(event: KernelEvent.RUN, cmd: string): void {
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  protected onLog(event: KernelEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  public logConfigure(): void {
    this.onLog(KernelEvent.LOG, `Configure "${this.name}".`);
  }

  public logRegistry(): void {
    this.onLog(KernelEvent.LOG, `Registration "${this.name}".`);
  }

  protected onProgress(event: RoutesTaskEvent.PROGRESS, progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  protected onError(event: KernelEvent.ERROR, error: string): void {
    this.fireEvent(RoutesTaskEvent.ERROR, error);
  }

  protected onExit(): void {
    this.fireEvent(RoutesTaskEvent.EXIT);
  }

  protected async getMetadata(field: string): Promise<string | boolean | number | undefined> {
    return await this.kernels.getKernel().getMetadata(field);
  }

  protected async setMetadata(field: string, value: string | boolean | number): Promise<void> {
    return await this.kernels.getKernel().setMetadata(field, value);
  }
}