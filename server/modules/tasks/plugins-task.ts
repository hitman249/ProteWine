import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type {App} from '../../app';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import type {Progress} from '../archiver';
import Plugins from '../plugins';

export default class PluginsTask extends AbstractTask {
  protected type: TaskType = TaskType.PLUGINS;
  private finish: boolean = false;
  private plugins: Plugins;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super(command, kernels, fs, app);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async install(registry: string[] = []): Promise<WatchProcess> {
    this.unbindEvents();
    this.plugins = this.app.getPlugins();
    this.bindEvents();

    this.finish = false;

    this.plugins.install(registry).then(() => {
      this.unbindEvents();
      this.finish = true;
      this.task.resolve('');
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
    if (!this.plugins) {
      return;
    }

    this.plugins.off(RoutesTaskEvent.RUN, this.onRun);
    this.plugins.off(RoutesTaskEvent.LOG, this.onLog);
    this.plugins.off(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.plugins.off(RoutesTaskEvent.ERROR, this.onError);
    this.plugins.off(RoutesTaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.plugins) {
      return;
    }

    this.plugins.on(RoutesTaskEvent.RUN, this.onRun);
    this.plugins.on(RoutesTaskEvent.LOG, this.onLog);
    this.plugins.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.plugins.on(RoutesTaskEvent.ERROR, this.onError);
    this.plugins.on(RoutesTaskEvent.EXIT, this.onExit);
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
}