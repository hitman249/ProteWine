<script lang="ts">
  import Helpers from '../../modules/helpers';

  export let items: any[];
  export let containerWidth: number;
  export let itemWidth: number;
  export let scrollLeft: number;
  export let direction: boolean;

  const dummySymbol = Symbol('dummy item');

  const getNaturalIndex: (index: number) => number = (index: number): number => {
    if (index < numOverlap) {
      return startIndex + (numItems - numOverlap) + index;
    } else {
      return startIndex - numOverlap + index;
    }
  };

  $: contentWidth = items.length * 2 * itemWidth + (items.length * 2);
  $: startIndex = Math.floor(scrollLeft / itemWidth);
  $: endIndex = startIndex + numItems;
  $: numOverlap = Math.floor(scrollLeft / itemWidth) % numItems;
  $: numItems = Math.ceil(containerWidth / itemWidth) + 1;
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

<div style="width: {contentWidth}px; height: 100%;"/>

{#each slice as item, index}
  {@const naturalIndex = getNaturalIndex(index)}
  {@const x = naturalIndex * itemWidth}

  <slot
    index={naturalIndex}
    item={item === dummySymbol ? undefined : item}
    dummy={item === dummySymbol}
    {x}
  />
{/each}