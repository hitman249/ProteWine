<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import List from '../../components/list/List.svelte';
  import Value, {ValueLabels, type ValueType, ValueTypes} from '../../modules/value';
  import Loader from '../Loader.svelte';
  import FormData, {GameOperation} from '../../models/form-data';
  import Image from '../../models/image';
  import {PopupNames} from '../../modules/popup';
  import type {ImageType} from '../../../../server/modules/gallery';

  const ITEM_SIZE: number = 280;

  let list: List;
  let data: Image[] = undefined;

  const formData: FormData<Image> = window.$app.getPopup().getData();

  const value: Value = new Value({
    value: 'select',
    labels: ValueLabels.FILE_MANAGER,
    type: ValueTypes.SELECT,
  });
  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[] = [];
  let loading: boolean = true;

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.LEFT === key) {
      if (isSelectList) {
        isSelectList = false;
        return;
      }

      list?.keyLeft();

      return;
    }

    if (KeyboardKey.RIGHT === key) {
      if (isSelectList) {
        return;
      }

      list?.keyRight();

      return;
    }

    if (KeyboardKey.DOWN === key && list) {
      if (isSelectList) {
        selectList?.keyDown();
      }

      return;
    }

    if (KeyboardKey.UP === key && list) {
      if (isSelectList) {
        selectList?.keyUp();
      }

      return;
    }

    if ((KeyboardKey.ENTER === key) && list) {
      const item: Image = list?.getItem();

      if (!item) {
        return;
      }

      if (isSelectList) {
        const select: ValueType = selectList.getItem();

        switch (select.value) {
          case 'import':
            unbindEvents();
            formData.runCallback(item);
            window.$app.getPopup().back();

            break;
        }

        return;
      }

      if (item.isFile()) {
        unbindEvents();
        formData.setOperation(GameOperation.SELECT_IMAGE);
        formData.setAdditionalData(item);
        window.$app.getPopup().open(PopupNames.FILE_MANAGER, formData).clearHistory();
        return;
      }

      selectListItems = value.getList().filter((value: ValueType) => {
        switch (value.value) {
          case 'import':
            return true;
        }

        return false;
      });

      isSelectList = true;
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      if (isSelectList) {
        isSelectList = false;
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

  onMount(() => {
    bindEvents();

    const type: 'poster' | 'icon' = window.$app.getPopup().getArguments();
    const title: string = formData.getData().title;

    const promise: Promise<ImageType[]> = 'icon' === type
      ? window.$app.getApi().getGallery().findIcons(title)
      : window.$app.getApi().getGallery().findPortraits(title);

    promise.then((images: Image[]) => {
      data = [new Image({type: 'file', url: '', thumb: ''}), ...images];
      loading = false;
    });
  });

  onDestroy(async () => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left"></div>
    <div class="right">
      Gallery
    </div>
  </div>
  <div class="content" class:active={isSelectList}>
    {#if data}
      <div class="empty-folder" style:opacity={data.length > 0 ? 0 : 1}>
        Images not found
      </div>

      <List
        bind:this={list}
        items={data}
        headersDummy={Math.trunc(window.innerWidth / ITEM_SIZE / 2) + 1}
        paddingIndent={-(ITEM_SIZE / 2 + 260)}
        marginIndent={(window.innerHeight / 2) - 200}
        itemSize={ITEM_SIZE}
        itemSpace={80}
        itemCenter={true}
        horizontal={true}
        extendItemClass="horizontal-item"
        type={StickerType.IMAGE}
        style="opacity: {data.length > 0 ? 1 : 0};"
      />
    {/if}
  </div>
  <div class="footer">
    {#if loading}
      <Loader style="margin-top: 10px;" />
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
    }

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