<script lang="ts" context="module">
</script>
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
  let verticalList: ListPreloader[] = [];

  let innerList: ListPreloader;
  let innerListItem: MenuItem;
  let isInnerList: boolean = false;

  let selectList: NavigateList;
  let selectListHeight: number = 0;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[];

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
  const items: MenuItem[] = menu.getItems();

  function keyRight() {
    if (horizontalList.hasRight()) {
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      scrollAnimate().set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const nextList: ListPreloader = verticalList[menu.getCategoryInstanceIndex(2)];
      const nextItem: MenuItem = menu.getFocusedLevel(1).next();

      if (nextItem && nextList && nextList.getModel() !== nextItem) {
        nextList.changeList(nextItem);
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
      const prevItem: MenuItem = menu.getFocusedLevel(1).prev();

      if (prevItem && prevList && prevList.getModel() !== prevItem) {
        prevList.changeList(prevItem);
      }
    }
  }

  const keyboardWatch = _.throttle((event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      if (isSelectList) {
        selectList?.keyDown();
        return;
      }

      if (isInnerList) {
        innerList.keyDown();
        innerList.getItem()?.updateFocusedItem();
        return;
      }

      const list: ListPreloader = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyDown();
        list.getItem()?.updateFocusedItem();
      }
    }

    if (KeyboardKey.UP === key) {
      if (isSelectList) {
        selectList?.keyUp();
        return;
      }

      if (isInnerList) {
        innerList.keyUp();
        innerList.getItem()?.updateFocusedItem();
        return;
      }

      const list: ListPreloader = verticalList[menu.getCategoryInstanceIndex()];

      if (list) {
        list.keyUp();
        list.getItem()?.updateFocusedItem();
      }
    }

    if (KeyboardKey.LEFT === key) {
      if (isInnerList || isSelectList) {
        key = KeyboardKey.ESC;
      } else {
        keyLeft();
      }
    }

    if (KeyboardKey.RIGHT === key) {
      if (isInnerList || isSelectList) {
        return;
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
      } else if (item.value) {
        selectListItems = item.value.getList();

        tick().then(() => {
          isSelectList = true;
        });
      }
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      if (isSelectList) {
        isSelectList = false;

        tick().then(() => {
          timeout = setTimeout(() => {
            selectListItems = undefined;
            timeout = undefined;
          }, 200);
        });
        return;
      }

      if (isInnerList) {
        menu.backFocus();
        isInnerList = false;

        tick().then(() => {
          timeout = setTimeout(() => {
            innerListItem = undefined;
            timeout = undefined;
          }, 200);
        });

        return;
      }
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

<div class="horizontal-list" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList}>
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
        {active}
      />
    </div>
  </NavigateList>
</div>

<div class="vertical-lists" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList}>
  {#each categories as item, index}
    {@const current = item?.isActive()}
    {@const left = (((item?.getStackIndex() || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

    <ListPreloader
      bind:this={verticalList[index]}
      model={item}
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

{#if innerListItem}
  <div class="inner-list" class:list-only-active={isSelectList}>
    <ListPreloader
      bind:this={innerList}
      current={isInnerList}
      model={innerListItem}
      delta={categoriesDelta}
      headersDummy={3}
      paddingIndent={-41}
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
  </div>
{/if}

{#if selectListItems}
  <div class="select-list" class:open={isSelectList}>
    <NavigateList
      bind:this={selectList}
      items={selectListItems}
      itemSize={35}
      headersDummy={9}
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
          {active}
        />
      </div>
    </NavigateList>
  </div>
{/if}

<style lang="less">
  .horizontal-list {
    display: block;
    position: absolute;
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
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
    transition: transform 0.3s;
  }

  .select-list {
    display: flex;
    position: absolute;
    justify-content: center;
    vertical-align: center;
    align-items: center;
    top: 0;
    right: -300px;
    width: 300px;
    height: 100%;
    overflow: hidden;
    opacity: 0;
    background: rgba(0, 212, 255, 30%);
    transition: opacity 0.2s ease, right 0.2s ease;

    &.open {
      right: 0;
      opacity: 1;
    }

    &:before {
      position: absolute;
      display: block;
      content: '';
      top: -50px;
      left: 0;
      width: 100%;
      height: calc(100% + 100px);
      box-shadow: inset 0 0 50px 0 rgba(255,255,255, 30%);
    }
  }
</style>