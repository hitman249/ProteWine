import _ from 'lodash';
import Utils from '../helpers/utils';
import {AbstractModule} from './abstract-module';
import Diff, {DiffChange, DiffChanges, Section} from './diff';
import type AppFolders from './app-folders';
import type Kernels from './kernels';
import type {Kernel} from './kernels';
import type FileSystem from './file-system';
import type Replaces from './replaces';
import type Command from './command';
import type CopyDir from '../helpers/copy-dir';
import type WatchProcess from '../helpers/watch-process';

export enum Step {
  BEFORE = 'before',
  AFTER = 'after',
}

export default class Snapshot extends AbstractModule {
  private readonly appFolders: AppFolders;
  private readonly kernels: Kernels;
  private readonly fs: FileSystem;
  private readonly replaces: Replaces;
  private readonly command: Command;

  private readonly folders: string[] = [
    'Program Files',
    'Program Files (x86)',
    'ProgramData',
    'metadata',
    'users',
    'windows',
  ];

  private readonly snapshotDir: string = '/snapshot';

  constructor(appFolders: AppFolders, fs: FileSystem, kernels: Kernels, replaces: Replaces, command: Command) {
    super();

    this.appFolders = appFolders;
    this.kernels = kernels;
    this.fs = fs;
    this.replaces = replaces;
    this.command = command;
  }

  public async init(): Promise<any> {
  }

  private async getSnapshotDir(type: Step = Step.BEFORE): Promise<string> {
    return `${await this.appFolders.getCacheDir()}${this.snapshotDir}/${type}`;
  }

  private async getSnapshotFile(type: Step = Step.BEFORE): Promise<string> {
    return `${await this.getSnapshotDir(type)}/filelist`;
  }

  private async getSnapshotRegeditFile(type: Step = Step.BEFORE): Promise<string> {
    return `${await this.getSnapshotDir(type)}/regedit.reg`;
  }

  public async getLayerDir(): Promise<string> {
    return `${await this.appFolders.getCacheDir()}${this.snapshotDir}/layer`;
  }

  public async clear(): Promise<void> {
    const before: string = await this.getSnapshotDir(Step.BEFORE);
    const after: string = await this.getSnapshotDir(Step.AFTER);

    if (await this.fs.exists(before)) {
      await this.fs.rm(before);
    }

    if (await this.fs.exists(after)) {
      await this.fs.rm(after);
    }
  }

  private async create(type: Step = Step.BEFORE): Promise<void> {
    const kernel: Kernel = this.kernels.getKernel();
    const driveC: string = await kernel.getDriveCDir();

    const dir: string = await this.getSnapshotDir(type);
    const file: string = await this.getSnapshotFile(type);
    const reg: string = `${driveC}/regedit.reg`;

    const relativeGamesFolder: string = await this.fs.relativePath(await kernel.getGamesDir(), driveC);

    if (await this.fs.exists(dir)) {
      await this.fs.rm(dir);
    }

    await this.fs.mkdir(dir);

    const files: string[] = [];

    for await (const folder of this.folders) {
      const path: string = `${driveC}/${folder}`;

      if (!await this.fs.exists(path)) {
        continue;
      }

      const copyDir: CopyDir = await this.fs.directoryAnalysis(path);

      for await (const path of await copyDir.getFiles()) {
        const relative: string = await this.fs.relativePath(path, driveC);

        if (relative === relativeGamesFolder || _.startsWith(relative, relativeGamesFolder + '/')) {
          continue;
        }

        files.push(`${relative};file;${await this.fs.getMd5File(path)};${await this.fs.size(path)}`);
      }

      for (const path of await copyDir.getDirs()) {
        const relative: string = await this.fs.relativePath(path, driveC);

        if (relative === relativeGamesFolder || _.startsWith(relative, relativeGamesFolder + '/')) {
          continue;
        }

        files.push(`${relative};dir;;`);
      }
    }

    await this.fs.filePutContents(file, files.join('\n'));

    if (await this.fs.exists(reg)) {
      await this.fs.rm(reg);
    }

    const process: WatchProcess = await kernel.exportRegistry(reg);
    await process.wait();

    if (await this.fs.exists(reg)) {
      await this.fs.mv(reg, await this.getSnapshotRegeditFile(type));
    }
  }

  public async createBefore(): Promise<void> {
    await this.create(Step.BEFORE);
  }

