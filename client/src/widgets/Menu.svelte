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
  let horizontalListPosition: number = 0;
  let verticalList: ListPreloader[] = [];

  let innerList: ListPreloader;
  let innerListItem: MenuItem;
  let isInnerList: boolean = false;

  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[];

  let timeout: any;

  let animate: Animate = new Animate();
  animate.setOffset(0);
  animate.subscribe((value: number) => {
    horizontalList?.scrollTo(value);
  });

  const menu: Menu = new Menu();
  let items: MenuItem[] = menu.getItems();

  export function getMenu(): Menu {
    return menu;
  }

  function keyRight() {
    if (horizontalList.hasRight()) {
      horizontalList.setDirection(true);
      horizontalList.setIndex(horizontalList.getIndex() + 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      animate.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const list: ListPreloader = verticalList[horizontalList.getIndex()];

      if (list) {
        list.getItem()?.updateFocusedItem();
      }
    }
  }

  function keyLeft() {
    if (horizontalList.hasLeft()) {
      horizontalList.setDirection(false);
      horizontalList.setIndex(horizontalList.getIndex() - 1);
      menu.setCurrentIndex(horizontalList.getIndex());
      animate.set(horizontalList.getIndex() * Menu.ROOT_ITEM_WIDTH);

      const list: ListPreloader = verticalList[horizontalList.getIndex()];

      if (list) {
        list.getItem()?.updateFocusedItem();
      }
    }
  }

  function onScroll(position: number, activeIndex: number): void {
    horizontalListPosition = position;
  }

  export async function updateWineVersion(): Promise<void> {
    const version: string = await window.$app.getApi().getKernel().version();
    menu.setWineVersion(version);

    const list: ListPreloader = verticalList[1];

    if (list) {
      list.update();
    }
  }

  export async function updateLayerCount(): Promise<void> {
    await menu.updateLayerCount();
    items = items;
  }

  async function openSelect(item: MenuItem): Promise<void> {
    if (ValueLabels.MANAGE === item.template) {
      const config: Config = item.item;

      selectListItems = item.value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'desktop-link':
            if (0 < config.desktopIcons.length) {
              return false;
            }

            break;

          case 'remove-desktop-link':
            if (0 === config.desktopIcons.length) {
              return false;
            }

            break;

          case 'menu-link':
            if (0 < config.menuIcons.length) {
              return false;
            }

            break;

          case 'remove-menu-link':
            if (0 === config.menuIcons.length) {
              return false;
            }

            break;

          case 'steam-link':
            if (config.steamIcons) {
              return false;
            }

            break;
          case 'remove-steam-link':
            if (!config.steamIcons) {
              return false;
            }

            break;
        }

        return true;
      });
    } else if ('update' === item.item?.type) {
      selectListItems = item.value.getList().filter((value: ValueType) => 'install' === value.value);
    } else if ('layers' === item.item?.type) {
      const isDbExist: boolean = await window.$app.getApi().getLayers().dbExist(item.id);

      selectListItems = item.value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'enable':
            return !Boolean(item.item?.active);
          case 'disable':
            return Boolean(item.item?.active);
          case 'add-db':
            return !isDbExist;
          case 'remove-db':
            return isDbExist;
          default:
            return true;
        }
      });
    } else if ('layers-add' === item.id) {
      const isProcessed: boolean = await window.$app.getApi().getLayers().isProcessed();

      selectListItems = item.value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'create':
            return !isProcessed;
          case 'save':
            return isProcessed;
          case 'cancel':
            return isProcessed;
        }
      });
    } else {
      selectListItems = item.value.getList();
    }

    tick().then(() => {
      if ('layers-add' === item.id || 'layers' === item.item?.type) {
        selectList.changeIndex(0);
      } else {
        const index: number = item.value.getIndexValue();
        selectList.changeIndex(index);
      }

      isSelectList = true;
    });
  }

  function closeSelect(): void {
    isSelectList = false;

    tick().then(() => {
      timeout = setTimeout(() => {
        selectListItems = undefined;
        timeout = undefined;
      }, 200);
    });
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

      const list: ListPreloader = verticalList[horizontalList.getIndex()];

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

      const list: ListPreloader = verticalList[horizontalList.getIndex()];

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
        const item: MenuItem = menu.getFocusedItem();

        if (ValueLabels.OPERATION === item.template) {
          key = KeyboardKey.ENTER;
        } else {
          if (isInnerList && !isSelectList) {
            if (!item?.value) {
              return;
            }

            await openSelect(item);
          }

          return;
        }
      } else {
        keyRight();
      }
    }

    if (KeyboardKey.ENTER === key) {
      const list: ListPreloader = verticalList[horizontalList.getIndex()];

      if (!list || !list.getItem()) {
        return;
      }

      const item: MenuItem = menu.getFocusedItem();
      const formData: FormData<MenuItem> = new FormData(item);

      if (item?.popup) {
        const blockExit: boolean = 'config' === item.id;



        if (PopupNames.DATABASE === item?.popup) {
          formData.setCallback(() => updateLayerCount());
        } else {
          formData.setCallback(() => updateWineVersion());
        }

        popup.open(item?.popup, formData, {blockExit, menu});

        if ('config' === item.id) {
          await window.$app.getApi().getKernel().config();
        }

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

          if (-1 !== menu.getPluginsKeys().indexOf(item.id)) {
            await window.$app.getApi().getSettings().set(item.id, value.value);
            menu.clearPrefixPlugins();
            await innerListItem.reload();
            innerListItem = innerListItem;

            closeSelect();

            formData.setOperation(GameOperation.DEBUG);
            popup.open(PopupNames.EXECUTING, formData);

            window.$app.getApi().getPlugins().install().then(() => {
              if (popup.isOpen(PopupNames.EXECUTING)) {
                popup.back();
              }
            });

            return;
          }

          if ('reset' === item.id) {
            switch (value.value) {
              case true:
                if (isSelectList) {
                  closeSelect();
                }

                window.$app.getApi().getPrefix().refresh().then(() => undefined);
                formData.setOperation(GameOperation.PREFIX);
                popup.open(PopupNames.EXECUTING, formData);
                break;

              case false:
                if (isSelectList) {
                  closeSelect();
                }

                break;
            }
          }

          if ('exit' === item.id) {
            switch (value.value) {
              case true:
                if (isSelectList) {
                  closeSelect();
                }

                await window.$app.getApi().getSystem().appExit();
                break;

              case false:
                if (isSelectList) {
                  closeSelect();
                }

                break;
            }
          }

          if ('layers-add' === item.id) {
            switch (value.value) {
              case 'create':
                popup.open(PopupNames.EXECUTING, formData);
                window.$app.getApi().getLayers().layerBefore().then(() => {});

                break;

              case 'save':
                popup.open(PopupNames.EXECUTING, formData);
                window.$app.getApi().getLayers().layerAfter().then(async () => {
                  menu.clearLayers();
                  await updateLayerCount();
                });

                break;
              case 'cancel':
                await window.$app.getApi().getLayers().cancel();
                break;
            }

            closeSelect();

            return;
          }

          if ('layers' === item.item?.type) {
            switch (value.value) {
              case 'title':
                formData.setCallback(async (text: string) => {
                  await window.$app.getApi().getLayers().updateTitle(item.id, text);
                  menu.clearLayers();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });

                popup.open(PopupNames.INPUT, formData, {
                  title: 'Title',
                  value: item.title,
                });
                break;

              case 'add-db':
                await window.$app.getApi().getLayers().dbAdd(item.id);
                menu.clearLayers();
                await innerListItem.reload();
                innerListItem = innerListItem;

                break;

              case 'remove-db':
                await window.$app.getApi().getLayers().dbRemove(item.id);
                menu.clearLayers();
                await innerListItem.reload();
                innerListItem = innerListItem;

                break;

              case 'enable':
                await window.$app.getApi().getLayers().updateActive(item.id, true);
                menu.clearLayers();
                await innerListItem.reload();
                innerListItem = innerListItem;

                break;
              case 'disable':
                await window.$app.getApi().getLayers().updateActive(item.id, false);
                menu.clearLayers();
                await innerListItem.reload();
                innerListItem = innerListItem;

                break;

              case 'remove':
                formData.setCallback(async () => {
                  await window.$app.getApi().getLayers().remove(item.id);
                  menu.clearLayers();
                  innerListItem.setCurrentIndex(0);
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                  await updateLayerCount();
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: `Remove "${item.title}"?`,
                  description: `To delete "${item.title}" press the confirmation button.`,
                });
                break;
            }

            closeSelect();

            return;
          }

          if ('update' === item.item?.type) {
            popup.open(PopupNames.EXECUTING, formData);
            window.$app.getApi().getUpdate().update(item.id).then(async () => {
              menu.clearUpdates();

              const model: MenuItem = items[horizontalList.getIndex()];

              if (model) {
                await model.reload();
              }

              items = items;

              closeSelect();

              if (popup.isOpen(PopupNames.EXECUTING)) {
                popup.back();
              }
            });
          }

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
              case 'settings':
                popup.open(PopupNames.CONFIG, formData);
                break;

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

              case 'desktop-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().createIcon(item.id, false);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Creating desktop link',
                  description: `To create an "${item.title}" link on desktop, press the confirmation button`,
                });
                closeSelect();
                break;

              case 'remove-desktop-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().removeIcon(item.id, false);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Removing desktop link',
                  description: `To remove an "${item.title}" link on desktop, press the confirmation button`,
                });
                closeSelect();
                break;

              case 'menu-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().createIcon(item.id, true);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Creating system menu link',
                  description: `To create an "${item.title}" link on system menu, press the confirmation button`,
                });
                closeSelect();
                break;

              case 'remove-menu-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().removeIcon(item.id, true);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Removing system menu link',
                  description: `To remove an "${item.title}" link on system menu, press the confirmation button`,
                });
                closeSelect();
                break;

              case 'steam-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().createSteamIcon(item.id);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Creating Steam link',
                  description: `To create an "${item.title}" link on Steam, press the confirmation button`,
                });
                closeSelect();
                break;

              case 'remove-steam-link':
                formData.setCallback(async () => {
                  await window.$app.getApi().getGames().removeSteamIcon(item.id);
                  menu.clearGames();
                  await innerListItem.reload();
                  innerListItem = innerListItem;
                });
                popup.open(PopupNames.YES_NO, formData, {
                  title: 'Removing Steam link',
                  description: `To remove an "${item.title}" link on Steam, press the confirmation button`,
                });
                closeSelect();
                break;
            }
          }
        } else {
          await openSelect(item);
        }
      } else {
        if (ValueLabels.OPERATION === item.template) {
          const operation: GameOperation = item.id as any;

          formData.setOperation(operation);

          if (GameOperation.IMPORT_LINK === operation) {
            popup.open(PopupNames.FIND_LINKS, formData);
          } else if (GameOperation.WINETRICKS === operation) {
            popup.open(PopupNames.WINETRICKS, formData);
          } else {
            formData.setFileManagerExecutable(true);
            popup.open(PopupNames.FILE_MANAGER, formData);
          }

          return;
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
    updateWineVersion();
    horizontalListPosition = -1;
    updateLayerCount();
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

  <div class="vertical-lists" class:list-move-to-left={isInnerList} class:list-only-active={isSelectList} class:animate-items-opacity={selectListItems}>
    {#if horizontalList}
      {#each items as item, index}
        {@const state = horizontalList?.getPositionByIndex(index + 1, horizontalListPosition)}

        <ListPreloader
          bind:this={verticalList[index]}
          model={item}
          left={state ? state.position - 40 : 0}
          style="opacity: {state ? state.percent / 100 : 0};"
          current={state ? state.active : false}
          delta={-50}
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
    {/if}
  </div>

  {#if innerListItem}
    {@const isGames = (ValueLabels.GAME === innerListItem.template || ValueLabels.MANAGE === innerListItem.template)}
    {@const isOperation = (ValueLabels.OPERATION === innerListItem.template)}

    <div class="inner-list" class:list-only-active={isSelectList} class:animate-items-opacity={selectListItems}>
      <ListPreloader
        bind:this={innerList}
        current={isInnerList}
        model={innerListItem}
        delta={0}
        headersDummy={isGames ? 2 : 3}
        paddingIndent={isGames ? -38 : -100}
        itemSize={Menu.ITEM_HEIGHT}
        itemSpace={isGames ? 100 : 50}
        itemCenter={true}
        horizontal={false}
        extendItemClass="vertical-item"
        type={isGames ? StickerType.GAME : (isOperation ? StickerType.OPERATION : StickerType.ITEM)}
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