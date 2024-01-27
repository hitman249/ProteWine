<script lang="ts">
  import _ from 'lodash';
  import {cubicOut} from 'svelte/easing';
  import {onDestroy, onMount, tick} from 'svelte';
  import HorizontalItem from './items/HorizontalItem.svelte';
  import VerticalItem from './items/VerticalItem.svelte';
  import Menu, {type MenuItem} from '../modules/menu';
  import {KeyboardKey, KeyboardPressEvent} from '../modules/keyboard';
  import {type Tweened, tweened, type Unsubscriber} from 'svelte/motion';
  import NavigateList from '../components/list/NavigateList.svelte';
  import ListPreloader from '../components/list/ListPreloader.svelte';
  import SelectItem from './items/SelectItem.svelte';
  import type {ValueType} from '../modules/value';

  let horizontalList: NavigateList;
  let selectList: NavigateList;
  let selectListItems: ValueType[];
  let verticalList: ListPreloader[] = [];

  let innerList: ListPreloader;
  let innerListItem: MenuItem;
  let isInnerList: boolean = false;

  let categoriesDelta: number = 0;
  let paddingLeftCategories: number = -Menu.ROOT_ITEM_HEIGHT;
  let timeout: any;

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
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scrollAnimate().set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const nextList: ListPreloader = verticalList[menu.getCategoryInstanceIndex(2)];
      const nextCategory: MenuItem = menu.getCategory(menu.getCurrentIndex() + 1);

      if (nextCategory && nextList && nextList.getModel() !== nextCategory) {
        nextList.changeList(nextCategory, nextCategory.getCurrentIndex());
      }
    }
  }

  function keyLeft() {
    if (horizontalList.hasLeft()) {
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scrollAnimate().set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const prevList: ListPreloader = verticalList[menu.getCategoryInstanceIndex(0)];
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

      const list: ListPreloader = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyDown();
        menu.getCategory().setCurrentIndex(list.getIndex());
      }
    }

    if (KeyboardKey.UP === key) {
      if (isInnerList) {
        return innerList.keyUp();
      }

      const list: ListPreloader = verticalList[menu.getCategoryInstanceIndex()];

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
        if (timeout) {
          clearTimeout(timeout);
        }

        innerListItem = item;
        isInnerList = true;
      }
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      isInnerList = false;

      tick().then(() => {
        timeout = setTimeout(() => {
          innerListItem = undefined;
          timeout = undefined;
        }, 200);
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

<div class="horizontal-list" class:list-move-to-left={isInnerList}>
  <NavigateList
    bind:this={horizontalList}
    items={items || []}
    itemSize={Menu.ROOT_ITEM_WIDTH}
    headersDummy={1}
    horizontal={true}
  >
    <div
      slot="item"
      class="horizontal-item"
      class:active={active}
      let:dummy
      let:position
      let:active
      let:item
      style="transform: translate({position}px, 0px);"
    >
      <HorizontalItem
        {dummy}
        {item}
        status={active ? 'active' : 'normal'}
      />
    </div>
  </NavigateList>
</div>

<div class="vertical-lists" class:list-move-to-left={isInnerList}>
  {#each categories as item, index}
    {@const current = item?.isActive()}
    {@const left = (((item?.getStackIndex() || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

    <ListPreloader
      bind:this={verticalList[index]}
      model={item}
      style="width: calc(100% - 180px);"
      {left}
      {current}
      delta={categoriesDelta}
      headersDummy={1}
      itemSize={Menu.ITEM_HEIGHT}
      itemSpace={Menu.ROOT_ITEM_HEIGHT}
      horizontal={false}
    >
      <div
        slot="item"
        class="vertical-item"
        class:active={active}
        let:index
        let:dummy
        let:position
        let:active
        let:jump
        let:item
        style="transform: translate(0px, {position}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
      >
        <VerticalItem
          {dummy}
          {item}
          {active}
        />
      </div>
    </ListPreloader>
  {/each}
</div>

<div class="inner-list">
  {#if innerListItem}
    <ListPreloader
      bind:this={innerList}
      current={isInnerList}
      model={innerListItem}
      delta={categoriesDelta}
      headersDummy={3}
      paddingIndent={-50}
      itemSize={Menu.ITEM_HEIGHT}
      itemSpace={0}
      horizontal={false}
    >
      <div
        slot="item"
        class="vertical-item"
        class:active={active}
        let:index
        let:dummy
        let:position
        let:active
        let:jump
        let:item
        style="transform: translate(0px, {position}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
      >
        <VerticalItem
          {dummy}
          {item}
          {active}
        />
      </div>
    </ListPreloader>
  {/if}
</div>

<div class="select-list">
  {#if selectListItems}
    <NavigateList
      bind:this={selectList}
      items={selectListItems || []}
      itemSize={30}
      headersDummy={1}
      horizontal={false}
    >
      <div
        slot="item"
        class="vertical-item"
        class:active={active}
        let:index
        let:dummy
        let:position
        let:active
        let:jump
        let:item
        style="transform: translate(0px, {position}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
      >
        <SelectItem
          {dummy}
          {item}
          status={active ? 'focused' : 'normal'}
        />
      </div>
    </NavigateList>
  {/if}
</div>

<style lang="less">
  .horizontal-list {
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
    transition: opacity 0.2s ease;
    overflow: hidden;
  }
</style>