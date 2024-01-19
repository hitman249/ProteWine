<script lang="ts">
  import Helpers from '../../modules/helpers';

  export let items: any[];
  export let containerHeight: number;
  export let itemHeight: number;
  export let itemSpace: number;
  export let scrollTop: number;
  export let direction: boolean;

  const dummySymbol = Symbol('dummy item');

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

  $: contentHeight = items.length * 2 * itemHeight;
  $: startIndex = Math.floor(scrollTop / itemHeight);
  $: endIndex = startIndex + numItems;
  $: numOverlap = Math.floor(scrollTop / itemHeight) % numItems;
  $: numItems = Math.ceil(containerHeight / itemHeight) + 1;
  $: slice = Helpers.shiftArray(
    Helpers.sliceArray(
      items,
      startIndex,
      endIndex,
      dummySymbol,
      1,
    ),
    numOverlap,
  );
</script>

<div style="width: 100%; height: {contentHeight}px;"/>

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