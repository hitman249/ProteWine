import EventListener from '../../helpers/event-listener';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';
import type {Progress} from '../archiver';
import type {KernelOperation} from '../kernels/abstract-kernel';
import {TaskEvent, type TaskType} from './abstract-task';
import KernelTask from './kernel-task';
import ArchiverTask from './archiver-task';
import WatchProcessTask from './watch-process-task';

export default class Tasks extends EventListener {
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

  private getTask(): WatchProcess {
    return this.current?.getTask();
  }

  public getType(): TaskType {
    return this.current?.getType();
  }

  private unbindEvents(): void {
    if (!this.current) {
      return;
    }

    this.current.off(TaskEvent.RUN, this.onRun);
    this.current.off(TaskEvent.LOG, this.onLog);
    this.current.off(TaskEvent.PROGRESS, this.onProgress);
    this.current.off(TaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.current) {
      return;
    }

    this.current.on(TaskEvent.RUN, this.onRun);
    this.current.on(TaskEvent.LOG, this.onLog);
    this.current.on(TaskEvent.PROGRESS, this.onProgress);
    this.current.on(TaskEvent.EXIT, this.onExit);
  }

  private onRun(event: TaskEvent.RUN, cmd: string): void {
    this.fireEvent(TaskEvent.RUN, cmd);
  }

  private onLog(event: TaskEvent.LOG, line: string): void {
    this.fireEvent(TaskEvent.LOG, line);
  }

  private onProgress(event: TaskEvent.PROGRESS, progress: Progress): void {
    this.fireEvent(TaskEvent.PROGRESS, progress);
  }

  private onExit(): void {
    this.fireEvent(TaskEvent.EXIT);
  }

  private before(): void {
    if (this.current) {
      const task: WatchProcess = this.current.getTask();

      if (!task.isFinish()) {
        task.kill();
      }

      this.unbindEvents();
    }
  }

  private after(): void {
    this.bindEvents();
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