<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import _ from 'lodash';
  import {type Tweened, tweened, type Unsubscriber} from 'svelte/motion';
  import {cubicOut} from 'svelte/easing';
  import Menu from '../../modules/menu';

  export let items: any = [];

  let itemWidth: number = Menu.ROOT_ITEM_WIDTH;

  let container: HTMLDivElement;
  let containerWidth: number = 0;
  let scrollLeft: number = 0;
  let current: number = 0;
  let direction: boolean = true;

  let frame: number;

  let scroll: Tweened<number> = undefined;
  let unsubscribe: Unsubscriber = undefined;

  function scrollAnimate(): Tweened<number> {
    unsubscribe?.();

    scroll = tweened(scrollLeft, {
      duration: 200,
      easing: cubicOut,
    });

    unsubscribe = scroll.subscribe((value: number) => scrollTo(value));

    return scroll;
  }

  function poll() {
    if (container.scrollLeft !== scrollLeft) {
      scrollLeft = container.scrollLeft;
    }

    frame = requestAnimationFrame(poll);
  }

  export function scrollTo(position: number) {
    container?.scrollTo({left: position});
  }

  export function setIndex(index: number) {
    current = index;
  }

  export function getIndex() {
    return current;
  }

  export function hasRight(): boolean {
    return current < items.length - 1;
  }

  export function hasLeft(): boolean {
    return current > 0;
  }

  export function keyRight() {
    if (hasRight()) {
      direction = true;
      current++;
      scrollAnimate().set(current * itemWidth);
    }
  }

  export function keyLeft() {
    if (hasLeft()) {
      direction = false;
      current--;
      scrollAnimate().set(current * itemWidth);
    }
  }

  onMount(() => {
    frame = requestAnimationFrame(poll);
  });

  onDestroy(() => {
    unsubscribe();
    cancelAnimationFrame(frame);
  });
</script>

<div class="list" bind:this={container} bind:clientWidth={containerWidth}>
  {#if containerWidth > 0}
    <VirtualList {items} {itemWidth} {containerWidth} {scrollLeft} {direction} let:item let:dummy let:x let:index>
      <slot
        name="item"
        {item}
        {dummy}
        {scrollLeft}
        {x}
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
  }
</style>