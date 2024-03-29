<script lang="ts" context="module">
</script>
<script lang="ts">
  import _ from 'lodash';
  import {onDestroy, onMount, tick} from 'svelte';
  import Menu, {type MenuItem} from '../modules/menu';
  import {KeyboardKey, KeyboardPressEvent} from '../modules/keyboard';
  import NavigateList from '../components/list/NavigateList.svelte';
  import ListPreloader from '../components/list/ListPreloader.svelte';
  import SelectItem from './items/SelectItem.svelte';
  import {ValueLabels, type ValueType} from '../modules/value';
  import GameItem from './items/GameItem.svelte';
  import Animate from '../modules/animate';
  import List from '../components/list/List.svelte';
  import {StickerType} from './stickers';

  export let openPopupRunGame: (model: MenuItem) => void;
  export let closePopupRunGame: () => void;

  let isPopupRunGame: boolean = false;

  export let style: string = '';

  let horizontalList: List;
  let verticalList: ListPreloader[] = [];

  let innerList: ListPreloader;
  let innerListItem: MenuItem;
  let isInnerList: boolean = false;

  let selectList: List;
  let selectListHeight: number = 0;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[];

  let categoriesDelta: number = 0;
  let paddingLeftCategories: number = -Menu.ROOT_ITEM_HEIGHT;
  let timeout: any;

  let animate: Animate = new Animate();
  animate.setOffset(0);
  animate.subscribe((value: number) => {
    horizontalList?.scrollTo(value);
    categoriesDelta = value - ((horizontalList?.getIndex?.() || 0) * Menu.ROOT_ITEM_WIDTH);
  });

  const menu: Menu = new Menu();
  const items: MenuItem[] = menu.getItems();

  function keyRight() {
    if (horizontalList.hasRight()) {
      horizontalList.changeDirection(true);
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      animate.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const nextList: ListPreloader = verticalList[menu.getCategoryInstanceIndex(2)];
      const nextItem: MenuItem = menu.getFocusedLevel(1).next();

      if (nextItem && nextList && nextList.getModel() !== nextItem) {
        nextList.changeList(nextItem);
      }
    }
  }

  function keyLeft() {
    if (horizontalList.hasLeft()) {
      horizontalList.changeDirection(false);
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      categories = menu.getCategories();
      animate.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

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
        if (selectListItems) {
          if (ValueLabels.GAME === item.template) {
            const value: ValueType = selectList.getItem();
            item.value.setValue(value.value);

            if ('run' === value.value) {
              openPopupRunGame(item);
              isPopupRunGame = true;
            }

            return;
          }
        } else {
          selectListItems = item.value.getList();

          tick().then(() => {
            const index: number = item.value.getIndexValue();
            selectList.changeIndex(index);
            isSelectList = true;
          });
        }
      }
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      if (isSelectList) {
        isSelectList = false;

        tick().then(() => {
          timeout = setTimeout(() => {
            selectListItems = undefined;
            timeout = undefined;

            if (isPopupRunGame) {
              closePopupRunGame();
              isPopupRunGame = false;
            }
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
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  });
</script>

<div class="content" style="{style}">
  <div class="horizontal-list" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList}>
    <List
      bind:this={horizontalList}
      {items}
      horizontal={true}
      itemSpace={50}
      itemCenter={true}
      paddingIndent={-50}
      extendItemClass="horizontal-item"
    />
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
        paddingIndent={0}
        itemCenter={false}
        horizontal={false}
        itemSize={Menu.ITEM_HEIGHT}
        itemSpace={Menu.ROOT_ITEM_HEIGHT}
        extendItemClass="vertical-item"
        type={StickerType.ITEM}
      />
    {/each}
  </div>

  {#if innerListItem}
    {@const isGames = (ValueLabels.GAME === innerListItem.template || ValueLabels.MANAGE === innerListItem.template)}

    <div class="inner-list" class:list-only-active={isSelectList}>
      <ListPreloader
        bind:this={innerList}
        current={isInnerList}
        model={innerListItem}
        delta={categoriesDelta}
        headersDummy={isGames ? 2 : 3}
        paddingIndent={isGames ? -38 : -100}
        itemSize={Menu.ITEM_HEIGHT}
        itemSpace={isGames ? 100 : 50}
        itemCenter={true}
        horizontal={false}
        extendItemClass="vertical-item"
        type={isGames ? StickerType.GAME : StickerType.ITEM}
      />
    </div>
  {/if}

  {#if selectListItems}
    <div class="select-list" class:open={isSelectList}>
      <List
        bind:this={selectList}
        items={selectListItems}
        paddingIndent={-22}
        headersDummy={9}
        itemSize={35}
        itemSpace={15}
        horizontal={false}
        itemCenter={true}
        extendItemClass="vertical-item"
        type={StickerType.SELECT}
      />
    </div>
  {/if}
</div>

<style lang="less">
  .content {
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s;
    opacity: 1;
  }

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
      box-shadow: inset 0 0 50px 0 rgba(255, 255, 255, 30%);
    }
  }
</style>