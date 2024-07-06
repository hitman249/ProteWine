<script lang="ts" context="module">
  const animateRange: AnimateRange = new AnimateRange(0, 0);
</script>
<script lang="ts">
  import Helpers from '../../modules/helpers';
  import {StickerType} from '../../widgets/stickers';
  import AnimateRange from '../../modules/animate-range';

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
          return itemSpace;
        }
      }

      if (!direction && scrollIndent >= position) {
        if (scrollIndent < (position + itemSize)) {
          return itemSpace;
        }

        return 0;
      }
    }

    if (direction && scrollIndent > position) {
      return 0;
    }

    if (!direction && scrollIndent < position + itemSize) {
      return (itemCenter ? itemSpace * 2 : itemSpace);
    }

    return index !== numOverlap ? (itemCenter ? itemSpace * 2 : itemSpace) : 0;
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
      // [item] left
      if (position <= endLeftPosition && position >= startLeftPosition) {
        return animateRange.update(startLeftPosition, endLeftPosition).getPercent(position);
      }

      // [item] center

      // [item] right
      if (position > endLeftPosition && position <= startRightPosition) {
        return 100 - ((position - first) / itemSize * 100);
      }
    } else {
      // [item] left
      if (startLeftPosition <= position && position < first) {
        return animateRange.update(first - itemSize, first).getPercent(position);
      }

      // [item] center

      // [item] right
      if (position >= first && position <= startRightPosition) {
        if (!itemCenter) {
          return 100 - animateRange.update(first, first + itemSize).getPercent(position);
        }

        return 100 - ((position - (startRightPosition - itemSize)) / (startRightPosition - (startRightPosition - itemSize)) * 100);
      }
    }
  }

  function getFixPosition(active: boolean, position: number, percent: number): number {
    if (!active) {
      return position;
    }

    if (!itemCenter) {
      if (position >= first) {
        return position;
      }
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

  export function getIndexByPosition(position: number = scrollIndent): number {
    return direction ? Math.ceil(position / itemSize) : Math.trunc(position / itemSize);
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

  export function getPositionByIndex(index: number): {index: number, position: number, percent: number, active: boolean} {
    const naturalIndex: number = getNaturalIndex(index);
    const position: number = (naturalIndex * itemSize) + getAppendSpace(index, naturalIndex, scrollIndent) + paddingIndent - scrollIndent;
    const active: boolean = itemCenter ? (position > startLeftPosition && position < startRightPosition) : (position > startLeftPosition && position < (first + itemSize));
    const percent: number = getPercent(active, position, startLeftPosition, endLeftPosition, startRightPosition, first);
    const fixPosition: number = getFixPosition(active, position, percent);

    return {
      index: naturalIndex,
      position: fixPosition,
      percent,
      active,
    };
  }

  $: margin = Math.trunc(itemSpace);
  $: first = (headersDummy * itemSize) + paddingIndent + margin;
  $: startLeftPosition = first - itemSize - margin;
  $: endLeftPosition = startLeftPosition + itemSize;
  $: startRightPosition = (itemSize + margin) + first;
  $: endRightPosition = startRightPosition + itemSize;
</script>

{#each slice as item, indexTag}
  {@const index = getNaturalIndex(indexTag)}
  {@const position = (index * itemSize) + getAppendSpace(indexTag, index, scrollIndent) + paddingIndent - scrollIndent}
  {@const active = itemCenter ? (position > startLeftPosition && position < startRightPosition) : (position > startLeftPosition && position < (first + itemSize))}
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