  public async createAfter(): Promise<void> {
    await this.create(Step.AFTER);

    const kernel: Kernel = this.kernels.getKernel();

    const driveC: string = await kernel.getDriveCDir();
    const username: string = await kernel.getUserName();
    const layer: string = await this.getLayerDir();

    if (await this.fs.exists(layer)) {
      await this.fs.rm(layer);
    }

    await this.fs.mkdir(layer);

    const reg: string = await this.getRegeditChanges(
      await this.getSnapshotRegeditFile(Step.BEFORE),
      await this.getSnapshotRegeditFile(Step.AFTER),
    );

    if (reg) {
      await this.fs.filePutContents(`${layer}/changes.reg`, reg);
    }

    const files: string[] = await this.getFilesChanges(
      await this.getSnapshotFile(Step.BEFORE),
      await this.getSnapshotFile(Step.AFTER),
    );

    const userFolder: string = `users/${username}`;
    const userFolderReplace: string = 'users/default';

    for await (const path of files) {
      const fileIn: string = `${driveC}/${path}`;
      const fileOut: string = _.startsWith(path, userFolder)
        ? `${layer}/files/${path.replace(userFolder, userFolderReplace)}`
        : `${layer}/files/${path}`;

      const dirOut: string = this.fs.dirname(fileOut);

      if (!await this.fs.exists(dirOut)) {
        await this.fs.mkdir(dirOut);
      }

      await this.fs.cp(fileIn, fileOut);
    }

    if (files.length > 0) {
      const win32: string = `${layer}/files/windows/system32`;
      const win64: string = `${layer}/files/windows/syswow64`;
      const extensions: string[] = ['dll', 'ocx', 'exe'];
      const libs: string[] = [];

      const each = (path: string): void => {
        const filename: string = this.fs.basename(path).toLocaleLowerCase();
        const ext: string = this.fs.extension(path);

        if (extensions.indexOf(ext) !== -1 && libs.indexOf(filename) === -1) {
          libs.push(filename);
        }
      };

      if (await this.fs.exists(win32)) {
        (await this.fs.glob(`${win32}/*`)).forEach(each);
      }

      if (await this.fs.exists(win64)) {
        (await this.fs.glob(`${win64}/*`)).forEach(each);
      }

      if (libs.length > 0) {
        const reg: string[] = [
          'REGEDIT4\n',
          '[HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides]',
        ];

        libs.forEach((file) => {
          const ext: string = this.fs.extension(file);

          if ('dll' === ext) {
            file = `*${file}`;
          }

          reg.push(`"${file}"="native"`);
        });

        await this.fs.filePutContents(`${layer}/override-dll.reg`, reg.join('\n'));
      }

      const pathFiles: string = `${layer}/files`;

      if ((await this.fs.exists(pathFiles)) && (await this.fs.pack(pathFiles))) {
        await this.fs.rm(pathFiles);
      }
    }
  }

  private async getRegeditChanges(before: string, after: string): Promise<string> {
    if (!(await this.fs.exists(before)) || !(await this.fs.exists(after))) {
      return '';
    }

    const skip: string[] = [
      '[HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\MMDevices',
      '[HKEY_USERS\\S-1-5-21-0-0-0-1000\\Software\\Microsoft\\ActiveMovie\\devenum',
      '[HKEY_USERS\\S-1-5-21-0-0-0-1000\\Software\\Wine\\Drivers\\winepulse.drv\\devices',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Class',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\DeviceClasses',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Control\\Video',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Hardware Profiles\\Current\\System\\CurrentControlSet\\Control\\Class',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Hardware Profiles\\Current\\System\\CurrentControlSet\\Control\\DeviceClasses',
      '[HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Hardware Profiles\\Current\\System\\CurrentControlSet\\Control\\Video',
      '[HKEY_LOCAL_MACHINE\\Hardware\\Description\\System\\CentralProcessor',
    ];

    const isSkip = (section: string): boolean => {
      for (let i: number = 0, max: number = skip.length; i < max; i++) {
        if (_.startsWith(section, skip[i])) {
          return true;
        }
      }

      return false;
    };

    const findUpOfKey = (sections: Section, key: number): string => {
      while (undefined === sections[--key] && key >= 0) {
      }

      if (undefined === sections[key]) {
        return;
      }

      return sections[key];
    };

    const diff: Diff = new Diff(this.fs, this.command);
    const compare: DiffChanges = await diff.diff(before, after, 'utf-16le');
    const sections: Section = Utils.array_filter(diff.getFile2Data(), (line: string) => _.startsWith(line, '['));
    const inserted: Section = Utils.array_filter(compare[DiffChange.INSERTED], (line: string) => !_.startsWith(line, '['));

    const result: {[sectionName: string]: string[]} = {};

    let prevChange: number = undefined;
    let findSection: string = undefined;

    for (const i of Object.keys(inserted)) {
      const index: number = Utils.toInt(i);

      if (undefined === prevChange || (prevChange + 1) !== index) {
        prevChange = index;
        findSection = findUpOfKey(sections, index);
      }

      if (!findSection || isSkip(findSection)) {
        continue;
      }

      if (undefined === result[findSection]) {
        result[findSection] = [];
      }

      result[findSection].push(inserted[index]);
    }

    if (_.isEmpty(result)) {
      return '';
    }

    let text: string = 'Windows Registry Editor Version 5.00\n';

    for (let section in result) {
      if (undefined !== section && undefined !== result[section]) {
        text += `\n${section}\n${result[section].join('\n')}\n`;
      }
    }

    return this.replaces.replaceToTemplateByString(text);
  }

  private async getFilesChanges(before: string, after: string): Promise<string[]> {
    if (!(await this.fs.exists(before)) || !(await this.fs.exists(after))) {
      return [];
    }

    const diff: Diff = new Diff(this.fs, this.command);
    const compare: DiffChanges = await diff.diff(before, after);
    const inserted: string[] = [];

    _.forEach(compare[DiffChange.INSERTED], (line: string): void => {
      if (-1 !== diff.getFile1Data().indexOf(line)) {
        return;
      }

      let [path, type, size]: string[] = line.split(';');

      if ('file' === type) {
        inserted.push(path);
      }
    });

    return inserted;
  }
}