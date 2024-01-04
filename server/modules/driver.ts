import _ from 'lodash';
import version_compare from 'locutus/php/info/version_compare';
import Command from './command';
import System from './system';
import FileSystem from './file-system';
import Utils from '../helpers/utils';
import Memory from '../helpers/memory';
import {AbstractModule} from './abstract-module';

type GPU = {vendor: string, driver: string, version: string, mesa?: string, info?: string};

export default class Driver extends AbstractModule {
  private memory: Memory = new Memory();
  private declare nvidia: GPU | false;
  private declare amd: GPU | false;
  private declare intel: GPU | false;
  private declare name: string;
  private declare opengl: string;

  private readonly command: Command;
  private readonly system: System;
  private readonly fs: FileSystem;

  constructor(command: Command, system: System, fs: FileSystem) {
    super();

    this.command = command;
    this.system = system;
    this.fs = fs;

    this.memory
      .setContext(this)
      .declareVariables(
        'nvidia',
        'amd',
        'intel',
        'name',
        'opengl',
      );
  }

  public async init(): Promise<any> {
  }

  public async getNvidia(): Promise<GPU | false> {
    if (undefined !== this.nvidia) {
      return this.nvidia;
    }

    const procPath: string = '/proc/driver/nvidia/version';

    if (await this.fs.exists(procPath)) {
      const version: string = Utils.findVersion(await this.command.exec(`cat "${procPath}" | grep -i "nvidia"`));

      if (version) {
        this.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.nvidia;
      }
    }

    if (await this.command.exec('command -v nvidia-smi')) {
      const version: string = Utils.findVersion(await this.command.exec('nvidia-smi --query-gpu=driver_version --format=csv,noheader'));

      if (version) {
        this.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.nvidia;
      }
    }

    if (await this.command.exec('command -v modinfo')) {
      const version: string = Utils.findVersion(await this.command.exec('modinfo nvidia | grep -E "^version:"'));

      if (version) {
        this.nvidia = {
          vendor: 'nvidia',
          driver: 'nvidia',
          version,
        };

        return this.nvidia;
      }
    }

    if (await this.command.exec('lsmod | grep nouveau')) {
      this.nvidia = {
        vendor: 'nvidia',
        driver: 'nouveau',
        version: '',
      };

      return this.nvidia;
    }

    this.nvidia = false;

    return this.nvidia;
  }

  public async getAmd(): Promise<GPU | false> {
    if (undefined !== this.amd) {
      return this.amd;
    }

    if (await this.command.exec('lsmod | grep radeon')) {
      this.amd = {
        vendor: 'amd',
        driver: 'radeon',
        version: '',
        mesa: await this.system.getMesaVersion(),
      };

      return this.amd;
    }

    const amdgpupro: string = await this.command.exec('modinfo amdgpu | grep -E "^version:"');
    let version: string | string[] = (await this.command.exec('glxinfo | grep "OpenGL" | grep "Compatibility Profile"'))
      .split('\n')[0]
      .split('Compatibility Profile')
      .map((s: string) => s.trim());

    if (version.length > 1) {
      version = Utils.findVersion(version[1]);
    } else {
      version = amdgpupro.split(':').map((s: string) => s.trim());

      if (version.length > 1) {
        version = version[1];
      } else {
        version = undefined;
      }
    }

    if (version && amdgpupro) {
      this.amd = {
        vendor: 'amd',
        driver: 'amdgpu-pro',
        version: version as string,
        mesa: '',
      };

      return this.amd;
    }

    if (await this.command.exec('lsmod | grep amdgpu')) {
      this.amd = {
        vendor: 'amd',
        driver: 'amdgpu',
        version: '',
        mesa: await this.system.getMesaVersion(),
      };

      return this.amd;
    }

    this.amd = false;

    return this.amd;
  }

  public async getIntel(): Promise<GPU | false> {
    if (undefined !== this.intel) {
      return this.intel;
    }

    if (await this.command.exec('glxinfo | grep "Intel"')) {
      this.intel = {
        vendor: 'intel',
        driver: 'intel',
        version: '',
        mesa: await this.system.getMesaVersion(),
      };

      return this.intel;
    }

    this.intel = false;

    return this.intel;
  }

  public async getVersion(): Promise<GPU | false> {
    let driver: GPU | false = await this.getNvidia();

    if (driver) {
      if ('nvidia' === driver.driver && version_compare(driver.version, '415.22', '<')) {
        driver.info = 'Please install NVIDIA driver 415.22 or newer.';
      }

      return driver;
    }

    driver = await this.getAmd();

    if (driver) {
      if ('amdgpu-pro' === driver.driver && version_compare(driver.version, '18.50', '<')) {
        driver.info = 'Please install AMDGPU PRO 18.50 or newer.';
      }
      if ('amdgpu' === driver.driver && version_compare(driver.mesa, '18.3', '<')) {
        driver.info = 'Please install RADV Mesa 18.3 or newer.';
      }

      return driver;
    }

    driver = await this.getIntel();

    if (driver) {
      if ('intel' === driver.driver && version_compare(driver.mesa, '18.3', '<')) {
        driver.info = 'Please install Mesa 18.3 or newer.';
      }
    }

    return driver;
  }

  public async isGalliumNineSupport(): Promise<boolean> {
    return Boolean((await this.getAmd()) || (await this.getIntel()));
  }

  public async getName(): Promise<string> {
    if (undefined !== this.name) {
      return this.name;
    }

    (await this.command.exec('glxinfo'))
      .split('\n')
      .forEach((line: string) => {
        if (!this.name && line.includes('Device')) {
          this.name = _.last(line.split(':').map((s: string) => s.trim()));
        }
      });

    if (!this.name) {
      this.name = await this.command.exec('lspci | grep VGA | cut -d ":" -f3');
    }

    return this.name;
  }

  public async getOpenGLVersion(): Promise<string> {
    if (undefined !== this.opengl) {
      return this.opengl;
    }

    let glxinfo: string = await this.command.exec('glxinfo | grep "OpenGL core profile version string:"');

    if (!glxinfo) {
      this.opengl = '';
      return this.opengl;
    }

    glxinfo = glxinfo.split(':')[1];

    if (!glxinfo) {
      this.opengl = '';
      return this.opengl;
    }

    this.opengl = Utils.findVersion(glxinfo.trim().split(' ')[0]) || '';

    return this.opengl;
  }

  public async isDefaultACO(): Promise<boolean> {
    const version: string = await this.system.getMesaVersion();

    if (!version) {
      return true;
    }

    return version_compare(version, '20.2', '>');
  }
}