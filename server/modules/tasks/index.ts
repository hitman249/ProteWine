import EventListener from '../../helpers/event-listener';
import {KernelOperation} from '../kernels/abstract-kernel';
import KernelTask from './kernel-task';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';
import {TaskEvent} from './abstract-task';
import type {Progress} from '../archiver';

export default class Tasks extends EventListener {
  private readonly command: Command;
  private readonly kernels: Kernels;
  private readonly fs: FileSystem;

  private current: KernelTask;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super();

    this.command = command;
    this.kernels = kernels;
    this.fs = fs;

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  private getTask(): WatchProcess {
    return this.current?.getTask();
  }

  private unbindEvents(): void {
    if (!this.current) {
      return;
    }

    this.current.off(TaskEvent.RUN, this.onRun);
    this.current.off(TaskEvent.LOG, this.onLog);
    this.current.off(TaskEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.current) {
      return;
    }

    this.current.on(TaskEvent.RUN, this.onRun);
    this.current.on(TaskEvent.LOG, this.onLog);
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

  public async runByKernel(cmd: string, operation: KernelOperation): Promise<WatchProcess> {
    if (this.current) {
      const task: WatchProcess = this.current.getTask();

      if (!task.isFinish()) {
        task.kill();
      }

      this.unbindEvents();
    }

    const current: KernelTask = new KernelTask(this.command, this.kernels, this.fs);

    this.current = current;
    this.bindEvents();

    return current.run(cmd, operation);
  }
}