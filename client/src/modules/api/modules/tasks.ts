import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesTaskEvent} from '../../../../../server/routes/routes';
import type {Progress} from '../../../../../server/modules/archiver';
import type {TaskType} from '../../../../../server/modules/tasks/types';

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

  public async isFinish(): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesTaskEvent.FINISH));
  }

  public async kill(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesTaskEvent.KILL));
  }

  public async getType(): Promise<TaskType> {
    return (await window.electronAPI.invoke(RoutesTaskEvent.TYPE));
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: {type: TaskType, cmd: string}): void {
    this.fireEvent(event, cmd);
  }

  private onLog(event: RoutesTaskEvent.LOG, line: {type: TaskType, line: string}): void {
    this.fireEvent(event, line);
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: {type: TaskType, progress: Progress}): void {
    this.fireEvent(event, progress);
  }

  private onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    this.fireEvent(event, data);
  }
}