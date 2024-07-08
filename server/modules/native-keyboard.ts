import {AbstractModule} from './abstract-module';
import type Command from './command';
import type Monitor from './monitor';
import type {Resolution} from './monitor';

export default class NativeKeyboard extends AbstractModule {
  private readonly openCmd: string = 'steam -ifrunning steam://open/keyboard';
  private readonly closeCmd: string = 'steam -ifrunning steam://close/keyboard';

  private fullscreen: boolean = false;

  private readonly command: Command;
  private readonly monitor: Monitor;

  constructor(command: Command, monitor: Monitor) {
    super();

    this.command = command;
    this.monitor = monitor;
  }

  public async init(): Promise<any> {
    const monitor: Resolution = await this.monitor.getResolution();
    this.fullscreen = 1280 >= monitor?.width;
  }

  public isFullscreen(): boolean {
    return this.fullscreen;
  }

  public async open(): Promise<void> {
    if (!this.isFullscreen()) {
      return;
    }

    await this.command.exec(this.openCmd);
  }

  public async close(): Promise<void> {
    if (!this.isFullscreen()) {
      return;
    }

    await this.command.exec(this.closeCmd);
  }
}