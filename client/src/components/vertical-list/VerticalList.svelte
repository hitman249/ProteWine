<script lang="ts">
  import {onMount, onDestroy} from 'svelte';
  import VirtualList from './VirtualList.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import _ from 'lodash';
  import {tweened} from 'svelte/motion';
  import {cubicOut} from 'svelte/easing';
  import Menu from '../../modules/menu';

  export let items: any = [];

  let itemSpace: number = Menu.ROOT_ITEM_HEIGHT;
  let itemHeight: number = Menu.ITEM_HEIGHT;

  let container: HTMLDivElement;
  let containerHeight: number = 0;
  let scrollTop: number = 0;
  let current: number = 0;
  let direction: boolean = true;

  let frame: number;

  function poll() {
    if (container.scrollTop !== scrollTop) {
      scrollTop = container.scrollTop;
    }

    frame = requestAnimationFrame(poll);
  }

  const scroll = tweened(0, {
    duration: 200,
    easing: cubicOut,
  });

  const unsubscribe = scroll.subscribe((value: number) => container?.scrollTo({top: value}));

  const keyboardWatch = _.throttle((event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      if (current < items.length - 1) {
        direction = true;
        current++;
        scroll.set(current * itemHeight);
      }
    }

    if (KeyboardKey.UP === key) {
      if (current > 0) {
        direction = false;
        current--;
        scroll.set(current * itemHeight);
      }
    }
  }, 50);

  onMount(() => {
    frame = requestAnimationFrame(poll);
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });

  onDestroy(() => {
    unsubscribe();
    cancelAnimationFrame(frame);
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
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
  }
</style>