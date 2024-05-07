import {BrowserWindow, IpcMain} from 'electron';
import {AbstractModule} from '../../modules/abstract-module';
import type {Progress} from '../../modules/archiver';
import type {App} from '../../app';
import type Tasks from '../../modules/tasks';
import {RoutesTaskEvent} from '../routes';

export default class TasksRoutes extends AbstractModule {
  private readonly app: App;
  private readonly ipc: IpcMain;
  private readonly window: BrowserWindow;

  constructor(ipcMain: IpcMain, window: BrowserWindow, app: App) {
    super();
    this.ipc = ipcMain;
    this.window = window;
    this.app = app;

    this.onRun = this.onRun.bind(this);
    this.onLog = this.onLog.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onExit = this.onExit.bind(this);
  }

  public async init(): Promise<any> {
    const tasks: Tasks = this.app.getTasks();

    tasks.on(RoutesTaskEvent.RUN, this.onRun);
    tasks.on(RoutesTaskEvent.LOG, this.onLog);
    tasks.on(RoutesTaskEvent.PROGRESS, this.onProgress);
    tasks.on(RoutesTaskEvent.EXIT, this.onExit);
  }

  private onRun(event: RoutesTaskEvent.RUN, cmd: string): void {
    this.window.webContents.send(RoutesTaskEvent.RUN, {
      cmd,
      type: this.app.getTasks().getType(),
    });
  }

  private onLog(event: RoutesTaskEvent.LOG, line: string): void {
    this.window.webContents.send(RoutesTaskEvent.LOG, {
      line,
      type: this.app.getTasks().getType(),
    });
  }

  private onProgress(event: RoutesTaskEvent.PROGRESS, progress: Progress): void {
    this.window.webContents.send(RoutesTaskEvent.PROGRESS, {
      progress,
      type: this.app.getTasks().getType(),
    });
  }

  private onExit(): void {
    this.window.webContents.send(RoutesTaskEvent.EXIT, {
      type: this.app.getTasks().getType(),
    });
  }
}