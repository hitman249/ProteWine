import {AbstractModule} from '../../../server/modules/abstract-module';

export enum PopupNames {
  RUN_GAME = 'run-game',
  GAME_OPERATION = 'game-operation',
  FILE_MANAGER = 'file-manager',
  EXECUTING = 'executing',
}

export enum PopupEvents {
  // OPEN
  BEFORE_OPEN = 'before-open',
  OPEN = 'open',
  AFTER_OPEN = 'after-open',

  // CLOSE
  BEFORE_CLOSE = 'before-close',
  CLOSE = 'close',
  AFTER_CLOSE = 'after-close',
}

type PopupItem = {
  name: PopupNames,
  data: any,
  arguments: any,
};

export default class Popup extends AbstractModule {
  private opened: PopupNames;
  private data: any;
  private arguments: any;
  private history: PopupItem[] = [];
  public ref: any;

  constructor() {
    super();

    this.getData = this.getData.bind(this);
    this.getArguments = this.getArguments.bind(this);
  }

  public async init(): Promise<any> {
  }

  public getData(): any {
    return this.data;
  }

  public getArguments(): any {
    return this.arguments;
  }

  public getRef(): any {
    return this.ref;
  }

  public isOpen(name?: PopupNames): boolean {
    if (undefined === name) {
      return undefined !== this.opened;
    }

    return this.opened === name;
  }

  public open(name: PopupNames, data?: any, args?: any): this {
    if (name === this.opened) {
      return this;
    }

    if (undefined !== this.opened) {
      this.history.push({
        name: this.opened,
        data: this.data,
        arguments: this.arguments,
      });
    }

    this.opened = name;
    this.data = data;
    this.arguments = args;

    this.fireEvent(PopupEvents.BEFORE_OPEN, name, this);
    this.fireEvent(PopupEvents.OPEN, name, this);
    this.fireEvent(PopupEvents.AFTER_OPEN, name, this);

    return this;
  }

  public clearHistory(): this {
    this.history = [];
    return this;
  }

  public back(): this {
    if (this.history.length > 0) {
      const historyItem: PopupItem = this.history[this.history.length - 1];
      this.history = this.history.slice(0, -1);
      this.close();
      this.open(historyItem.name, historyItem.data, historyItem.arguments);
    } else {
      this.close();
    }

    return this;
  }

  private close(): void {
    if (undefined === this.opened) {
      return;
    }

    this.fireEvent(PopupEvents.BEFORE_CLOSE, this.opened, this);
    this.fireEvent(PopupEvents.CLOSE, this.opened, this);
    this.fireEvent(PopupEvents.AFTER_CLOSE, this.opened, this);

    this.opened = undefined;
    this.data = undefined;
    this.ref = undefined;
  }
}