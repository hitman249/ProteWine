import AbstractTask, {TaskType} from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import {KernelEvent, KernelOperation} from '../kernels/abstract-kernel';
import Kernels, {type Kernel} from '../kernels';
import type Command from '../command';
import type FileSystem from '../file-system';
import {RoutesTaskEvent} from '../../routes/routes';

export default class KernelTask extends AbstractTask {
  protected type: TaskType = TaskType.KERNEL;

  private cmd: string;
  private kernel: Kernel;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super(command, kernels, fs);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async run(cmd: string, operation: KernelOperation): Promise<WatchProcess> {
    this.cmd = cmd;

    this.unbindEvents();
    this.kernel = this.kernels.getKernel();
    this.bindEvents();


    if (KernelOperation.RUN === operation) {
      this.task = await this.kernel.run(this.cmd);
    } else if (KernelOperation.REGISTER === operation) {
      this.task = await this.kernel.register(this.cmd);
    } else if (KernelOperation.LIBRARY === operation) {
      this.task = await this.kernel.regsvr32(this.cmd);
    }

    return this.task;
  }

  private unbindEvents(): void {
    if (!this.kernel) {
      return;
    }

    this.kernel.off(KernelEvent.RUN, this.onRun);
    this.kernel.off(KernelEvent.LOG, this.onLog);
    this.kernel.off(KernelEvent.EXIT, this.onExit);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.kernel) {
      return;
    }

    this.kernel.on(KernelEvent.RUN, this.onRun);
    this.kernel.on(KernelEvent.LOG, this.onLog);
    this.kernel.on(KernelEvent.EXIT, this.onExit);
  }

  private onRun(event: KernelEvent.RUN, cmd: string): void {
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  private onLog(event: KernelEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private onExit(): void {
    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}