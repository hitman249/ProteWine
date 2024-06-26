import {AbstractRouteModule} from './abstract-route-module';
import Utils from '../../helpers/utils';
import type {BrowserWindow, IpcMain} from 'electron';
import type {Progress} from '../../modules/archiver';
import type {App} from '../../app';
import type Tasks from '../../modules/tasks';
import type {BodyBus} from '../../modules/tasks/types';
import {RoutesTaskEvent, RoutesTaskMethod} from '../routes';

export default class TasksRoutes extends AbstractRouteModule {
  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super(ipcMain, window, app);

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onError = this.onError.bind(this);
    this.onBus = this.onBus.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async init(): Promise<any> {
    const tasks: Tasks = this.app.getTasks();

    tasks.on(RoutesTaskEvent.RUN, this.onRun);
    tasks.on(RoutesTaskEvent.LOG, this.onLog);
    tasks.on(RoutesTaskEvent.ERROR, this.onError);
    tasks.on(RoutesTaskEvent.BUS, this.onBus);
    tasks.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    tasks.on(RoutesTaskEvent.EXIT, this.onExit);

    this.bindKill();
    this.bindType();
    this.bindFinish();
  }

  private bindKill(): void {
    this.ipc.handle(
      RoutesTaskMethod.KILL,
      async (): Promise<any> => this.app.getTasks().kill(),
    );
  }

  private bindType(): void {
    this.ipc.handle(
      RoutesTaskMethod.TYPE,
      async (): Promise<any> => this.app.getTasks().getType(),
    );
  }

  private bindFinish(): void {
    this.ipc.handle(
      RoutesTaskMethod.FINISH,
      async (): Promise<any> => this.app.getTasks().isFinish(),
    );
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      window.webContents.send(RoutesTaskEvent.RUN, {
        cmd,
        type: this.app.getTasks().getType(),
        date: Utils.getFormattedDate(),
      });
    }
  }

  private onLog(event: RoutesTaskEvent.LOG, line: string): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      window.webContents.send(RoutesTaskEvent.LOG, {
        line,
        type: this.app.getTasks().getType(),
        date: Utils.getFormattedDate(),
      });
    }
  }

  private onBus(event: RoutesTaskEvent.BUS, body: BodyBus): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      body.date = Utils.getFormattedDate();
      window.webContents.send(RoutesTaskEvent.BUS, body);
    }
  }

  private onError(event: RoutesTaskEvent.ERROR, error: string): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      window.webContents.send(RoutesTaskEvent.ERROR, {
        error,
        type: this.app.getTasks().getType(),
        date: Utils.getFormattedDate(),
      });
    }
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: Progress): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      window.webContents.send(RoutesTaskEvent.PROGRESS, {
        progress,
        type: this.app.getTasks().getType(),
        date: Utils.getFormattedDate(),
      });
    }
  }

  private onExit(): void {
    const window: BrowserWindow = this.app.getServer().getWindow();

    if (window) {
      window.webContents.send(RoutesTaskEvent.EXIT, {
        type: this.app.getTasks().getType(),
        date: Utils.getFormattedDate(),
      });
    }
  }
}