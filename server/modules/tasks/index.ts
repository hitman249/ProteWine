import {AbstractModule} from '../abstract-module';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';
import type {Progress} from '../archiver';
import {KernelOperation, SessionType} from '../kernels/abstract-kernel';
import KernelTask from './kernel-task';
import ArchiverTask from './archiver-task';
import WatchProcessTask from './watch-process-task';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType, BodyBus} from './types';
import CallbackTask from './callback-task';
import FileSystemTask from './fs-task';

export default class Tasks extends AbstractModule {
  private readonly command: Command;
  private readonly kernels: Kernels;
  private readonly fs: FileSystem;

  private current: KernelTask | ArchiverTask | WatchProcessTask | CallbackTask | FileSystemTask;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super();

    this.command = command;
    this.kernels = kernels;
    this.fs = fs;

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onError = this.onError.bind(this);
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
    this.current.off(RoutesTaskEvent.ERROR, this.onError);
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
    this.current.on(RoutesTaskEvent.ERROR, this.onError);
    this.current.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    this.current.on(RoutesTaskEvent.EXIT, this.onExit);
  }

  public sendBus(body: BodyBus): void {
    this.fireEvent(RoutesTaskEvent.BUS, body);
  }

  public sendProgress(progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  private onLog(event: RoutesTaskEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private onError(event: RoutesTaskEvent.ERROR, error: string): void {
    this.fireEvent(RoutesTaskEvent.ERROR, error);
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

      if (task && !task.isFinish()) {
        task.kill();
      }
    }
  }

  public async wait(): Promise<void> {
    if (this.isFinish()) {
      return;
    }

    if (this.current) {
      const task: WatchProcess = this.current.getTask();

      if (task) {
        return task.wait();
      }
    }
  }

  public async kernel(cmd: string, operation: KernelOperation, session: SessionType = SessionType.RUN): Promise<WatchProcess> {
    this.before();
    this.current = new KernelTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.run(cmd, operation, session);
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

  public async callback(callback: (task: CallbackTask) => Promise<void>): Promise<WatchProcess> {
    this.before();
    this.current = new CallbackTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.run(callback);
  }

  public async cp(src: string, dest: string): Promise<void> {
    this.before();
    this.current = new FileSystemTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.cp(src, dest);
  }

  public async mv(src: string, dest: string): Promise<void> {
    this.before();
    this.current = new FileSystemTask(this.command, this.kernels, this.fs);
    this.after();

    return this.current.mv(src, dest);
  }
}