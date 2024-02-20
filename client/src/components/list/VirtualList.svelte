<script lang="ts">
  import Helpers from '../../modules/helpers';
  import {StickerType} from '../../widgets/stickers';

  export let items: any[];
  export let type: StickerType;
  export let containerSize: number;
  export let itemSize: number;
  export let itemSpace: number;
  export let itemCenter: boolean = false;
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

  function getPercent(active: boolean, position: number, startLeftPosition: number, endLeftPosition: number, startRightPosition: number, first: number): number {
    if (false === active) {
      return 0;
    }

    if (position === first) {
      return 100;
    }

    if (position === startLeftPosition) {
      return 0;
    }

    if (direction) {
      if (position > endLeftPosition && position <= startRightPosition) {
        return 100 - ((position - first) / itemSize * 100);
      }

      if (position <= endLeftPosition && position >= startLeftPosition) {
        return (position / endLeftPosition * 100);
      }
    } else {
      if (0 <= position && position <= first) {
        return ((position - margin) / itemSize * 100);
      }

      if (position > first && position <= startRightPosition) {
        return 200 - ((position - itemSpace) / itemSize * 100);
      }
    }
  }

  function getFixPosition(active: boolean, position: number, percent: number): number {
    if (!active) {
      return position;
    }

    if (direction) {
      if (position < first) {
        return position + (Math.trunc(margin / 100 * percent));
      }

      if (position >= first) {
        return position + (margin - Math.trunc(margin / 100 * percent));
      }
    } else {
      if (position <= first) {
        return position - (Math.trunc(margin / 100 * (100 - percent)));
      }

      if (position > first) {
        return position - (Math.trunc(margin / 100 * percent));
      }
    }

    return position;
  }

  $: numItems = Math.ceil(containerSize / itemSize) + 1 + Math.ceil(Math.abs(paddingIndent) / itemSize) + headersDummy;
  $: startIndex = Math.floor(scrollIndent / itemSize);
  $: endIndex = startIndex + numItems;
  $: numOverlap = startIndex % numItems;
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

  $: margin = (itemSpace / 2);
  $: first = (headersDummy * itemSize) + paddingIndent + margin;
  $: startLeftPosition = first - itemSize - margin;
  $: endLeftPosition = startLeftPosition + itemSize;
  $: startRightPosition = (itemSize + margin) + first;
</script>

{#each slice as item, indexTag}
  {@const index = getNaturalIndex(indexTag)}
  {@const position = (index * itemSize) + getAppendSpace(indexTag, index, scrollIndent) + paddingIndent - scrollIndent}
  {@const active = position > startLeftPosition && position < startRightPosition}
  {@const percent = getPercent(active, position, startLeftPosition, endLeftPosition, startRightPosition, first)}
  {@const fixPosition = getFixPosition(active, position, percent)}

  <slot
    item={item === dummySymbol ? undefined : item}
    dummy={item === dummySymbol}
    {active}
    {indexTag}
    {index}
    {percent}
    position={fixPosition}
    {type}
  />
{/each}
