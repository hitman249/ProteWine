import process from 'process';
import type AppFolders from './app-folders';
import type {App} from '../app';
import Command from './command';
import FileSystem from './file-system';
import Utils from '../helpers/utils';
import Memory from '../helpers/memory';
import GlobalCache from './global-cache';
import {AbstractModule} from './abstract-module';

type CpuFreq = {id: string, name: string, freq: string, mode: string};
type Ram = {busy: number, free: number, percent: number, full: number};
type MidiPorts = {[port: string]: string};

export default class System extends AbstractModule {
  private readonly memory: Memory = new Memory();
  private declare userName: string;
  private declare root: boolean;
  private declare home: string;
  private declare desktopPath: string;
  private declare glibc: string;
  private declare cpu: string;
  private declare hostname: string;
  private declare linux: string;
  private declare futex: boolean;
  private declare arch: number;
  private declare distr: string;
  private declare mesa: string;
  private declare xrandr: string;
  private declare xorg: string;
  private declare cyrillic: boolean;
  private declare ulimitHard: number;
  private declare ulimitSoft: number;
  private declare vmMaxMapCount: number;
  private declare tar: boolean;
  private declare xz: boolean;
  private declare isLocked: boolean;
  private declare commands: {[cmd: string]: boolean};

  public readonly appFolders: AppFolders;
  public readonly cache: GlobalCache;
  public readonly command: Command;
  public readonly fs: FileSystem;
  public readonly app: App;

  private static shutdownFunctions: Function[];

  constructor(appFolders: AppFolders, cache: GlobalCache, app: App) {
    super();

    this.memory
      .setContext(this)
      .declareVariables(
        'userName',
        'root',
        'home',
        'desktopPath',
        'glibc',
        'cpu',
        'hostname',
        'linux',
        'futex',
        'arch',
        'distr',
        'mesa',
        'xrandr',
        'xorg',
        'cyrillic',
        'ulimitHard',
        'ulimitSoft',
        'vmMaxMapCount',
        'tar',
        'xz',
        'isLocked',
        'commands',
      );

    this.appFolders = appFolders;
    this.cache = cache;
    this.app = app;
    this.command = new Command();
    this.fs = new FileSystem(appFolders);
  }

  public async init(): Promise<any> {
    if (undefined === System.shutdownFunctions) {
      this.createHandlerShutdownFunctions();
    }
  }

  public async existsCommand(command: string): Promise<boolean> {
    if (undefined === this.commands) {
      this.commands = {};
    }

    if (undefined === this.commands[command]) {
      this.commands[command] = Boolean(await this.command.exec(`command -v "${command}"`));
    }

    return this.commands[command];
  }

  public async getHardDriveNames(): Promise<string[]> {
    const key: string = 'system.drives';

    if (await this.cache.has(key)) {
      return await this.cache.get(key);
    }

    const result: string[] = [];
    const stdout: string = await this.command.exec('ls -1 /dev/disk/by-id/ata-* | grep -v \'\\-part\'');

    stdout
      .split('\n')
      .forEach((path: string) => result.push(this.fs.basename(path).replace(/^(ata-)/gi, '')));

    return await this.cache.set(key, result);
  }

  public async getUserName(): Promise<string> {
    if (undefined !== this.userName) {
      return this.userName;
    }

    this.userName = await this.command.exec('id -u -n');

    return this.userName;
  }

  public async isRoot(): Promise<boolean> {
    if (undefined !== this.root) {
      return this.root;
    }

    this.root = parseInt(await this.command.exec('id -u'), 10) === 0;

    return this.root;
  }

  public async getHomeDir(): Promise<string> {
    if (undefined !== this.home) {
      return this.home;
    }

    this.home = await this.command.exec('eval echo "~$USER"');

    return this.home;
  }

  public async getDesktopDir(): Promise<string> {
    if (undefined !== this.desktopPath) {
      return this.desktopPath;
    }

    this.desktopPath = (await this.existsCommand('xdg-user-dir'))
      ? (await this.command.exec('xdg-user-dir DESKTOP'))
      : '';

    return this.desktopPath;
  }

  public async getDesktopSession(): Promise<string> {
    return process.env.DESKTOP_SESSION;
  }

  public async getHostname(): Promise<string> {
    if (undefined !== this.hostname) {
      return this.hostname;
    }

    this.hostname = (await this.command.exec('uname -a')).split(' ')[1].trim();

    return this.hostname;
  }

