<script lang="ts" context="module">
  let frameIndex: number = 0;
</script>
<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import Animate from '../../modules/animate';
  import fastdom, {type Fastdom} from "../../modules/fastdom";

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
    if (containerHeight !== container.clientHeight) {
      containerHeight = container.clientHeight;
    }

    if (containerWidth !== container.clientWidth) {
      containerWidth = container.clientWidth;
    }
  }

  export function getFastdom(): Fastdom {
    return fastdom;
  }

  function poll() {
    fastdom.measure(() => {
      if (!container) {
        return;
      }

      if (0 === frameIndex) {
        updateSizeContainer();
      }

      frameIndex++;

      if (60 < frameIndex) {
        frameIndex = 0;
      }

      const indent: number = horizontal ? container.scrollLeft : container.scrollTop;

      if (indent !== scrollIndent) {
        scrollIndent = indent;
      }
    });

    frame = requestAnimationFrame(poll);
  }

  export function scrollTo(position: number) {
    if (Boolean(container?.scrollTo)) {
      container?.scrollTo(horizontal ? {left: position} : {top: position});
    } else if (container) {
      container[horizontal ? 'scrollLeft' : 'scrollTop'] = position;
    }
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

    animate.setOffset(position);
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
      animate.set(current * itemSize);
    }
  }

  export function keyLeft() {
    if (hasLeft()) {
      direction = false;
      current--;
      animate.set(current * itemSize);
    }
  }

  export function keyDown(): void {
    if (hasDown()) {
      direction = true;
      current++;
      animate.set(current * itemSize);
    }
  }

  export function keyUp(): void {
    if (hasUp()) {
      direction = false;
      current--;
      animate.set(current * itemSize);
    }
  }

  onMount(() => {
    frame = requestAnimationFrame(poll);
    updateSizeContainer();
  });

  onDestroy(() => {
    cancelAnimationFrame(frame);
  });
</script>

<div
  class="list"
  bind:this={container}
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
      {@const nextJump = (
        (direction && (realIndex >= current - 1 && realIndex <= current + headersDummy - 1)) ||
        (!direction && (realIndex <= current + 1 && realIndex >= current - headersDummy + 1))
      ) && undefined !== position}

      <slot
        name="item"
        {item}
        {dummy}
        {scrollIndent}
        {position}
        active={current === realIndex && undefined !== position}
        index={index}
        jump={jumpInit && !dummy && nextJump}
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
    will-change: auto;
    transform: translateZ(0);
  }
</style>
