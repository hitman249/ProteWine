import {AbstractModule} from '../../../server/modules/abstract-module';

export enum KeyboardKey {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  ENTER = 'Enter',
  ESC = 'Escape',
  BACKSPACE = 'Backspace',
}

export enum KeyboardPressEvent {
  KEY_UP = 'up',
  KEY_DOWN = 'down',
}

export default class Keyboard extends AbstractModule {
  constructor() {
    super();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  public async init(): Promise<any> {
    this.bind();
  }

  public bind(): void {
    window.document.addEventListener('keydown', this.onKeyDown, false);
    window.document.addEventListener('keyup', this.onKeyUp, false);
  }

  public unbind(): void {
    window.document.removeEventListener('keydown', this.onKeyDown, false);
    window.document.removeEventListener('keyup', this.onKeyUp, false);
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.fireEvent(KeyboardPressEvent.KEY_DOWN, event.code, event);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.fireEvent(KeyboardPressEvent.KEY_UP, event.code, event);
  }
}