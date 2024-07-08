<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import {StickerType} from '../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import Menu, {MenuItem, type MenuItemType} from '../../modules/menu';
  import List from '../../components/list/List.svelte';
  import type {ValueType} from '../../modules/value';
  import Loader from '../Loader.svelte';
  import FormData from '../../models/form-data';

  let list: List;
  let data: MenuItem[] = undefined;

  const formData: FormData<MenuItem> = window.$app.getPopup().getData();
  const game: MenuItem = formData.getData();

  let timeout: any;
  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[] = undefined;
  let loading: boolean = true;

  const keyboardWatch = async (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key && list) {
      if (isSelectList) {
        selectList?.keyDown();
        return;
      }

      list.keyDown();
    }

    if (KeyboardKey.UP === key && list) {
      if (isSelectList) {
        selectList?.keyUp();
        return;
      }

      list.keyUp();
    }

    if (((KeyboardKey.ENTER === key) || (KeyboardKey.RIGHT === key)) && list) {
      const item: MenuItem = list?.getItem();

      if (!item) {
        return;
      }

      if (isSelectList) {
        const select: ValueType = selectList.getItem();

        await window.$app.getApi().getGames().updateConfig(game.id, item.id, select.value);
        await reload();

        isSelectList = false;

        tick().then(() => {
          timeout = setTimeout(() => {
            selectListItems = undefined;
            timeout = undefined;
          }, 200);
        });

        return;
      }


      selectListItems = item.value.getList();

      tick().then(() => {
        const index: number = item.value.getIndexValue();
        selectList.changeIndex(index);
        isSelectList = true;
      });
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
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

      unbindEvents();
      window.$app.getPopup().back();
    }
  };

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  function reload(): Promise<void> {
    return window.$app.getApi().getPlugins().getConfigs(game.id).then((items: MenuItemType[]) => {
      data = (items || []).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));
      loading = false;
    });
  }

  onMount(() => {
    bindEvents();
    reload();
  });

  onDestroy(async () => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left"></div>
    <div class="right">
      Settings
    </div>
  </div>
  <div class="content">
    <div class="center" class:animate-items-opacity={selectListItems} class:hide-no-active-items={isSelectList}>
      {#if data}
        <List
          bind:this={list}
          items={data}
          headersDummy={Math.trunc((window.innerHeight - Menu.ITEM_HEIGHT) / (Menu.ITEM_HEIGHT - 20) / 2) - 1}
          paddingIndent={-30}
          itemSize={Menu.ITEM_HEIGHT - 20}
          itemSpace={40}
          itemCenter={true}
          horizontal={false}
          extendItemClass="vertical-item"
          type={StickerType.ITEM}
          style="opacity: {data.length > 0 ? 1 : 0};"
        />

        <div class="empty-folder" style:opacity={data.length > 0 ? 0 : 1}>
          This folder is empty
        </div>
      {/if}
    </div>
  </div>
  <div class="footer">
    {#if loading}
      <Loader style="margin-top: 10px;"/>
    {/if}
  </div>

  {#if selectListItems}
    <div class="select-list" class:open={isSelectList}>
      <List
        bind:this={selectList}
        items={selectListItems}
        paddingIndent={-30}
        headersDummy={Math.trunc((window.innerHeight - 35) / 35 / 2)}
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
  .popup {
    color: #ffffff;
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    .header {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      height: 97px;
      width: calc(100% - 100px);
      top: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      border-bottom: rgb(255 255 255 / 80%) solid 1px;
      padding-bottom: 3px;
      font-weight: 400;
      font-size: 18px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);

      .left {
        display: flex;
        flex: 1;
        justify-content: start;
      }

      .right {
        display: flex;
        width: 250px;
        justify-content: end;
      }
    }

    .footer {
      display: flex;
      height: 100px;
      width: calc(100% - 100px);
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      border-top: rgb(255 255 255 / 80%) solid 1px;
      justify-content: end;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;

      .center {
        width: 1000px;
        height: 100%;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        .empty-folder {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
        }
      }
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
      background: #259efc;
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
  }
</style>