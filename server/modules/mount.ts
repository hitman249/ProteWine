import Utils      from '../helpers/utils';
import FileSystem from './file-system';
import AppFolders from './app-folders';
import Command    from './command';
import Update     from './update';
import System     from './system';
import {AbstractModule} from './abstract-module';
import process from 'process';
import type {Progress} from './archiver';

export default class Mount extends AbstractModule {
  private mounted: boolean = false;
  private readonly folder: string;
  private readonly squashfs: string;
  private readonly appFolders: AppFolders;
  private readonly command: Command;
  private readonly fs: FileSystem;
  private readonly update: Update;
  private readonly system: System;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem, update: Update, system: System, folder: string) {
    super();

    this.appFolders = appFolders;
    this.command    = command;
    this.fs         = fs;
    this.update     = update;
    this.system     = system;
    this.folder     = folder;
    this.squashfs   = `${this.folder}.squashfs`;

    this.system.registerShutdownFunction(async () => {
      let start: boolean = false;

      if (this.isMounted()) {
        start = true;
        // action.notifyCustom(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.in-progress'));
      }

      return this.unmount().then(() => {
        if (start) {
          if (this.isMounted()) {
            // action.notifyError(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.error'));
          } else {
            // action.notifySuccess(window.i18n.t('app.unmount') + ': ' + this.fs.basename(this.folder), window.i18n.t('app.success'));
          }
        }
      });
    });
  }

  public async init(): Promise<any> {
  }

  public isMounted(): boolean {
    return this.mounted;
  }

  public async mount(): Promise<void> {
    if (!await this.fs.exists(this.squashfs) || this.isMounted()) {
      return;
    }

    return this.unmount().then(async () => {
      if (this.isMounted()) {
        return;
      }

      if (!await this.fs.exists(this.folder)) {
        await this.fs.mkdir(this.folder);
      }

      this.mounted = true;

      return this.squashfuse((value: Progress) => {
        throw new Error(`Mount progress: ${JSON.stringify(value)}`);
      });
    });
  }

  public async unmount(): Promise<void> {
    if (!(await this.fs.exists(this.squashfs)) || !(await this.fs.exists(this.folder))) {
      return;
    }

    let i: number = 0;

    const iterator = async (): Promise<void> => {
      if (i++ >= 9) {
        if (this.isMounted()) {
          this.killProcess();
        }

        return;
      }

      if (!this.isMounted() || (this.isMounted() && !(await this.fs.exists(this.folder)))) {
        this.mounted = false;
        return ;
      }

      if (await this.fs.exists(this.folder)) {
        await this.command.exec('fusermount -u ' + Utils.quote(this.folder));
        await this.fs.rm(this.folder);
      } else {
        this.mounted = false;
        return;
      }

      return Utils.sleep(1000).then(() => iterator());
    };

    return iterator();
  }

  public async squashfuse(progress: (value: Progress) => void): Promise<void> {
    return this.update.downloadSquashfuse(progress).then(async () => {
      const squashfuse: string = Utils.quote(await this.appFolders.getSquashfuseFile());
      const image: string      = Utils.quote(this.squashfs);
      const dir: string        = Utils.quote(this.folder);

      await this.command.exec(`${squashfuse} ${image} ${dir}`);
    });
  }

  public async size(): Promise<number> {
    if (this.isMounted()) {
      return await this.fs.size(this.squashfs);
    }

    return await this.fs.size(this.folder);
  }

  public getFolder(): string {
    return this.folder;
  }

  public getSquashfsFile(): string {
    return this.squashfs;
  }

  public async killProcess(): Promise<void> {
    const pids: string[] = (await this.command.exec('pidof squashfuse'))
      .split(' ')
      .map((s: string) => s.trim())
      .filter((pid: string) => /^[0-9]+$/.test(pid));

    for await (const value of Utils.natsort(pids, true)) {
      const pid: number = parseInt(value);
      const cmd: string = await this.command.exec(`ps -p ${pid} -o cmd=`);

      if (cmd.includes(this.getSquashfsFile())) {
        try {
          process.kill(-pid);
        } catch (e) {
          try {
            process.kill(pid);
          } catch (e) { /* empty */ }
        }
      }
    }
  }
}