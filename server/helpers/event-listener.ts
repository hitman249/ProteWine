type CallbackType = (event: string, ...args: any[]) => void;

export default class EventListener {
  public static EVENT_ANY: string = 'any';

  private listeners: {[event: string]: CallbackType[]} = {};

  public on(event: string, callback: CallbackType): void {
    if (undefined === this.listeners[event]) {
      this.listeners[event] = [];
    }

    if (-1 === this.listeners[event].indexOf(callback)) {
      this.listeners[event].push(callback);
    }
  }

  public once(event: string, callback: CallbackType): void {
    const wrapper = (event: string, ...args: any[]): void => {
      this.off(event, wrapper);
      callback(event, ...args);
    };

    this.on(event, wrapper);
  }

  public off(event: string, callback: CallbackType): void {
    if (undefined === this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter((value: CallbackType) => value !== callback);
  }

  public removeAllListeners(event?: string): void {
    if (undefined === event) {
      this.listeners = {};
    } else if (undefined !== this.listeners[event]) {
      this.listeners[event] = [];
    }
  }

  public fireEvent(event: string, ...args: any[]): void {
    if (event === EventListener.EVENT_ANY || undefined === this.listeners[event]) {
      return;
    }

    for (const callback of this.listeners[event]) {
      callback(event, ...args);
    }
  }
}