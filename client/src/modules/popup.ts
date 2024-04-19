import EventListener from '../../../server/helpers/event-listener';

export enum PopupNames {
  RUN_GAME = 'run-game',
  GAME_OPERATION = 'game-operation',
  FILE_MANAGER = 'file-manager',
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

  // UPDATE
  UPDATE_DATA = 'update-data',
}

export default class Popup extends EventListener {
  private opened: PopupNames;
  private data: any;
  public ref: any;

  constructor() {
    super();

    this.setData = this.setData.bind(this);
    this.getData = this.getData.bind(this);
  }

  public setData(data: any): this {
    this.data = data;
    this.fireEvent(PopupEvents.UPDATE_DATA, data);

    return this;
  }

  public getData(): any {
    return this.data;
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

  public open(name: PopupNames): void {
    this.opened = name;

    this.fireEvent(PopupEvents.BEFORE_OPEN, name, this);
    this.fireEvent(PopupEvents.OPEN, name, this);
    this.fireEvent(PopupEvents.AFTER_OPEN, name, this);
  }

  public close(): void {
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