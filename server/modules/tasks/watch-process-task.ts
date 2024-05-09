import AbstractTask from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import {WatchProcessEvent} from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';

export default class WatchProcessTask extends AbstractTask {
  protected type: TaskType = TaskType.WATCH_PROCESS;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super(command, kernels, fs);

    this.onLog = this.onLog.bind(this);
  }

  public async run(callback: () => WatchProcess | Promise<WatchProcess>): Promise<WatchProcess> {
    if (this.task) {
      if (!this.task.isFinish()) {
        this.task.kill();
      }

      this.unbindEvents();
    }

    this.task = await callback();
    this.bindEvents();

    return this.task;
  }

  private onLog(event: WatchProcessEvent.LOG, line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  private unbindEvents(): void {
    if (!this.task) {
      return;
    }

    this.task.off(WatchProcessEvent.LOG, this.onLog);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.task) {
      return;
    }

    this.task.off(WatchProcessEvent.LOG, this.onLog);
  }
}