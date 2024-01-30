<script lang="ts" context="module">

</script>
<script lang="ts">
  import fastdom from 'fastdom';
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import {tweened, type Tweened, type Unsubscriber} from 'svelte/motion';
  import {cubicInOut, cubicOut} from 'svelte/easing';

  export let items: any = [];
  export let itemSpace: number = 0;
  export let itemCenter: boolean = false;
  export let itemSize: number = 0;
  export let headersDummy: number = 0;
  export let paddingIndent: number = 0;
  export let horizontal: boolean = true;

  let container: HTMLDivElement;
  let containerHeight: number = 0;
  let containerWidth: number = 0;
  let scrollIndent: number = 0;
  let current: number = 0;
  let direction: boolean = true;
  let jumpInit: boolean = false;

  let frame: number;

  let scroll: Tweened<number> = undefined;
  let unsubscribe: Unsubscriber = undefined;

  function scrollAnimate(): Tweened<number> {
    if (!jumpInit) {
      jumpInit = true;
    }

    unsubscribe?.();

    const position: number = current * itemSize + (direction ? -itemSize : itemSize);

    let easing: boolean = direction
      ? scrollIndent < position - 20
      : scrollIndent > position + 20;

    scroll = tweened(scrollIndent, {
      duration: 300,
      easing: easing ? cubicOut : cubicInOut,
    });

    unsubscribe = scroll.subscribe((value: number) => scrollTo(value));

    return scroll;
  }

  function poll() {
    if ((horizontal ? container.scrollLeft : container.scrollTop) !== scrollIndent) {
      scrollIndent = (horizontal ? container.scrollLeft : container.scrollTop);
    }

    frame = requestAnimationFrame(poll);
  }

  export function scrollTo(position: number) {
    container?.scrollTo(horizontal ? {left: position} : {top: position});
  }

  export function getScrollPosition(): number {
    return scrollIndent;
  }

  export function changeIndex(index: number): void {
    setIndex(index);
    direction = true;

    const position: number = current * itemSize;

    scrollTo(position);

    if (scrollIndent !== position) {
      scrollIndent = position;
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
      direction = true;
      current++;
      scrollAnimate().set(current * itemSize);
    }
  }

  export function keyLeft() {
    if (hasLeft()) {
      direction = false;
      current--;
      scrollAnimate().set(current * itemSize);
    }
  }

  export function keyDown(): void {
    if (hasDown()) {
      direction = true;
      current++;

      scrollAnimate().set(current * itemSize);
    }
  }

  export function keyUp(): void {
    if (hasUp()) {
      direction = false;
      current--;

      scrollAnimate().set(current * itemSize);
    }
  }

  onMount(() => {
    frame = requestAnimationFrame(poll);
  });

  onDestroy(() => {
    unsubscribe?.();
    cancelAnimationFrame(frame);
  });
</script>

<div
  class="list"
  bind:this={container}
  bind:clientHeight={containerHeight}
  bind:clientWidth={containerWidth}
>
  {#if (horizontal ? containerWidth : containerHeight) > 0}
    <VirtualList
      {items}
      {itemSize}
      {itemSpace}
      {itemCenter}
      {headersDummy}
      {paddingIndent}
      containerSize={horizontal ? containerWidth : containerHeight}
      {scrollIndent}
      {direction}
      let:item
      let:dummy
      let:position
      let:index
    >
      {@const realIndex = index - headersDummy}

      <slot
        name="item"
        {item}
        {dummy}
        {scrollIndent}
        {position}
        active={current === realIndex}
        index={index}
        jump={jumpInit && !dummy && (
          (direction && (realIndex >= current - 1 && realIndex <= current + headersDummy - 1)) ||
          (!direction && (realIndex <= current + 1 && realIndex >= current - headersDummy + 1))
        )}
      />
    </VirtualList>
  {/if}
</div>

<style lang="less">
  .list {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* One inline-block per line, no horizontal scrolling  */
    box-sizing: border-box;
    will-change: auto;
    transform: translateZ(0);
  }
</style>
