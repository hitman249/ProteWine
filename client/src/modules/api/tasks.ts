import {AbstractModule} from '../../../../server/modules/abstract-module';
import {RoutesTaskEvent} from '../../../../server/routes/routes';
import type {TaskType} from '../../../../server/modules/tasks/abstract-task';
import type {Progress} from '../../../../server/modules/archiver';

export default class Tasks extends AbstractModule {

  constructor() {
    super();

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onExit = this.onExit.bind(this);
  }
  public async init(): Promise<void> {
    window.electronAPI.receive(RoutesTaskEvent.RUN, this.onRun);
    window.electronAPI.receive(RoutesTaskEvent.LOG, this.onLog);
    window.electronAPI.receive(RoutesTaskEvent.PROGRESS, this.onProgress);
    window.electronAPI.receive(RoutesTaskEvent.EXIT, this.onExit);
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    console.log('onRun', cmd);
  }

  private onLog(event: RoutesTaskEvent.LOG, line: string): void {
    console.log('onLog', line);
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: Progress): void {
    console.log('onProgress', progress);
  }

  private onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    console.log('onExit', data);
  }
}