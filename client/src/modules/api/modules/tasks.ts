import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesTaskEvent, RoutesTaskMethod} from '../../../../../server/routes/routes';
import type {Progress} from '../../../../../server/modules/archiver';
import type {BodyBus, TaskType} from '../../../../../server/modules/tasks/types';

export default class Tasks extends AbstractModule {

  constructor() {
    super();

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onBus = this.onBus.bind(this);
    this.onError = this.onError.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async init(): Promise<void> {
    window.electronAPI.receive(RoutesTaskEvent.RUN, this.onRun);
    window.electronAPI.receive(RoutesTaskEvent.LOG, this.onLog);
    window.electronAPI.receive(RoutesTaskEvent.BUS, this.onBus);
    window.electronAPI.receive(RoutesTaskEvent.ERROR, this.onError);
    window.electronAPI.receive(RoutesTaskEvent.PROGRESS, this.onProgress);
    window.electronAPI.receive(RoutesTaskEvent.EXIT, this.onExit);
  }

  public async isFinish(): Promise<boolean> {
    return (await window.electronAPI.invoke(RoutesTaskMethod.FINISH));
  }

  public async kill(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesTaskMethod.KILL));
  }

  public async getType(): Promise<TaskType> {
    return (await window.electronAPI.invoke(RoutesTaskMethod.TYPE));
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: {type: TaskType, cmd: string}): void {
    console.log(event, cmd);
    this.fireEvent(event, cmd);
  }

  private onLog(event: RoutesTaskEvent.LOG, line: {type: TaskType, line: string}): void {
    console.log(event, line);
    this.fireEvent(event, line);
  }

  private onError(event: RoutesTaskEvent.ERROR, error: {type: TaskType, error: string}): void {
    console.log(event, error);
    this.fireEvent(event, error);
  }

  private onBus(event: RoutesTaskEvent.BUS, body: BodyBus): void {
    console.log(event, body);
    this.fireEvent(event, body);
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: {type: TaskType, progress: Progress}): void {
    console.log(event, progress);
    this.fireEvent(event, progress);
  }

  private onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    console.log(event, data);
    this.fireEvent(event, data);
  }
}