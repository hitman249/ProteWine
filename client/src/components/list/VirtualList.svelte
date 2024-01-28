<script lang="ts">
  import Helpers from '../../modules/helpers';

  export let items: any[];
  export let containerSize: number;
  export let itemSize: number;
  export let itemSpace: number;
  export let itemCenter: boolean = false;
  export let horizontal: boolean = true;
  export let headersDummy: number = 0;
  export let paddingIndent: number = 0;
  export let scrollIndent: number = 0;
  export let direction: boolean;

  const dummySymbol = Symbol('dummy item');

  function getNaturalIndex(index: number): number {
    if (index < numOverlap) {
      return startIndex + (numItems - numOverlap) + index;
    } else {
      return startIndex - numOverlap + index;
    }
  }

  function getAppendSpace(index: number, naturalIndex: number, scrollIndent: number): number {
    const position: number = (naturalIndex * itemSize) - (headersDummy * itemSize);

    if (itemCenter) {
      if (direction) {
        if (scrollIndent > position) {
          return 0;
        }

        if (scrollIndent > position - itemSize) {
          return itemSpace / 2;
        }
      }

      if (!direction && scrollIndent >= position) {
        if (scrollIndent < (position + itemSize)) {
          return itemSpace / 2;
        }

        return 0;
      }
    }

    if (direction && scrollIndent > position) {
      return 0;
    }

    if (!direction && scrollIndent < position + itemSize) {
      return itemSpace;
    }

    return index !== numOverlap ? itemSpace : 0;
  }

  $: startIndex = Math.floor(scrollIndent / itemSize);
  $: endIndex = startIndex + numItems;
  $: numOverlap = Math.floor(scrollIndent / itemSize) % numItems;
  $: numItems = Math.ceil(containerSize / itemSize) + 1;
  $: slice = Helpers.shiftArray(
    Helpers.sliceArray(
      items,
      startIndex,
      endIndex,
      dummySymbol,
      headersDummy,
    ),
    numOverlap,
  );
  $: contentSize = (items.length * itemSize) + containerSize;
</script>
<div
  style:width={horizontal ? (contentSize + 'px') : '100%'}
  style:height={!horizontal ? (contentSize + 'px') : '100%'}
/>

{#each slice as item, index}
  {@const naturalIndex = getNaturalIndex(index)}
  {@const position = (naturalIndex * itemSize) + getAppendSpace(index, naturalIndex, scrollIndent) + paddingIndent}

  <slot
    index={naturalIndex}
    item={item === dummySymbol ? undefined : item}
    dummy={item === dummySymbol}
    {position}
  />
{/each}
