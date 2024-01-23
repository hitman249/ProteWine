<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import {tweened, type Tweened, type Unsubscriber} from 'svelte/motion';
  import {cubicOut} from 'svelte/easing';
  import Menu from '../../modules/menu';
  import type {MenuItem} from '../../modules/menu.js';

  export let items: any = [];

  let itemSpace: number = Menu.ROOT_ITEM_HEIGHT;
  let itemHeight: number = Menu.ITEM_HEIGHT;

  let container: HTMLDivElement;
  let containerHeight: number = 0;
  let scrollTop: number = 0;
  let current: number = 0;
  let direction: boolean = true;

  let frame: number;

  let scroll: Tweened<number> = undefined;
  let unsubscribe: Unsubscriber = undefined;

  function scrollAnimate(): Tweened<number> {
    unsubscribe?.();

    scroll = tweened(scrollTop, {
      duration: 200,
      easing: cubicOut,
    });

    unsubscribe = scroll.subscribe((value: number) => scrollTo(value));

    return scroll;
  }

  function poll() {
    if (container.scrollTop !== scrollTop) {
      scrollTop = container.scrollTop;
    }

    frame = requestAnimationFrame(poll);
  }

  export function scrollTo(position: number) {
    container?.scrollTo({top: position});
  }

  export function getScrollPosition(): number {
    return scrollTop;
  }

  export function changeIndex(index: number) {
    direction = true;
    current = index;

    const position: number = current * itemHeight;

    scrollTo(position);

    if (scrollTop !== position) {
      scrollTop = position;
    }
  }

  export function getIndex(): number {
    return current;
  }

  export function hasDown(): boolean {
    return current < items.length - 1;
  }

  export function hasUp(): boolean {
    return current > 0;
  }

  export function keyDown(): void {
    if (hasDown()) {
      direction = true;
      current++;
      scrollAnimate().set(current * itemHeight);
    }
  }

  export function keyUp(): void {
    if (hasUp()) {
      direction = false;
      current--;
      scrollAnimate().set(current * itemHeight);
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

<div class="list" bind:this={container} bind:clientHeight={containerHeight}>
  {#if containerHeight > 0}
    <VirtualList {items} {itemHeight} {itemSpace} {containerHeight} {scrollTop} {direction} let:item let:dummy let:y let:index>
      <slot
        name="item"
        {item}
        {dummy}
        {scrollTop}
        {y}
        active={index === (current + 1)}
        index={index}
        jump={(direction && index === current) || (!direction && index === current + 1)}
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