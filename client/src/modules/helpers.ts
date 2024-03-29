import _ from 'lodash';

export default class Helpers {
  public static sliceArray(arr: any[], start: number, end: number, dummy: Symbol | boolean, leftPaddingItems: number = 0): any[] {
    if (0 < leftPaddingItems) {
      const padding: number = (start < leftPaddingItems) ? start : leftPaddingItems;
      const fixStart: number = start > 0 ? start - padding : start;
      const fixEnd: number = end > 0 ? end - padding : end;

      if (leftPaddingItems > start) {
        arr = [..._.range(0, leftPaddingItems - start).map(() => dummy), ...arr.slice(fixStart, fixEnd)];
      } else {
        arr = arr.slice(fixStart, fixEnd);
      }
    }

    const expectedLength: number = end - start;

    // If we don't have enough items we'll fill it up with dummy entries.
    // This makes everything a lot easier, consistent and less edge-casey.
    while (arr.length < expectedLength) {
      arr.push(dummy);
    }

    return arr;
  }

  public static shiftArray(arr: any[], count: number): any[] {
    // Could probably be optimized, but it runs on just dozens of items so relax.
    for (let i: number = 0; i < count; i++) {
      arr.unshift(arr.pop());
    }

    return arr;
  }
}