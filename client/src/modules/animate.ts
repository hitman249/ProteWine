import {tweened, type Tweened} from 'svelte/motion';
import {sineInOut} from 'svelte/easing';
import type {Subscriber, Unsubscriber} from 'svelte/store';

export default class Animate {
  private offset: number = 0;
  private scroll: Tweened<number>;
  private unsubscribe: Unsubscriber;
  private run: Subscriber<number>;

  private value: number;
  private current: number = 0;

  private resetAnimation(): void {
    this.unsubscribe?.();

    this.scroll = tweened(this.offset, {
      duration: 300,
      easing: sineInOut,
    });

    if (this.run) {
      this.unsubscribe = this.scroll.subscribe(this.run);
    }
  }

  public setOffset(offset: number): void {
    this.offset = offset;
    this.value = undefined;
    this.current = 0;
    this.resetAnimation();
  }

  public subscribe(run: Subscriber<number>): void {
    this.run = (value: number): void => {
      this.current = value;
      run(value);
    };

    this.unsubscribe?.();
    this.unsubscribe = this.scroll.subscribe(this.run);
  }

  public set(value: number): void {
    this.value = value;
    this.scroll.set(value);
  }
}
