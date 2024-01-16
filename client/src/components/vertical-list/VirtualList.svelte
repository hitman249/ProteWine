<script lang="ts">
  export let items: any[];
  export let containerHeight: number;
  export let itemHeight: number;
  export let itemSpace: number;
  export let scrollTop: number;
  export let direction: boolean;

  const dummySymbol = Symbol('dummy item');

  function sliceArray(arr: any[], start: number, end: number): any[] {
    const fixStart: number = start > 0 ? start - 1 : start;
    const fixEnd: number = end > 0 ? end - 1 : end;

    if (0 === start) {
      arr = [dummySymbol, ...arr.slice(fixStart, fixEnd)];
    } else {
      arr = arr.slice(fixStart, fixEnd);
    }

    let expectedLength = end - start;

    // If we don't have enough items we'll fill it up with dummy entries.
    // This makes everything a lot easier, consistent and less edge-casey.
    while (arr.length < expectedLength) {
      arr.push(dummySymbol);
    }

    return arr;
  }

  function shiftArray(arr: any[], count: number): any[] {
    // Could probably be optimized, but it runs on just dozens of items so relax.
    for (let i = 0; i < count; i++) {
      arr.unshift(arr.pop());
    }
    return arr;
  }

  const getNaturalIndex: (index: number) => number = (index: number): number => {
    if (index < numOverlap) {
      return startIndex + (numItems - numOverlap) + index;
    } else {
      return startIndex - numOverlap + index;
    }
  };

  const isAppendSpace: (index: number, naturalIndex: number, scrollTop: number) => boolean =
    (index: number, naturalIndex: number, scrollTop: number): boolean => {
      let over: number = (index - 1);

      if (over < 0) {
        over = numItems - 1;
      }

      if (direction && over === numOverlap) {
        const y: number = (naturalIndex * itemHeight) - itemHeight;

        if (scrollTop > y) {
          return false;
        }
      }

      return index !== numOverlap;
    };

  $: startIndex = Math.floor(scrollTop / itemHeight);
  $: endIndex = startIndex + numItems;
  $: numOverlap = Math.floor(scrollTop / itemHeight) % numItems;
  $: numItems = Math.ceil(containerHeight / itemHeight) + 1;
  $: slice = shiftArray(
    sliceArray(
      items,
      startIndex,
      endIndex,
    ),
    numOverlap,
  );
</script>

{#each slice as item, index}
  {@const naturalIndex = getNaturalIndex(index)}
  {@const y = (naturalIndex * itemHeight) + (isAppendSpace(index, naturalIndex, scrollTop) ? itemSpace : 0)}

  <slot
    index={naturalIndex}
    item={item === dummySymbol ? undefined : item}
    dummy={item === dummySymbol}
    {y}
  />
{/each}