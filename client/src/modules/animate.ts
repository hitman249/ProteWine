import {tweened, type Subscriber, type Tweened, type Unsubscriber} from 'svelte/motion';
import {sineInOut} from 'svelte/easing';

export default class Animate {
  private readonly duration: number = 300;

  private offset: number = 0;
  private scroll: Tweened<number>;
  private unsubscribe: Unsubscriber;
  private run: Subscriber<number>;
  private value: number;
  private easing: (t: number) => number;

  private waitResolve: (value: number) => void;
  private waitPromise: Promise<number>;
  private toValue: number;

  constructor(value?: number, duration?: number, easing?: (t: number) => number) {
    if (undefined !== value) {
      this.offset = value;
    }

    if (undefined !== duration) {
      this.duration = duration;
    }

    this.easing = undefined !== easing ? easing : sineInOut;

    this.init();
  }

  private init(): void {
    this.scroll = tweened(this.offset, {
      duration: this.duration,
      easing: this.easing,
    });
  }

  private resetAnimation(): void {
    this.unsubscribe?.();

    this.init();

    if (this.run) {
      this.unsubscribe = this.scroll.subscribe(this.run);
    }
  }

  public setOffset(offset: number): void {
    this.offset = offset;
    this.resetAnimation();
  }

  public subscribe(run: Subscriber<number>): void {
    this.run = (value: number): void => {
      this.value = value;
      run(value);

      if (this.waitResolve && value === this.toValue) {
        this.waitResolve(value);
      }
    };

    this.unsubscribe?.();
    this.unsubscribe = this.scroll.subscribe(this.run);
  }

  public set(value: number): void {
    if (this.waitResolve) {
      this.waitResolve(this.value);
    }

    this.toValue = value;

    this.waitPromise = new Promise((resolve: (value: number) => void): void => {
      this.waitResolve = (value: number): void => {
        resolve(value);
        this.waitResolve = undefined;
      };
    });

    this.scroll.set(value);
  }

  public getValue(): number {
    return this.value;
  }

  public wait(): Promise<number> {
    if (this.waitPromise) {
      return this.waitPromise;
    }

    return Promise.resolve(this.value);
  }

  public isFinish(): boolean {
    return this.value === this.toValue;
  }
}
