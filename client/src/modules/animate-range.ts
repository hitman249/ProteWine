export default class AnimateRange {
  private _start: number;
  private _end: number;
  private start: number;
  private end: number;
  private delta: number;

  constructor(start: number, end: number) {
    this.update(start, end);
  }

  public update(start: number, end: number): this {
    const _start: number = start < end ? start : end;
    const _end: number = start > end ? start : end;

    if (this._start === _start && this._end === _end) {
      return this;
    }

    this._start = _start;
    this._end = _end;

    if (0 === _start) {
      this.delta = 0;
    } else if (0 <= _start) {
      this.delta = -_start;
    } else {
      this.delta = Math.abs(_start);
    }

    this.start = _start + this.delta;
    this.end = _end + this.delta;

    return this;
  }

  public getPercent(value: number): number {
    if (value === this._end && value === this._start) {
      return 100;
    }

    if (value < this._start || value > this._end) {
      return 0;
    }

    return ((value + this.delta) / (this.end) * 100);
  }
}
