<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import Menu, {type MenuItem} from '../../modules/menu';
  import List from '../../components/list/List.svelte';
  import Value, {ValueLabels, type ValueType, ValueTypes} from '../../modules/value';
  import Loader from '../Loader.svelte';
  import FormData, {GameOperation} from '../../models/form-data';
  import type {ItemType} from '../../../../server/modules/repositories';
  import {PopupNames} from '../../modules/popup';

  type HistoryItem = {
    index: number,
    item: ItemType,
    items: ItemType[],
  };

  let list: List;
  let data: ItemType[] = undefined;

  let history: HistoryItem[] = [];

  const formData: FormData<MenuItem> = window.$app.getPopup().getData();

  const value: Value = new Value({
    value: 'select',
    labels: ValueLabels.FILE_MANAGER,
    type: ValueTypes.SELECT,
  });
  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[] = [];
  let loading: boolean = true;

  function addHistory(): void {
    history.push({
      index: list.getIndex(),
      item: list.getItem(),
      items: [...data],
    });
  }

  function backHistory(): boolean {
    if (history.length > 0) {
      const last: HistoryItem = history.pop();
      data = last.items;
      list.changeIndex(last.index);

      return true;
    }

    return false;
  }

  function getTitle(data?: any): string {
    const names: string[] = [];

    for (const item of history) {
      names.push(item.item.name);
    }

    return names.join(' / ');
  }

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
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
      const item: ItemType = list?.getItem();

      if (!item) {
        return;
      }

      if ('repository' === item.type) {
        addHistory();

        loading = true;

        window.$app.getApi().getRepositories().getListByName(item.name).then((items: ItemType[]) => {
          data = items;
          list.changeIndex(0);
          loading = false;
        });

        return;
      }

      if ('dir' === item.type) {
        addHistory();
        data = item.items;
        list.changeIndex(0);

        return;
      }

      if (isSelectList) {
        const select: ValueType = selectList.getItem();

        switch (select.value) {
          case 'install':
            formData.setOperation(GameOperation.RUNNER_INSTALL);
            window.$app.getPopup().open(PopupNames.EXECUTING, formData, item);
            break;
        }

        return;
      }

      selectListItems = value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'install':
            return true;
        }

        return false;
      });
      isSelectList = true;
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
      if (isSelectList) {
        isSelectList = false;
        return;
      }

      if (!backHistory()) {
        unbindEvents();
        window.$app.getPopup().back();
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

    window.$app.getApi().getRepositories().getList().then((items: ItemType[]) => {
      data = items;
      loading = false;
    });
  });

  onDestroy(async () => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left">
      {getTitle(data)}
    </div>
    <div class="right">
      Runner repositories
    </div>
  </div>
  <div class="content">
    <div class="center">
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
          type={StickerType.RUNTIME}
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
      font-weight: 100;
      font-size: 16px;
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
  }
</style>