  public async getGlibcVersion(): Promise<string> {
    if (undefined === this.glibc) {
      const isGetConf: boolean = (await this.existsCommand('getconf'));

      if (isGetConf) {
        let version: string = (await this.command.exec('getconf GNU_LIBC_VERSION'))
          .split('\n')
          .map((s: string) => s.trim())[0];

        version = Utils.findVersion(version);

        if (version) {
          this.glibc = version;
        }
      }

      if (!this.glibc) {
        let version: string = (await this.command.exec('ldd --version'))
          .split('\n')
          .map((s: string) => s.trim())[0];

        version = Utils.findVersion(version);

        if (version) {
          this.glibc = version;
        }
      }
    }

    return this.glibc;
  }

  public async getCPU(): Promise<string> {
    if (undefined !== this.cpu) {
      return this.cpu;
    }

    const cpuInfo: string = (await this.command.exec('cat /proc/cpuinfo'))
      .split('\n')
      .filter((line: string): boolean => {
        const [field]: string[] = line.split(':');

        if (field.includes('model name')) {
          return true;
        }
      })[0];

    const [, value]: string[] = cpuInfo.split(':').map((s: string) => s.trim());

    this.cpu = value;

    return this.cpu;
  }

  public async getLinuxVersion(): Promise<string> {
    if (undefined !== this.linux) {
      return this.linux;
    }

    this.linux = await this.command.exec('uname -mrs');

    return this.linux;
  }

  public async isFutex(): Promise<boolean> {
    if (undefined !== this.futex) {
      return this.futex;
    }

    this.futex = Boolean(await this.command.exec('cat /proc/kallsyms | grep futex_wait_multiple'));

    return this.futex;
  }

  public async getDistrName(): Promise<string> {
    if (undefined !== this.distr) {
      return this.distr;
    }

    let name: string = '';
    let version: string = '';

    (await this.command.exec('cat /etc/*-release'))
      .split('\n')
      .forEach((line: string) => {
        const [field, value]: string[] = line.split('=').map((s: string) => s.trim());

        if ('' === name && 'DISTRIB_ID' === field) {
          name = value;
        } else if ('' === name && 'NAME' === field) {
          name = value;
        } else if ('' === version && 'DISTRIB_RELEASE' === field) {
          version = value;
        } else if ('' === version && 'VERSION' === field) {
          version = value;
        }
      });

    this.distr = `${name} ${version}`;

    return this.distr;
  }

  public async getMesaVersion(): Promise<string> {
    if (undefined !== this.mesa) {
      return this.mesa;
    }

    let version: string = '';

    (await this.command.exec('glxinfo | grep "Mesa"'))
      .split('\n')
      .map((s: string) => s.trim())
      .forEach((line: string) => {
        if (line.includes('OpenGL version string')) {
          const mesa: string[] = line.split('Mesa').map((s: string) => s.trim());
          version = Utils.findVersion(mesa[mesa.length - 1]);
        }
      });

    this.mesa = version;

    return this.mesa;
  }

  public async getXrandrVersion(): Promise<string> {
    if (undefined !== this.xrandr) {
      return this.xrandr;
    }

    this.xrandr = Utils.findVersion(await this.command.exec('xrandr --version | grep \'xrandr\''));

    return this.xrandr;
  }

  public async getUlimitHard(): Promise<number> {
    if (undefined !== this.ulimitHard) {
      return this.ulimitHard;
    }

    this.ulimitHard = parseInt(await this.command.exec('ulimit -Hn'), 10);

    return this.ulimitHard;
  }

  public async getUlimitSoft(): Promise<number> {
    if (undefined !== this.ulimitSoft) {
      return this.ulimitSoft;
    }

    this.ulimitSoft = parseInt(await this.command.exec('ulimit -Sn'), 10);

    return this.ulimitSoft;
  }

  public async isCyrillic(): Promise<boolean> {
    if (undefined !== this.cyrillic) {
      return this.cyrillic;
    }

    this.cyrillic = Boolean(await this.command.exec('locale | grep LANG=ru'));

    return this.cyrillic;
  }

  public async isTar(): Promise<boolean> {
    if (undefined !== this.tar) {
      return this.tar;
    }

    this.tar = Boolean(await this.existsCommand('tar'));

    return this.tar;
  }

  public async isXz(): Promise<boolean> {
    if (undefined !== this.xz) {
      return this.xz;
    }

    this.xz = (await this.isTar()) && Boolean(await this.existsCommand('xz'));

    return this.xz;
  }

  public async isIcoSupport(): Promise<boolean> {
    return (await this.existsCommand('wrestool')) && (await this.existsCommand('icotool'));
  }

  public async isAppImageLauncher(): Promise<boolean> {
    return await this.existsCommand('AppImageLauncher');
  }

  public async isGameMode(): Promise<boolean> {
    return await this.existsCommand('gamemoderun');
  }

