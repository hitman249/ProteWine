<script lang="ts" context="module">
  let lastIndex: number = 0;
  let promise: Promise<any> = Promise.resolve();
</script>
<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import {StickerType} from '../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import Menu, {type MenuItem} from '../../modules/menu';
  import List from '../../components/list/List.svelte';
  import Value, {ValueLabels, type ValueType, ValueTypes} from '../../modules/value';
  import Loader from '../Loader.svelte';
  import FormData from '../../models/form-data';
  import type {LayerType} from '../../../../server/modules/layers/layer';
  import {PopupNames} from '../../modules/popup';

  let list: List;
  let data: LayerType[] = undefined;

  let input: HTMLInputElement;
  let inputValue: string = '';

  $: updatePosition(inputValue);

  const formData: FormData<MenuItem> = window.$app.getPopup().getData();
  const args: {menu: Menu} = window.$app.getPopup().getArguments();

  const value: Value = new Value({
    value: 'select',
    labels: ValueLabels.DB_LAYERS,
    type: ValueTypes.SELECT,
  });
  let timeout: any;
  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[] = undefined;
  let loading: boolean = true;

  function closeSelect(): void {
    isSelectList = false;

    tick().then(() => {
      timeout = setTimeout(() => {
        selectListItems = undefined;
        timeout = undefined;
      }, 200);
    });
  }

  function updatePosition(value: string): void {
    if (undefined === data || data.length === 0) {
      return;
    }

    const index: number = data.findIndex((item: LayerType) => 0 === item.title.indexOf(value));

    if (-1 !== index) {
      list?.changeIndex(index, true);
    }
  }

  function setEndCursor(): void {
    setTimeout(() => {
      const position: number = inputValue.length;
      input.setSelectionRange(position, position);
    }, 4);
  }

  const keyboardWatch = async (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key && list) {
      setEndCursor();

      if (isSelectList) {
        selectList?.keyDown();
        return;
      }

      list.keyDown();
    }

    if (KeyboardKey.UP === key && list) {
      setEndCursor();

      if (isSelectList) {
        selectList?.keyUp();
        return;
      }

      list.keyUp();
    }

    if ((KeyboardKey.ENTER === key) && list) {
      const item: LayerType = list?.getItem();

      if (!item) {
        return;
      }

      if (isSelectList) {
        const select: ValueType = selectList.getItem();

        switch (select.value) {
          case 'add-layers':
            await window.$app.getApi().getLayers().layerAdd(item.id);
            break;
          case 'remove-layers':
            await window.$app.getApi().getLayers().layerRemove(item.id);
            break;
          case 'db-remove':
            const formData: FormData<any> = new FormData();

            const index: number = list.getIndex();

            if ((index - 1) > 0) {
              lastIndex = (index - 1);
            } else {
              lastIndex = 0;
            }

            formData.setCallback(async () => {
              promise = window.$app.getApi().getLayers().dbRemove(item.id);
            });

            formData.setRejectCallback(async () => {
              lastIndex = index;
            });

            window.$app.getPopup().open(PopupNames.YES_NO, formData, {
              title: `Remove "${item.title}"?`,
              description: `To delete "${item.title}" press the confirmation button.`,
            });

            break;
        }

        args.menu.clearLayers();

        closeSelect();

        return;
      }

      const isExist: boolean = await window.$app.getApi().getLayers().exist(item.id);

      selectListItems = value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'add-layers':
            return !isExist;
          case 'remove-layers':
            return isExist;
        }

        return true;
      });

      tick().then(() => {
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

      if (KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
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

  onMount(async () => {
    bindEvents();
    input?.focus();
    window.$app.getApi().getNativeKeyboard().open().then(() => {});

    await promise;

    window.$app.getApi().getLayers().dbList().then((items: LayerType[]) => {
      data = items;
      loading = false;

      tick().then(() => {
        list.changeIndex(lastIndex);
      });
    });
  });

  onDestroy(() => {
    unbindEvents();
    formData.runCallback();
    window.$app.getApi().getNativeKeyboard().close();
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left"></div>
    <div class="right">
      Database
    </div>
  </div>
  <div class="content">
    <div class="input" style:opacity={isSelectList ? 0.4 : 1}>
      <div class="border">
        <input type="text" bind:this={input} bind:value={inputValue}>
      </div>
    </div>

    <div class="center" class:animate-items-opacity={selectListItems} class:hide-no-active-items={isSelectList}>
      {#if data}
        <List
          bind:this={list}
          items={data}
          headersDummy={Math.trunc((window.innerHeight - Menu.ITEM_HEIGHT - 88) / (Menu.ITEM_HEIGHT - 20) / 2) - 1}
          paddingIndent={-30}
          itemSize={Menu.ITEM_HEIGHT - 20}
          itemSpace={40}
          itemCenter={true}
          horizontal={false}
          extendItemClass="vertical-item"
          type={StickerType.LAYER}
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
        headersDummy={Math.trunc((window.innerHeight - 35) / 35 / 2)}
        paddingIndent={-32}
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
        width: 800px;
        height: calc(100% - 88px);
        position: absolute;
        margin: 88px auto auto;
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

    .input {
      position: relative;
      top: 30px;
      width: calc(100% - 200px);
      height: 53px;
      background-color: rgba(255, 255, 255, 70%);
      padding: 2px;
      border-radius: 9px;
      transition: opacity 0.3s;
    }

    .border {
      position: relative;
      background-color: rgba(0, 0, 0, 20%);
      padding: 1px;
      border-radius: 8px;
    }

    input {
      width: calc(100% - 30px);
      height: 50px;
      border-radius: 6px;
      padding: 0 15px;
      font-size: 20px;
      border-width: 0;
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