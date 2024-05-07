import AbstractTask, {TaskType} from './abstract-task';
import type WatchProcess from '../../helpers/watch-process';
import type Command from '../command';
import type Kernels from '../kernels';
import type FileSystem from '../file-system';
import Archiver, {ArchiverEvent, type Progress} from '../archiver';
import {RoutesTaskEvent} from '../../routes/routes';

export default class ArchiverTask extends AbstractTask {
  protected type: TaskType = TaskType.ARCHIVER;
  private archiver: Archiver;

  constructor(command: Command, kernels: Kernels, fs: FileSystem) {
    super(command, kernels, fs);

    this.onProgress = this.onProgress.bind(this);
  }

  public async unpack(src: string, dest: string = ''): Promise<WatchProcess> {
    if (this.task) {
      if (!this.task.isFinish()) {
        this.task.kill();
      }

      this.unbindEvents();
    }

    this.fireEvent(RoutesTaskEvent.RUN, `Unpack "${src}" to "${dest}".`);

    this.archiver = new Archiver(this.fs, src, dest);
    this.task = (await this.archiver.unpack()).getProcess();

    this.task.wait().then(() => this.fireEvent(RoutesTaskEvent.EXIT));

    this.bindEvents();

    return this.task;
  }

  private onProgress(event: ArchiverEvent.PROGRESS, progress: Progress): void {
    this.fireEvent(RoutesTaskEvent.PROGRESS, progress);
  }

  private unbindEvents(): void {
    if (!this.archiver) {
      return;
    }

    this.archiver.off(ArchiverEvent.PROGRESS, this.onProgress);
  }

  private bindEvents(): void {
    this.unbindEvents();

    if (!this.archiver) {
      return;
    }

    this.archiver.off(ArchiverEvent.PROGRESS, this.onProgress);
  }
}