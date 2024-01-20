<script lang="ts">
  import HorizontalItem from './items/HorizontalItem.svelte';
  import VerticalItem from './items/VerticalItem.svelte';
  import Menu, {type MenuItem} from '../modules/menu';
  import _ from 'lodash';
  import {KeyboardKey, KeyboardPressEvent} from '../modules/keyboard';
  import {onDestroy, onMount} from 'svelte';
  import {tweened} from 'svelte/motion';
  import {cubicOut} from 'svelte/easing';
  import HorizontalList from '../components/horizontal-list/HorizontalList.svelte';
  import VerticalList from '../components/vertical-list/VerticalList.svelte';

  let horizontalList: HorizontalList;
  let verticalList: VerticalList[] = [];

  let container: HTMLDivElement;
  let containerWidth: number = 0;
  let categoriesDelta: number = 0;
  let direction: boolean;
  let paddingLeftCategories: number = -Menu.ROOT_ITEM_HEIGHT;

  const menu: Menu = new Menu();
  const items: MenuItem[] = menu.getRoot();

  const scroll = tweened(0, {
    duration: 200,
    easing: cubicOut,
  });

  const unsubscribe = scroll.subscribe((value: number) => {
    horizontalList?.scrollTo(value);
    categoriesDelta = value - ((horizontalList?.getIndex?.() || 0) * Menu.ROOT_ITEM_WIDTH);
  });

  function keyRight() {
    if (horizontalList.hasRight()) {
      direction = true;
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scroll.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const nextList: VerticalList = verticalList[menu.getCategoryInstanceIndex(2)];
      const nextCategory: MenuItem = menu.getCategory(menu.getCurrentIndex() + 1);

      if (nextCategory && nextList && nextList.getItems() !== nextCategory.items) {
        nextList.changeList(nextCategory.items, nextCategory.getCurrentIndex());
      }
    }
  }

  function keyLeft() {
    if (horizontalList.hasLeft()) {
      direction = false;
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scroll.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const prevList: VerticalList = verticalList[menu.getCategoryInstanceIndex(0)];
      const prevCategory: MenuItem = menu.getCategory(menu.getCurrentIndex() - 1);

      if (prevCategory && prevList && prevList.getItems() !== prevCategory.items) {
        prevList.changeList(prevCategory.items, prevCategory.getCurrentIndex());
      }
    }
  }

  const keyboardWatch = _.throttle((event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      const list: VerticalList = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyDown();
        menu.getCategory().setCurrentIndex(list.getIndex());
      }
    }

    if (KeyboardKey.UP === key) {
      const list: VerticalList = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyUp();
        menu.getCategory().setCurrentIndex(list.getIndex());
      }
    }

    if (KeyboardKey.LEFT === key) {
      keyLeft();
    }

    if (KeyboardKey.RIGHT === key) {
      keyRight();
    }

    if (KeyboardKey.ENTER === key) {

    }

    if (KeyboardKey.ESC === key) {

    }
  }, 50);

  $: categories = menu.getCategories();

  onMount(() => {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });

  onDestroy(() => {
    unsubscribe();
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });
</script>

<div class="list-container" bind:clientWidth={containerWidth}>
  {#if containerWidth > 0}
    <HorizontalList items={items || []} bind:this={horizontalList}>
      <div
        slot="item"
        class="horizontal-item"
        let:index
        let:dummy
        let:x
        let:active
        let:jump
        let:item
        style="transform: translate({x}px, 0px);"
      >
        {#key x}
          <HorizontalItem
            {dummy}
            {item}
            status={active ? 'active' : 'normal'}
          />
        {/key}
      </div>
    </HorizontalList>
  {/if}
</div>

<div class="vertical-lists">
  {#each categories as item, index}
    {@const current = item?.isActive()}
    {@const left = (((item?.getStackIndex() || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

    <div class="vertical-list" style="transform: translate({left - categoriesDelta}px, 0px); opacity: {current ? 1 : 0};">
      <VerticalList items={item ? item.items : []} bind:this={verticalList[index]}>
        <div
          slot="item"
          class="vertical-item"
          let:index
          let:dummy
          let:y
          let:active
          let:jump
          let:item
          style="transform: translate(0px, {y}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
        >
          {#key y}
            <VerticalItem
              {dummy}
              {item}
              status={active ? 'focused' : 'normal'}
            />
          {/key}
        </div>
      </VerticalList>
    </div>
  {/each}
</div>

<style lang="less">
  .list-container {
    position: absolute;
    display: block;
    top: 110px;
    left: 0;
    width: 100%;
    height: 170px;
    z-index: 1;
    text-align: center;
    color: rgba(255, 255, 255, 0.15);
    font-size: 20px;
  }

  .vertical-lists {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
  }

  .vertical-list {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: calc(100% - 180px);
    height: 100%;
    transition: opacity 0.15s ease;
  }

  .vertical-item {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }

  .horizontal-item {
    position: absolute;
    top: 0;
    left: 0;
  }

  :global(.virtual-list-wrapper) {
    margin: 0;
    padding-left: 150px;
    padding-right: 500px;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
  }
</style>