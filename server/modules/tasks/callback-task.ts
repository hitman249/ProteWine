import AbstractTask from './abstract-task';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import {RoutesTaskEvent} from '../../routes/routes';
import {TaskType} from './types';
import type {Progress} from '../archiver';
import type WatchProcess from '../../helpers/watch-process';

export default class CallbackTask extends AbstractTask {
  protected type: TaskType = TaskType.CALLBACK;
  private finish: boolean = false;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super(command, kernels, fs);
  }

  public async run(callback: (task: this) => Promise<void>): Promise<WatchProcess> {
    callback(this).finally(() => undefined);

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

  public sendRun(cmd: string): void {
    this.finish = false;
    this.fireEvent(RoutesTaskEvent.RUN, cmd);
  }

  public sendLog(line: string): void {
    this.fireEvent(RoutesTaskEvent.LOG, line);
  }

  public sendProgress(progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  public sendExit(): void {
    this.finish = true;
    this.task.resolve('');
    this.fireEvent(RoutesTaskEvent.EXIT);
  }
}