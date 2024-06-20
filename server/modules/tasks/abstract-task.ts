import EventListener from '../../helpers/event-listener';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';
import type {TaskType} from './types';
import type {App} from '../../app';

export default abstract class AbstractTask extends EventListener {
  protected task: WatchProcess;
  protected abstract type: TaskType;

  protected readonly command: Command;
  protected readonly kernels: Kernels;
  protected readonly fs: FileSystem;
  protected readonly app: App;

  constructor(command: Command, kernels: Kernels, fs: FileSystem, app: App) {
    super();

    this.command = command;
    this.kernels = kernels;
    this.fs = fs;
    this.app = app;
  }


  public getTask(): WatchProcess {
    return this.task;
  }

  public getType(): TaskType {
    return this.type;
  }

  public isFinish(): boolean {
    const task: WatchProcess = this.getTask();

    if (!task) {
      return true;
    }

    return task.isFinish();
  }
}