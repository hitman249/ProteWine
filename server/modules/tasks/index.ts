import {AbstractModule} from '../abstract-module';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';
import type {Progress} from '../archiver';
import type {KernelOperation} from '../kernels/abstract-kernel';
import KernelTask from './kernel-task';
import ArchiverTask from './archiver-task';
import WatchProcessTask from './watch-process-task';
import {RoutesTaskEvent} from '../../routes/routes';
import type {TaskType} from './types';

export default class Tasks extends AbstractModule {
  private readonly command: Command;
  private readonly kernels: Kernels;
  private readonly fs: FileSystem;

  private current: KernelTask | ArchiverTask | WatchProcessTask;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super();

    this.command = command;
    this.kernels = kernels;
    this.fs = fs;

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async init(): Promise<any> {
  }

  private getTask(): WatchProcess {
    return this.current?.getTask();
  }

  public getType(): TaskType {
    return this.current?.getType();
  }

  public isFinish(): boolean {
    return Boolean(this.current?.isFinish());
  }

  private unbindEvents(): void {
    if (!this.current) {
      return;
    }

    this.current.off(RoutesTaskEvent.RUN, this.onRun);
    this.current.off(RoutesTaskEvent.LOG, this.onLog);
    this.current.off(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.current.off(RoutesTaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.current) {
      return;
    }

    this.current.on(RoutesTaskEvent.RUN, this.onRun);
    this.current.on(RoutesTaskEvent.LOG, this.onLog);
    this.current.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.current.on(RoutesTaskEvent.EXIT, this.onExit);
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

  private onExit(): void {
    this.fireEvent(RoutesTaskEvent.EXIT);
  }

  private before(): void {
    this.kill();
    this.unbindEvents();
  }

  private after(): void {
    this.bindEvents();
  }

  public kill(): void {
    if (this.current) {
      const task: WatchProcess = this.current.getTask();

      if (!task.isFinish()) {
        task.kill();
      }
    }
  }

  public async kernel(cmd: string, operation: KernelOperation): Promise<WatchProcess> {
    this.before();
    this.current = new KernelTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.run(cmd, operation);
  }

  public async unpack(src: string, dest: string = ''): Promise<WatchProcess> {
    this.before();
    this.current = new ArchiverTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.unpack(src, dest);
  }

  public async watch(callback: () => WatchProcess | Promise<WatchProcess>): Promise<WatchProcess> {
    this.before();
    this.current = new WatchProcessTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.run(callback);
  }
}