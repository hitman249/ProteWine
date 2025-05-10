import {AbstractModule} from '../abstract-module';
import AbstractPlugin, {PluginType} from './abstract-plugin';
import type AppFolders from '../app-folders';
import type FileSystem from '../file-system';
import type Network from '../network';
import type System from '../system';
import type Tasks from '../tasks';
import type {App} from '../../app';
import type Kernels from '../kernels';
import type {Kernel} from '../kernels';
import type Settings from '../settings';
import type {EnvType} from '../kernels/environment';
import type WatchProcess from '../../helpers/watch-process';
import Utils from '../../helpers/utils';
import Dxvk from './dxvk';
import {KernelOperation, SessionType} from '../kernels/abstract-kernel';
import Vkd3dProton from './vkd3d-proton';
import Isskin from './isskin';
import MediaFoundation from './media-foundation';
import CncDdraw from './chc-ddraw';
import WineDllOverrides from '../kernels/wine-dll-overrides';
import WindowsVersion from './windows-version';
import Sound from './sound';
import NoCrashDialog from './no-crash-dialog';
import Focus from './focus';
import MouseWarpOverride from './mouse-warp-override';
import {RoutesTaskEvent} from '../../routes/routes';
import type {Progress} from '../archiver';
import EventListener from '../../helpers/event-listener';
import D3d8 from './d3d8';
import D3d9 from './d3d9';
import D3d10 from './d3d10';
import D3d11 from './d3d11';
import D3d12 from './d3d12';
import Esync from './esync';
import Fsync from './fsync';
import Gecko from './gecko';
import Mono from './mono';
import Gstreamer from './gstreamer';
import Nvapi from './nvapi';
import FsrMode from './fsr-mode';
import FsrStrength from './fsr-strength';
import type Config from '../games/config';
import BiasMode from './bias-mode';
import Window from './window';
import Ntsync from './ntsync';

export default class Plugins extends AbstractModule {
  private readonly DXVK: Dxvk;
  private readonly VKD3D_PROTON: Vkd3dProton;
  private readonly ISSKIN: Isskin;
  private readonly MEDIA_FOUNDATION: MediaFoundation;
  private readonly CNC_DDRAW: CncDdraw;
  private readonly WINDOWS_VERSION: WindowsVersion;
  private readonly SOUND: Sound;
  private readonly NO_CRASH_DIALOG: NoCrashDialog;
  private readonly FOCUS: Focus;
  private readonly MOUSE_WARP_OVERRIDE: MouseWarpOverride;
  private readonly WINDOW: Window;
  private readonly D3D8: D3d8;
  private readonly D3D9: D3d9;
  private readonly D3D10: D3d10;
  private readonly D3D11: D3d11;
  private readonly D3D12: D3d12;
  private readonly NTSYNC: Ntsync;
  private readonly ESYNC: Esync;
  private readonly FSYNC: Fsync;
  private readonly GECKO: Gecko;
  private readonly MONO: Mono;
  private readonly GSTREAMER: Gstreamer;
  private readonly NVAPI: Nvapi;
  private readonly FSR_MODE: FsrMode;
  private readonly FSR_STRENGTH: FsrStrength;
  private readonly BIAS_MODE: BiasMode;

  private readonly modules: AbstractPlugin[] = [];

