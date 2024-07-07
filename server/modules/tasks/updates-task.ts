import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type {App} from '../../app';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import type {Progress} from '../archiver';
import type Update from '../update';

export default class UpdatesTask extends AbstractTask {
  protected type: TaskType = TaskType.REPOSITORIES;
  private finish: boolean = false;
  private update: Update;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super(command, kernels, fs, app);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async updateSelf(): Promise<WatchProcess> {
    this.unbindEvents();
    this.update = this.app.getUpdate();
    this.bindEvents();

    this.update.updateSelf().then(() => {
      this.onExit();
      this.unbindEvents();
    });

    let resolve: (text: string) => void;

    const promise: Promise<void> = new Promise((success: () => void) => (resolve = success));

    this.task = {
      resolve,
      isFinish: (): boolean => this.finish,
      wait: (): Promise<void> => promise,
      kill: (): void => undefined,
    } as unknown as WatchProcess;

    return this.task;
  }

  private unbindEvents(): void {
    if (!this.update) {
      return;
    }

    this.update.off(RoutesTaskEvent.RUN, this.onRun);
    this.update.off(RoutesTaskEvent.LOG, this.onLog);
    this.update.off(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.update.off(RoutesTaskEvent.ERROR, this.onError);
    this.update.off(RoutesTaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.update) {
      return;
    }

    this.update.on(RoutesTaskEvent.RUN, this.onRun);
    this.update.on(RoutesTaskEvent.LOG, this.onLog);
    this.update.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.update.on(RoutesTaskEvent.ERROR, this.onError);
    this.update.on(RoutesTaskEvent.EXIT, this.onExit);
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    this.finish = false;
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
    this.finish = true;
    this.task.resolve('');
    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}