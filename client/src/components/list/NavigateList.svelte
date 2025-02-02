<script lang="ts" context="module">
</script>
<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import Animate from '../../modules/animate';
  import fastdom, {type Fastdom} from "../../modules/fastdom";
  import {StickerType} from '../../widgets/stickers';

  export let style: string = undefined;
  export let items: any = [];
  export let type: StickerType;
  export let itemSpace: number = 0;
  export let itemCenter: boolean = false;
  export let itemSize: number = 0;
  export let marginIndent: number = 0;
  export let headersDummy: number = 0;
  export let paddingIndent: number = 0;
  export let horizontal: boolean = true;
  export let updateSize: (size: {width: number, height: number}) => void;
  export let onScroll: (position: number, activeIndex: number) => void = undefined;

  let list: VirtualList;
  let container: HTMLDivElement;
  let containerHeight: number = 0;
  let containerWidth: number = 0;
  let scrollIndent: number = 0;
  let current: number = 0;
  let direction: boolean = true;
  let jumpInit: boolean = false;

  let animate: Animate = new Animate();
  animate.setOffset(0);
  animate.subscribe((value: number) => {
    if (!jumpInit) {
      jumpInit = true;
    }

    fastdom.mutate(() => {
      scrollTo(value);
    });
  });

  function updateSizeContainer(): void {
    let change: boolean = false;

    if (containerHeight !== container.clientHeight) {
      containerHeight = container.clientHeight;
      change = true;
    }

    if (containerWidth !== container.clientWidth) {
      containerWidth = container.clientWidth;
      change = true;
    }

    if (change && updateSize) {
      updateSize(getSize());
    }
  }

  export function scrollTo(position: number) {
    scrollIndent = position;
    onScroll?.(position, list?.getIndexByPosition(position) || 0);
  }

  export function getScrollPosition(): number {
    return scrollIndent;
  }

  export function setDirection(value: boolean): void {
    if (direction !== value) {
      direction = value;
    }
  }

  export function changeIndex(index: number, animated: boolean = false): void {
    setIndex(index);
    setDirection(true);

    const position: number = current * itemSize;

    if (animated) {
      animate.set(position);
    } else {
      scrollTo(position);

      animate.setOffset(position);
    }
  }

  export function getIndex(): number {
    return current;
  }

  export function setIndex(index: number): void {
    current = index;
  }

  export function hasLeft(): boolean {
    return current > 0;
  }

  export function getItem(): any {
    return items[current];
  }

  export function hasRight(): boolean {
    return current < items.length - 1;
  }

  export function hasDown(): boolean {
    return current < items.length - 1;
  }

  export function hasUp(): boolean {
    return current > 0;
  }

  export function keyRight() {
    if (hasRight()) {
      setDirection(true);
      current++;
      animate.set(current * itemSize);
    }
  }

  export function keyLeft() {
    if (hasLeft()) {
      setDirection(false);
      current--;
      animate.set(current * itemSize);
    }
  }

  export function keyDown(): void {
    if (hasDown()) {
      setDirection(true);
      current++;
      animate.set(current * itemSize);
    }
  }

  export function keyUp(): void {
    if (hasUp()) {
      setDirection(false);
      current--;
      animate.set(current * itemSize);
    }
  }

  export function getSize(): { width: number, height: number } {
    return {
      width: containerWidth,
      height: containerHeight
    };
  }

  function getStyles(horizontal: boolean, position: number, marginIndent: number = 0): any {
    return {
      transform: `translate(${horizontal ? position : marginIndent}px, ${horizontal ? marginIndent : position}px)`
    };
  }

  export function getPositionByIndex(index: number): {index: number, position: number, percent: number, active: boolean} {
    return list?.getPositionByIndex(index);
  }

  onMount(() => {
    updateSizeContainer();
  });

  onDestroy(() => {
  });
</script>

<div class="list" bind:this={container} style={style || ''}>
  {#if (horizontal ? containerWidth : containerHeight) > 0}
    <VirtualList
      bind:this={list}
      containerSize={horizontal ? containerWidth : containerHeight}
      {direction}
      {headersDummy}
      {itemCenter}
      {itemSize}
      {itemSpace}
      {items}
      {paddingIndent}
      {scrollIndent}
      {type}

      let:dummy
      let:percent
      let:active
      let:index
      let:indexTag
      let:item
      let:position
      let:type
      let:direction
    >
      <slot
        name="navigate-list-item"

        {active}
        {dummy}
        {index}
        {indexTag}
        {item}
        {position}
        {direction}
        {scrollIndent}
        {type}
        itemClass={`list-item ${active ? 'active' : ''}`}
        itemStyle={getStyles(horizontal, position, marginIndent)}
        {percent}
      />
    </VirtualList>
  {/if}
</div>

<style lang="less">
  .list {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: visible;
    will-change: auto;
    transform: translateZ(0);
  }
</style>
