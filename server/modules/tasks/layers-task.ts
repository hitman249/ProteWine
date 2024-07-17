import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type {App} from '../../app';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import type {Progress} from '../archiver';
import type Layers from '../layers';

export default class LayersTask extends AbstractTask {
  protected type: TaskType = TaskType.LAYERS;
  private finish: boolean = false;
  private layers: Layers;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super(command, kernels, fs, app);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onError = this.onError.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  private makeDummyProcess(): WatchProcess {
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

  public async create(): Promise<WatchProcess> {
    this.unbindEvents();
    this.layers = this.app.getLayers();
    this.bindEvents();


    this.layers.create().then(() => {
      this.unbindEvents();
    });

    return this.makeDummyProcess();
  }

  public async makeLayer(): Promise<WatchProcess> {
    this.unbindEvents();
    this.layers = this.app.getLayers();
    this.bindEvents();


    this.layers.makeLayer().then(() => {
      this.unbindEvents();
    });

    return this.makeDummyProcess();
  }

  private unbindEvents(): void {
    if (!this.layers) {
      return;
    }

    this.layers.off(RoutesTaskEvent.RUN, this.onRun);
    this.layers.off(RoutesTaskEvent.LOG, this.onLog);
    this.layers.off(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.layers.off(RoutesTaskEvent.ERROR, this.onError);
    this.layers.off(RoutesTaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.layers) {
      return;
    }

    this.layers.on(RoutesTaskEvent.RUN, this.onRun);
    this.layers.on(RoutesTaskEvent.LOG, this.onLog);
    this.layers.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.layers.on(RoutesTaskEvent.ERROR, this.onError);
    this.layers.on(RoutesTaskEvent.EXIT, this.onExit);
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