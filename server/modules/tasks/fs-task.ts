import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type {Progress} from '../archiver';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import type {App} from '../../app';

export default class FileSystemTask extends AbstractTask {
  protected type: TaskType = TaskType.FILE_SYSTEM;
  private finish: boolean = false;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super(command, kernels, fs, app);
  }

  private async handler(src: string, dest: string, op: 'cp' | 'mv'): Promise<void> {
    const operation: any = op === 'cp' ? this.fs.cp.bind(this.fs) : this.fs.mv.bind(this.fs);
    const title: string = op === 'cp' ? 'Copy' : 'Move';

    if (!await this.checkDest(src, dest, title)) {
      return;
    }

    if (this.task) {
      if (!this.task.isFinish()) {
        this.task.kill();
      }
    }

    this.finish = false;

    let resolve: (text: string) => void;

    const promise: Promise<void> = new Promise((success: () => void) => (resolve = success));

    this.task = {
      resolve,
      isFinish: (): boolean => this.finish,
      wait: (): Promise<void> => promise,
      kill: (): void => undefined,
    } as unknown as WatchProcess;

    this.fireEvent(RoutesTaskEvent.RUN, `${title} "${src}" to "${dest}".`);

    let lastSrc: string;

    operation(src, dest, undefined, (progress: Progress) => {
      if (lastSrc !== progress.path) {
        lastSrc = progress.path;

        if (lastSrc) {
          this.fireEvent(RoutesTaskEvent.LOG, `${title} "${lastSrc}".`);
        }
      }

      this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
    })
      .then(
        () => {
          this.finish = true;
          this.fireEvent(RoutesTaskEvent.EXIT);
        },
        (err: string) => {
          this.finish = true;
          this.fireEvent(RoutesTaskEvent.ERROR, err);
          this.fireEvent(RoutesTaskEvent.EXIT);
        },
      );
  }

  public async checkDest(src: string, dest: string, title: string): Promise<boolean> {
    if (await this.fs.exists(dest)) {
      this.fireEvent(RoutesTaskEvent.RUN, `${title} "${src}" to "${dest}".`);
      this.fireEvent(RoutesTaskEvent.LOG, `The folder already exists: "${dest}".`);
      this.fireEvent(RoutesTaskEvent.EXIT);

      return false;
    }

    return true;
  }

  public async cp(src: string, dest: string): Promise<void> {
    return this.handler(src, dest, 'cp');
  }

  public async mv(src: string, dest: string): Promise<void> {
    return this.handler(src, dest, 'mv');
  }

  public async ln(src: string, dest: string): Promise<void> {
    this.fireEvent(RoutesTaskEvent.RUN, `Create symlink "${src}" to "${dest}".`);

    if (await this.fs.exists(dest)) {
      this.fireEvent(RoutesTaskEvent.LOG, `The folder already exists: "${dest}".`);
      this.fireEvent(RoutesTaskEvent.EXIT);

      return;
    }

    await this.fs.ln(src, dest);

    if (await this.fs.exists(dest)) {
      this.fireEvent(RoutesTaskEvent.LOG, `Created symlink: "${dest}".`);
    } else {
      this.fireEvent(RoutesTaskEvent.LOG, `Error creating symlink: "${dest}".`);
    }

    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}