  public async getArch(): Promise<number> {
    if (undefined !== this.arch) {
      return this.arch;
    }

    if (await this.existsCommand('arch')) {
      if ('x86_64' === (await this.command.exec('arch'))) {
        this.arch = 64;
      } else {
        this.arch = 32;
      }

      return this.arch;
    }

    if (await this.existsCommand('getconf')) {
      if ('64' === await this.command.exec('getconf LONG_BIT')) {
        this.arch = 64;
      } else {
        this.arch = 32;
      }
    }

    return this.arch;
  }

  public async getXorgVersion(): Promise<string> {
    if (undefined !== this.xorg) {
      return this.xorg;
    }

    if (await this.existsCommand('xdpyinfo')) {
      this.xorg = Utils.findVersion(await this.command.exec('xdpyinfo | grep -i "X.Org version"'));

      if (this.xorg) {
        return this.xorg;
      }
    }

    const path: string = '/var/log/Xorg.0.log';

    if (await this.fs.exists(path)) {
      this.xorg = Utils.findVersion(await this.command.exec(`cat "${path}" | grep "X.Org X Server"`));
    }

    return this.xorg;
  }

  public async getVmMaxMapCount(): Promise<number> {
    if (undefined !== this.vmMaxMapCount) {
      return this.vmMaxMapCount;
    }

    if (await this.existsCommand('sysctl')) {
      const value: string = (await this.command.exec('sysctl vm.max_map_count')).split('=')[1].trim();
      this.vmMaxMapCount = parseInt(value, 10);
    }

    return this.vmMaxMapCount;
  }

  public async getCpuFreq(): Promise<CpuFreq[]> {
    const cpus: string[] = (await this.command.exec('cat /proc/cpuinfo'))
      .split('\n')
      .map((s: string) => s.trim());

    const result: CpuFreq[] = [];

    let id: string = undefined;
    let name: string = undefined;

    for await (const line of cpus) {
      if (!line) {
        continue;
      }

      const [field, value]: string[] = line.split(':').map((s: string) => s.trim());

      if ('processor' === field) {
        id = value;
        continue;
      }

      if ('model name' === field) {
        name = value;
        continue;
      }

      if ('cpu MHz' === field) {
        const cpuPath: string = `/sys/devices/system/cpu/cpu${id}/cpufreq/scaling_governor`;

        result.push({
          id,
          name,
          freq: value,
          mode: (await this.fs.exists(cpuPath)) ? (await this.command.exec(`cat "${cpuPath}"`)) : '',
        });
      }
    }

    return result;
  }

  public async lock(): Promise<boolean> {
    if (undefined !== this.isLocked) {
      return this.isLocked;
    }

    const filepath: string = await this.appFolders.getRunPidFile();

    if (await this.fs.exists(filepath)) {
      const pid: string = (await this.fs.fileGetContents(filepath)).trim();
      if (pid && (await this.command.exec(`ps -p ${pid} -o comm=`))) {
        this.isLocked = false;
      }
    }

    await this.fs.filePutContents(filepath, String(process.pid));

    this.isLocked = true;

    return this.isLocked;
  }

  public async getRam(): Promise<Ram> {
    if (!await this.existsCommand('free')) {
      return;
    }

    const [full, busy]: number[] = (await this.command.exec('free -m'))
      .split('\n')[1]
      .split(' ')
      .filter((s: string) => !s.includes(':') && s)
      .map((i: string) => parseInt(i));

    return {full, busy, free: full - busy, percent: busy > 0 ? (busy / full * 100) : 0};
  }

  public async isPulse(): Promise<boolean> {
    return (await this.existsCommand('pipewire-pulse')) || (await this.existsCommand('pulseaudio'));
  }

  public async getMidiPorts(): Promise<MidiPorts> {
    const result: MidiPorts = {
      '128:0': 'Default',
    };

    if (!await this.existsCommand('aconnect')) {
      return result;
    }

    const midiPorts: MidiPorts = {};

    (await this.command.exec('aconnect -l | grep -e "^client"'))
      .split('\n')
      .forEach((line: string) => {
        const matches: RegExpMatchArray = line.match(/client\s([0-9]+):\s'([^']+)'/);

        if (!matches || !matches[1] || '0' === matches[1]) {
          return;
        }

        midiPorts[`${matches[1]}:0`] = matches[2];
      });

    return midiPorts;
  }

  private createHandlerShutdownFunctions(): void {
    System.shutdownFunctions = [];
  }

  public registerShutdownFunction(fn: Function): void {
    System.shutdownFunctions.push(fn);
  }

  /**
   * @return {Promise<void>}
   */
  public async closeApp(): Promise<void> {
    await this.app.getKernels().getKernel()?.kill();
    await Promise.all(System.shutdownFunctions.map(fn => fn()));
  }
}