  public readonly appFolders: AppFolders;
  public readonly fs: FileSystem;
  public readonly network: Network;
  public readonly system: System;
  public readonly tasks: Tasks;
  public readonly kernels: Kernels;
  public readonly app: App;
  public readonly settings: Settings;
  public wineDllOverrides: WineDllOverrides;
  public config: Config;

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network, system: System, tasks: Tasks, kernels: Kernels, app: App, settings: Settings) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.network = network;
    this.system = system;
    this.tasks = tasks;
    this.kernels = kernels;
    this.app = app;
    this.settings = settings;

    this.DXVK = new Dxvk(this);
    this.VKD3D_PROTON = new Vkd3dProton(this);
    this.ISSKIN = new Isskin(this);
    this.MEDIA_FOUNDATION = new MediaFoundation(this);
    this.CNC_DDRAW = new CncDdraw(this);
    this.WINDOWS_VERSION = new WindowsVersion(this);
    this.SOUND = new Sound(this);
    this.NO_CRASH_DIALOG = new NoCrashDialog(this);
    this.FOCUS = new Focus(this);
    this.MOUSE_WARP_OVERRIDE = new MouseWarpOverride(this);
    this.WINDOW = new Window(this);
    this.D3D8 = new D3d8(this);
    this.D3D9 = new D3d9(this);
    this.D3D10 = new D3d10(this);
    this.D3D11 = new D3d11(this);
    this.D3D12 = new D3d12(this);
    this.NTSYNC = new Ntsync(this);
    this.ESYNC = new Esync(this);
    this.FSYNC = new Fsync(this);
    this.GECKO = new Gecko(this);
    this.MONO = new Mono(this);
    this.GSTREAMER = new Gstreamer(this);
    this.NVAPI = new Nvapi(this);
    this.FSR_MODE = new FsrMode(this);
    this.FSR_STRENGTH = new FsrStrength(this);
    this.BIAS_MODE = new BiasMode(this);

    this.modules.push(
      // plugin
      this.DXVK,
      this.VKD3D_PROTON,
      this.ISSKIN,
      this.MEDIA_FOUNDATION,
      this.CNC_DDRAW,

      // settings
      this.WINDOWS_VERSION,
      this.SOUND,
      this.NO_CRASH_DIALOG,
      this.FOCUS,
      this.MOUSE_WARP_OVERRIDE,
      this.MONO,
      this.GECKO,
      this.GSTREAMER,

      // config
      this.WINDOW,
      this.FSR_MODE,
      this.FSR_STRENGTH,
      this.BIAS_MODE,
      this.NTSYNC,
      this.ESYNC,
      this.FSYNC,
      this.NVAPI,
      this.D3D12,
      this.D3D11,
      this.D3D10,
      this.D3D9,
      this.D3D8,
    );

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async init(): Promise<void> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public async clear(): Promise<void> {
    for await (const module of this.modules) {
      await module.clear();
    }
  }

  public async install(registry: string[] = []): Promise<void> {
    const winetricksLog: string = `${await this.kernels.getKernel().getPrefixDir()}/winetricks.log`;

    if (await this.fs.exists(winetricksLog)) {
      await this.fs.rm(winetricksLog);
    }

    for await (const module of this.modules) {
      await module.clear();

      if (await module.isRequired()) {
        this.bindEvents(module);

        if ('plugin' === module.getType()) {
          module.logConfigure();
        }

        await module.install();

        this.unbindEvents(module);
      }
    }

    await this.applyRegistry(registry);
  }

  private async run(cmd: string): Promise<void> {
    const process: WatchProcess = await this.tasks.kernel(cmd, KernelOperation.INSTALL, SessionType.RUN_IN_PREFIX);
    await process.wait();
  }

  public async applyRegistry(registry: string[] = []): Promise<void> {
    const kernel: Kernel = this.kernels.getKernel();
    let path: string = `${await kernel.getDriveCDir()}/registry.reg`;

    for await (const module of this.modules) {
      await module.clear();

      const lines: string[] = await module.getRegistry();

      if (lines && lines.length > 0) {
        this.bindEvents(module);
        module.logRegistry();
        registry.push(...lines);
        this.unbindEvents(module);
      }
    }

    if (registry.length === 0) {
      return;
    }

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }

    await this.fs.filePutContents(path, Utils.encode(['Windows Registry Editor Version 5.00\n', ...registry].join('\n'), 'utf-16'));
    await this.run(`regedit /S "${path}"`);
  }

  public async getEnv(): Promise<EnvType> {
    this.wineDllOverrides = new WineDllOverrides();

    let result: EnvType = {};

    for await (const module of this.modules) {
      await module.clear();

      if (await module.isInstalled()) {
        await module.setDllOverrides();
        const env: EnvType = await module.getEnv();

        if (env) {
          result = Object.assign(result, env);
        }
      }
    }

    const env: EnvType = await this.wineDllOverrides.getEnv();

    if (env) {
      result = Object.assign(result, env);
    }

    return result;
  }

  public setConfig(config: Config): void {
    this.config = config;
  }

  public async getList(id?: string): Promise<PluginType[]> {
    if (id) {
      this.setConfig(await this.app.getGames().getById(id));
    } else {
      this.setConfig(undefined);
    }

    const result: PluginType[] = [];

    for await (const module of this.modules) {
      result.push(await module.toObject());
    }

    return result;
  }

  private unbindEvents(events: EventListener): void {
    if (!events) {
      return;
    }

    events.off(RoutesTaskEvent.RUN, this.onRun);
    events.off(RoutesTaskEvent.LOG, this.onLog);
    events.off(RoutesTaskEvent.PROGRESS, this.onProgress);
    events.off(RoutesTaskEvent.ERROR, this.onError);
    events.off(RoutesTaskEvent.EXIT, this.onExit);
  }

  private bindEvents(events: EventListener): void {
    this.unbindEvents(events);

    if (!events) {
      return;
    }

    events.on(RoutesTaskEvent.RUN, this.onRun);
    events.on(RoutesTaskEvent.LOG, this.onLog);
    events.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    events.on(RoutesTaskEvent.ERROR, this.onError);
    events.on(RoutesTaskEvent.EXIT, this.onExit);
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  private onLog(event: RoutesTaskEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  private onError(event: RoutesTaskEvent.ERROR, error: string): void {
    this.fireEvent(RoutesTaskEvent.ERROR, error);
  }

  private onExit(): void {
    this.fireEvent(RoutesTaskEvent.EXIT);
  }

  public getDxvk(): Dxvk {
    return this.DXVK;
  }

  public getVkd3dProton(): Vkd3dProton {
    return this.VKD3D_PROTON;
  }
}