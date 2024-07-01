export default class Timer {
  private seconds: number = 0;
  private timeout: number;
  private callback: (seconds: number) => void;

  public start(): void {
    if (undefined !== this.timeout) {
      return;
    }

    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.seconds += 30;
      this.callback?.(30);
      this.start();
    }, 30000) as any;
  }

  public stop(): void {
    if (undefined !== this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  public getSeconds(): number {
    return this.seconds;
  }

  public reset(): void {
    this.seconds = 0;
    this.stop();
  }

  public setCallback(fn: (seconds: number) => void): void {
    this.callback = fn;
  }
}
