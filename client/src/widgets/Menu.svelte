<script lang="ts" context="module">
</script>
<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import Menu, {type MenuItem, type MenuItemType} from '../modules/menu';
  import {KeyboardKey, KeyboardPressEvent} from '../modules/keyboard';
  import ListPreloader from '../components/list/ListPreloader.svelte';
  import {ValueLabels, type ValueType} from '../modules/value';
  import Animate from '../modules/animate';
  import List from '../components/list/List.svelte';
  import {StickerType} from './stickers';
  import Popup, {PopupNames} from '../modules/popup';
  import FormData, {GameOperation} from '../models/form-data';
  import type Image from '../models/image';
  import type File from '../models/file';
  import type Config from '../models/config';

  export let popup: Popup;
  export let style: string = '';

  let horizontalList: List;
  let verticalList: ListPreloader[] = [];
  let verticalListActiveIndex: number = 0;

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
    categoriesDelta = value - ((verticalListActiveIndex || 0) * Menu.ROOT_ITEM_WIDTH);
  });

  const menu: Menu = new Menu();
  const items: MenuItem[] = menu.getItems();
  let categories: MenuItem[] = menu.getCategories(verticalListActiveIndex);

  export function getMenu(): Menu {
    return menu;
  }

  function keyRight() {
    if (horizontalList.hasRight()) {
      horizontalList.setDirection(true);
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
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
      horizontalList.setDirection(false);
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      animate.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const prevList: ListPreloader = verticalList[menu.getCategoryInstanceIndex(0)];
      const prevItem: MenuItem = menu.getFocusedLevel(1).prev();

      if (prevItem && prevList && prevList.getModel() !== prevItem) {
        prevList.changeList(prevItem);
      }
    }
  }

  function onScroll(position: number, activeIndex: number): void {
    if (verticalListActiveIndex !== activeIndex) {
      verticalListActiveIndex = activeIndex;
      categories = menu.getCategories(activeIndex);
    }
  }

  const keyboardWatch = async (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
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
        if (isInnerList && !isSelectList) {
          const item: MenuItem = menu.getFocusedItem();

          if (!item?.value) {
            return;
          }

          selectListItems = item.value.getList();

          tick().then(() => {
            const index: number = item.value.getIndexValue();
            selectList.changeIndex(index);
            isSelectList = true;
          });
        }

        return;
      } else {
        keyRight();
      }
    }

    if (KeyboardKey.ENTER === key) {
      const item: MenuItem = menu.getFocusedItem();

      if (item?.popup) {
        const data: FormData<MenuItem> = new FormData(item);
        popup.open(item?.popup, data);

        return;
      } else if (item?.hasItems()) {
        if (timeout) {
          clearTimeout(timeout);
        }

        innerListItem = item;
        isInnerList = true;
      } else if (item.value) {
        if (selectListItems) {
          let config: Config;

          const value: ValueType = selectList.getItem();
          item.value.setValue(value.value);

          const formData: FormData<MenuItem> = new FormData(item);

          if (ValueLabels.GAME === item.template) {
            switch (value.value) {
              case 'run':
                popup.open(PopupNames.RUN_GAME, formData);
                break;

              case 'debug':
                formData.setOperation(GameOperation.DEBUG);
                popup.open(PopupNames.EXECUTING, formData);
                break;

              case 'info':
                popup.open(PopupNames.INFO, formData);
                break;
            }

            return;
          }

          if (ValueLabels.MANAGE === item.template) {
            switch (value.value) {
              case 'change-poster':
                formData.setCallback(async (image: Image) => {
                  await window.$app.getApi().getGames().updateImage(image, item.id, 'poster');
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.GALLERY, formData, 'poster');
                break;

              case 'change-icon':
                formData.setCallback(async (image: Image) => {
                  await window.$app.getApi().getGames().updateImage(image, item.id, 'icon');
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.GALLERY, formData, 'icon');
                break;

              case 'change-exe':
                formData.setCallback(async (file: File) => {
                  await window.$app.getApi().getGames().updateExe(item.id, file.getPath());
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                formData.setFileManagerExecutable(true);
                formData.setOperation(GameOperation.SELECT_EXE);
                formData.setFileManagerRootPath(await window.$app.getApi().getAppFolders().getGamesDir());
                popup.open(PopupNames.FILE_MANAGER, formData);
                break;

              case 'change-arguments':
                formData.setCallback(async (text: string) => {
                  await window.$app.getApi().getGames().updateArguments(item.id, text);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });

                config = await window.$app.getApi().getGames().getById(item.id);

                popup.open(PopupNames.INPUT, formData, {
                  title: 'Arguments',
                  value: config.arguments,
                });
                break;

              case 'change-title':
                formData.setCallback(async (text: string) => {
                  await window.$app.getApi().getGames().updateTitle(item.id, text);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });

                config = await window.$app.getApi().getGames().getById(item.id);

                popup.open(PopupNames.INPUT, formData, {
                  title: 'Title',
                  value: config.title,
                });
                break;

              case 'remove-game':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().removeById(item.id);
                  menu.clearGames();
                  innerListItem.setCurrentIndex(0);
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Remove game link',
                  description: `To delete the game link "${item.title}" press the confirmation button.`,
                });
                break;
            }
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

            if (popup.isOpen(PopupNames.RUN_GAME)) {
              popup.back();
            }
          }, 200);
        });
        return;
      }

      if (popup.isOpen()) {
        popup.back();
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
  };

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  onMount(() => {
    bindEvents();
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="content" style="{style}">
  <div class="horizontal-list" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList} class:active={isSelectList}>
    <List
      bind:this={horizontalList}
      {items}
      {onScroll}
      horizontal={true}
      itemSpace={50}
      itemCenter={true}
      paddingIndent={-50}
      extendItemClass="horizontal-item"
    />
  </div>

  <div class="vertical-lists" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList}>
    {#each categories as item, index}
      {@const current = item?.isActive(verticalListActiveIndex)}
      {@const left = (((item?.getStackIndex(verticalListActiveIndex) || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

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
        paddingIndent={-40}
        headersDummy={9}
        itemSize={35}
        itemSpace={30}
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
    z-index: 2;

    &.open {
      right: 0;
      opacity: 1;
    }

    &:before {
      position: absolute;
      display: block;
      content: '';
      top: 0;
      left: 0;
      width: 30px;
      height: 100%;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 0, 0) 100%);
    }
    &:after {
      position: absolute;
      display: block;
      content: '';
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 0, 0, 0) 100%);
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-right: transparent;
    }
  }
</style>