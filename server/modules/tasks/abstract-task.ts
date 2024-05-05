import EventListener from '../../helpers/event-listener';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import type WatchProcess from '../../helpers/watch-process';

export enum TaskEvent {
  LOG = 'log',
  RUN = 'run',
  PROGRESS = 'progress',
  EXIT = 'exit',
}

export default abstract class AbstractTask extends EventListener {
  protected task: WatchProcess;

  protected readonly command: Command;
  protected readonly kernels: Kernels;
  protected readonly fs: FileSystem;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super();

    this.command = command;
    this.kernels = kernels;
    this.fs = fs;
  }


  public getTask(): WatchProcess {
    return this.task;
  }
}