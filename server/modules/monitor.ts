import {screen} from 'electron';
import _, {type Dictionary} from 'lodash';
import Utils from '../helpers/utils';
import AppFolders from './app-folders';
import Command from './command';
import System from './system';
import FileSystem from './file-system';
import {AbstractModule} from './abstract-module';

type MonitorType = {
  name: string,
  status: string,
  resolution: string,
  brightness: string,
  gamma: string,
};

type StoreMonitors = {monitors: MonitorType[]};

type Resolution = {width: string, height: string};

export default class Monitor extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly command: Command;
  private readonly system: System;
  private readonly fs: FileSystem;

  private monitors: MonitorType[];

  constructor(appFolders: AppFolders, command: Command, system: System, fs: FileSystem) {
    super();

    this.appFolders = appFolders;
    this.command = command;
    this.system = system;
    this.fs = fs;
  }

  public async init(): Promise<any> {
  }

  public async getResolutions(): Promise<MonitorType[]> {
    if (undefined !== this.monitors) {
      return this.monitors;
    }

    if (!await this.system.getXrandrVersion()) {
      this.monitors = [];
      return this.monitors;
    }

    this.monitors = [];

    const regexp: RegExp = /^(.*) connected( | primary )([0-9]{3,4}x[0-9]{3,4}).*\n*/mg;
    const info: string = await this.command.exec('xrandr -d :0 --verbose');

    Array.from(info.matchAll(regexp)).forEach((match: RegExpMatchArray) => {
      const full: string = match[0].trim();
      const name: string = match[1].trim();
      const status: string = match[2].trim();
      const resolution: string = match[3].trim();

      let brightness: string = undefined;
      let gamma: string = undefined;

      let record: boolean = false;

      info.split('\n').forEach((line: string) => {
        if (record && (undefined === brightness || undefined === gamma)) {
          if (undefined === brightness && line.includes('Brightness:')) {
            const [, value]: string[] = line.split(':').map((s: string) => s.trim());
            brightness = value;
          }
          if (undefined === gamma && line.includes('Gamma:')) {
            const [, r, g, b]: string[] = line.split(':').map((s: string) => s.trim());
            gamma = `${r}:${g}:${b}`;
          }
        }

        if (false === record && line.includes(full)) {
          record = true;
        }
      });

      this.monitors.push({name, status, resolution, brightness, gamma});
    });

    return this.monitors;
  }

  public async getDefault(): Promise<MonitorType> {
    const monitors: MonitorType[] = await this.getResolutions();

    let monitor: MonitorType = monitors.find((monitor: MonitorType): boolean => 'primary' === monitor.status);

    if (!monitor) {
      monitor = _.head(monitors);
    }

    if (!monitor) {
      const display: Electron.Display = screen.getPrimaryDisplay();

      if (display) {
        return {
          gamma: undefined,
          brightness: undefined,
          name: undefined,
          status: undefined,
          resolution: `${display.size.width}x${display.size.height}`,
        };
      }
    }

    return monitor;
  }

  public async save(): Promise<void> {
    await this.fs.filePutContents(
      await this.appFolders.getResolutionsFile(),
      Utils.jsonEncode({
        resolutions: await this.getResolutions(),
      }),
    );
  }

  public async load(): Promise<StoreMonitors> {
    const path: string = await this.appFolders.getResolutionsFile();

    if (await this.fs.exists(path)) {
      return Utils.jsonDecode(await this.fs.fileGetContents(path)) as StoreMonitors;
    }

    return {monitors: []};
  }

  public async restore(): Promise<boolean> {
    if (!await this.system.getXrandrVersion()) {
      return false;
    }

    this.monitors = undefined;

    const monitors: Dictionary<MonitorType> = _.keyBy(await this.getResolutions(), 'name');
    const load: StoreMonitors = await this.load();

    for await (const monitor of load.monitors) {
      const current: MonitorType = monitors[monitor.name];

      if (!current) {
        continue;
      }

      if (current.gamma !== monitor.gamma && undefined !== monitor.gamma) {
        await this.command.exec(`xrandr --output ${monitor.name} --gamma ${monitor.gamma}`);
      }

      if (current.brightness !== monitor.brightness && undefined !== monitor.brightness) {
        await this.command.exec(`xrandr --output ${monitor.name} --brightness ${monitor.brightness}`);
      }

      if (current.resolution !== monitor.resolution && undefined !== monitor.resolution) {
        await this.command.exec(`xrandr --output ${monitor.name} --mode ${monitor.resolution}`);
      }
    }

    const path: string = await this.appFolders.getResolutionsFile();

    if (await this.fs.exists(path)) {
      await this.fs.rm(path);
    }

    this.monitors = undefined;

    return true;
  }

  public async getResolution(): Promise<Resolution> {
    const monitor: MonitorType = await this.getDefault();
    const [width, height]: string[] = monitor.resolution.split('x');

    return {width, height};
  }

  public async getWidth(): Promise<string> {
    return (await this.getResolution()).width;
  }

  public async getHeight(): Promise<string> {
    return (await this.getResolution()).height;
  }
}