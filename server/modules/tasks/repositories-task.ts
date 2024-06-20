import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type {App} from '../../app';
import type Repositories from '../repositories';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import {RepositoriesEvent} from '../repositories/types';
import type {Progress} from '../archiver';

export default class RepositoriesTask extends AbstractTask {
  protected type: TaskType = TaskType.REPOSITORIES;
  private finish: boolean = false;
  private repositories: Repositories;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super(command, kernels, fs, app);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async install(url: string): Promise<WatchProcess> {
    this.unbindEvents();
    this.repositories = this.app.getRepositories();
    this.bindEvents();

    this.repositories.install(url).then(() => undefined);

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
    if (!this.repositories) {
      return;
    }

    this.repositories.off(RepositoriesEvent.RUN, this.onRun);
    this.repositories.off(RepositoriesEvent.LOG, this.onLog);
    this.repositories.off(RepositoriesEvent.PROGRESS, this.onProgress);
    this.repositories.off(RepositoriesEvent.ERROR, this.onError);
    this.repositories.off(RepositoriesEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.repositories) {
      return;
    }

    this.repositories.on(RepositoriesEvent.RUN, this.onRun);
    this.repositories.on(RepositoriesEvent.LOG, this.onLog);
    this.repositories.on(RepositoriesEvent.PROGRESS, this.onProgress);
    this.repositories.on(RepositoriesEvent.ERROR, this.onError);
    this.repositories.on(RepositoriesEvent.EXIT, this.onExit);
  }

  private onRun(event: RepositoriesEvent.RUN, cmd: string): void {
    this.finish = false;
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  private onLog(event: RepositoriesEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private onProgress(event: RepositoriesEvent.PROGRESS, progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  private onError(event: RepositoriesEvent.ERROR, error: string): void {
    this.fireEvent(RoutesTaskEvent.ERROR, error);
  }

  private onExit(): void {
    this.finish = true;
    this.task.resolve('');
    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}