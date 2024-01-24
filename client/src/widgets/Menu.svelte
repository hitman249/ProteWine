<script lang="ts">
  import _ from 'lodash';
  import {cubicOut} from 'svelte/easing';
  import {onDestroy, onMount, tick} from 'svelte';
  import HorizontalItem from './items/HorizontalItem.svelte';
  import VerticalItem from './items/VerticalItem.svelte';
  import Menu, {type MenuItem} from '../modules/menu';
  import {KeyboardKey, KeyboardPressEvent} from '../modules/keyboard';
  import {type Tweened, tweened, type Unsubscriber} from 'svelte/motion';
  import HorizontalList from '../components/horizontal-list/HorizontalList.svelte';
  import VerticalList from '../components/vertical-list/VerticalList.svelte';
  import VerticalListPreloader from '../components/vertical-list/VerticalListPreloader.svelte';

  let horizontalList: HorizontalList;
  let verticalList: VerticalListPreloader[] = [];

  let innerList: VerticalList;
  let innerListItems: MenuItem[];
  let isInnerList: boolean = false;

  let container: HTMLDivElement;
  let containerWidth: number = 0;
  let categoriesDelta: number = 0;
  let direction: boolean;
  let paddingLeftCategories: number = -Menu.ROOT_ITEM_HEIGHT;

  let scroll: Tweened<number> = undefined;
  let unsubscribe: Unsubscriber = undefined;

  function scrollAnimate(): Tweened<number> {
    unsubscribe?.();

    scroll = tweened(horizontalList?.getScrollPosition(), {
      duration: 200,
      easing: cubicOut,
    });

    unsubscribe = scroll.subscribe((value: number) => {
      horizontalList?.scrollTo(value);
      categoriesDelta = value - ((horizontalList?.getIndex?.() || 0) * Menu.ROOT_ITEM_WIDTH);
    });

    return scroll;
  }

  const menu: Menu = new Menu();
  const items: MenuItem[] = menu.getRoot();

  function keyRight() {
    if (horizontalList.hasRight()) {
      direction = true;
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scrollAnimate().set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const nextList: VerticalListPreloader = verticalList[menu.getCategoryInstanceIndex(2)];
      const nextCategory: MenuItem = menu.getCategory(menu.getCurrentIndex() + 1);

      if (nextCategory && nextList && nextList.getModel() !== nextCategory) {
        nextList.changeList(nextCategory, nextCategory.getCurrentIndex());
      }
    }
  }

  function keyLeft() {
    if (horizontalList.hasLeft()) {
      direction = false;
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scrollAnimate().set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const prevList: VerticalListPreloader = verticalList[menu.getCategoryInstanceIndex(0)];
      const prevCategory: MenuItem = menu.getCategory(menu.getCurrentIndex() - 1);

      if (prevCategory && prevList && prevList.getModel() !== prevCategory) {
        prevList.changeList(prevCategory, prevCategory.getCurrentIndex());
      }
    }
  }

  const keyboardWatch = _.throttle((event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      if (isInnerList) {
        return innerList.keyDown();
      }

      const list: VerticalListPreloader = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyDown();
        menu.getCategory().setCurrentIndex(list.getIndex());
      }
    }

    if (KeyboardKey.UP === key) {
      if (isInnerList) {
        return innerList.keyUp();
      }

      const list: VerticalListPreloader = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyUp();
        menu.getCategory().setCurrentIndex(list.getIndex());
      }
    }

    if (KeyboardKey.LEFT === key) {
      if (isInnerList) {
        key = KeyboardKey.ESC;
      } else {
        keyLeft();
      }
    }

    if (KeyboardKey.RIGHT === key) {
      if (isInnerList) {
        key = KeyboardKey.ENTER;
      } else {
        keyRight();
      }
    }

    if (KeyboardKey.ENTER === key) {
      const item: MenuItem = menu.getFocusedItem();

      if (item?.hasItems()) {
        item.load().then(() => {
          innerListItems = item.items;
          tick().then(() => {
            isInnerList = true;
          });
        });
      }
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      isInnerList = false;
      tick().then(() => {
        innerListItems = undefined;
      });
    }
  }, 100);

  $: categories = menu.getCategories();

  onMount(() => {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });

  onDestroy(() => {
    unsubscribe?.();
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });
</script>

<div class="list-container" class:list-move-to-left={isInnerList} bind:clientWidth={containerWidth}>
  {#if containerWidth > 0}
    <HorizontalList items={items || []} bind:this={horizontalList}>
      <div
        slot="item"
        class="horizontal-item"
        class:active={active}
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

<div class="vertical-lists" class:list-move-to-left={isInnerList}>
  {#each categories as item, index}
    {@const current = item?.isActive()}
    {@const left = (((item?.getStackIndex() || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

    <VerticalListPreloader
      model={item}
      bind:this={verticalList[index]}
      {left}
      {current}
      delta={categoriesDelta}
    />
  {/each}
</div>

<div class="inner-list" style="opacity: {isInnerList ? 1 : 0};">
  {#if innerListItems}
    <VerticalList items={innerListItems} bind:this={innerList} itemSpace={0} headerMargin={3} paddingTop={-50}>
      <div
        slot="item"
        class="vertical-item"
        class:active={active}
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
  {/if}
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
    font-size: 20px;
    transition: transform 0.3s;
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
    transition: transform 0.3s;
  }

  .inner-list {
    position: absolute;
    display: block;
    top: 0;
    left: 200px;
    width: calc(100% - 200px);
    height: 100%;
    transition: opacity 0.200s ease;
    overflow: hidden;
  }
</style>