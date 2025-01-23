import type AppFolders from '../app-folders';
import Command from '../command';
import Driver, {GPU} from '../driver';

export type EnvType = {[field: string]: string};

export default class Environment {
  protected appFolders: AppFolders;
  protected command: Command;
  protected driver: Driver;

  protected PATH: string[] = [];
  protected env: EnvType = {};

  constructor(appFolders: AppFolders, command: Command, driver: Driver) {
    this.appFolders = appFolders;
    this.command = command;
    this.driver = driver;
  }

  public async init(): Promise<void> {
    const prefix: string = await this.appFolders.getPrefixDir();

    const path: string = await this.appFolders.getBinDir();

    if (-1 === this.PATH.indexOf(path)) {
      this.PATH.push(path);
    }

    this.set('WINEDEBUG', '-all');
    this.set('WINEPREFIX', prefix);
    this.set('WINEARCH', 'win64');
    this.set('STEAM_COMPAT_DATA_PATH', prefix);
    this.set('LC_ALL', await this.command.getLocale());
    this.set('XDG_CACHE_HOME', await this.appFolders.getCacheDir());
    this.set('VK_LAYER_PATH', `$VK_LAYER_PATH:${await this.appFolders.getCacheImplicitLayerDir()}`);
    // this.set('LD_LIBRARY_PATH', `$LD_LIBRARY_PATH:${await this.appFolders.getLib64Dir()}`);
  }

  public set(field: string, value: string | number): void {
    this.env[field] = String(value);
  }

  public get(field: string): string {
    return this.env[field];
  }

  public toObject(): EnvType {
    return Object.assign({}, this.env, {
      PATH: `$PATH:${this.PATH.join(':')}`,
    });
  }

  public extend(env: EnvType): void {
    for (const field of Object.keys(this.env)) {
      this.set(field, this.env[field]);
    }
  }

  public addPath(path: string): void {
    if (-1 === this.PATH.indexOf(path)) {
      this.PATH.push(path);
    }
  }

  public async fixDriver(): Promise<void> {
    const gpu: GPU | false = (await this.driver.getVersion());

    if (gpu && gpu.driver === 'nvidia') {
      this.set('__NV_PRIME_RENDER_OFFLOAD', 1);
      this.set('__GLX_VENDOR_LIBRARY_NAME', 'nvidia');
      this.set('__GL_SYNC_TO_VBLANK', 0);
      this.set('__GL_SHADER_DISK_CACHE_PATH', await this.appFolders.getCacheDir());
      this.set('__GL_SHADER_DISK_CACHE_SIZE', 512 * 1024 * 1024);
      this.set('__GL_THREADED_OPTIMIZATIONS', 0);
      this.set('__GL_SHARPEN_IGNORE_FILM_GRAIN', 0);
      this.set('__GL_LOG_MAX_ANISO', 0);
      this.set('__GL_ALLOW_FXAA_USAGE', 0);
      this.set('__GL_SHARPEN_ENABLE', 0);
      this.set('__GL_SHARPEN_VALUE', 0);
    } else {
      this.set('vblank_mode', 0);
      this.set('mesa_glthread', 'true');
    }
  }
}