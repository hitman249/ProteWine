<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../../modules/keyboard';
  import Menu, {type MenuItem} from '../../../modules/menu';
  import List from '../../../components/list/List.svelte';
  import File from '../../../models/file';
  import Value, {ValueLabels, type ValueType, ValueTypes} from '../../../modules/value';
  import FormData, {FileManagerMode} from '../../../models/form-data';
  import Loader from '../../Loader.svelte';

  let list: List;
  let data: File[] = undefined;
  let currentPath: string = '';
  let pathIndices: {[path: string]: number} = {};

  const popupData: FormData<MenuItem> = window.$app.getPopup().getData();
  const mode: FileManagerMode = popupData.getFileManagerMode();

  const value: Value = new Value({
    value: 'select',
    labels: ValueLabels.FILE_MANAGER,
    type: ValueTypes.SELECT,
  });
  let selectList: List;
  let isSelectList: boolean = false;
  let selectListItems: ValueType[] = [];

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key && list) {
      if (isSelectList) {
        selectList?.keyDown();
        return;
      }

      list.keyDown();
      pathIndices[currentPath] = list.getIndex();
    }

    if (KeyboardKey.UP === key && list) {
      if (isSelectList) {
        selectList?.keyUp();
        return;
      }

      list.keyUp();
      pathIndices[currentPath] = list.getIndex();
    }

    if (KeyboardKey.ENTER === key) {
      const item: File = list?.getItem();

      if (item && item.isDirectory()) {
        window.$app.getApi().getFileSystemLs(item.path).then((files: File[]) => {
          currentPath = item.path;
          list.changeIndex(pathIndices?.[currentPath] || 0);
          data = files.filter((file: File) => {
            if (FileManagerMode.EXECUTABLE === mode) {
              return file.isDirectory() || file.isExecutable();
            } else if (FileManagerMode.DIRECTORY === mode) {
              return file.isDirectory();
            } else if (FileManagerMode.IMAGE === mode) {
              return file.isDirectory() || file.isDiskImage();
            }
          });
        });
      } else if (item && !item.isDirectory()) {
        key = KeyboardKey.RIGHT;
      }
    }

    if (KeyboardKey.RIGHT === key && list) {
      if (isSelectList) {
        return;
      }

      const item: File = list?.getItem();

      if (!item) {
        return;
      }

      selectListItems = value.getList().filter((value: ValueType) => {
        if ('execute' === value.value) {
          return item.isExecutable();
        }

        return true;
      });
      isSelectList = true;
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
      if (isSelectList) {
        isSelectList = false;
        return;
      }

      const path: string[] = currentPath.split('/').slice(0, -1);

      if (path.length === 0) {
        window.$app.getPopup().back();
        return;
      }

      currentPath = path.join('/');

      (currentPath ? window.$app.getApi().getFileSystemLs(currentPath) : window.$app.getApi().getFileSystemStorages())
        .then((files: File[]) => {
          list.changeIndex(pathIndices?.[currentPath] || 0);
          data = files.filter((file: File) => {
            if (FileManagerMode.EXECUTABLE === mode) {
              return file.isDirectory() || file.isExecutable();
            } else if (FileManagerMode.DIRECTORY === mode) {
              return file.isDirectory();
            } else if (FileManagerMode.IMAGE === mode) {
              return file.isDirectory() || file.isDiskImage();
            }
          });
        });
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
    window.$app.getApi().getFileSystemStorages().then((files: File[]) => data = files);
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left">{currentPath}</div>
    <div class="right">
      {#if FileManagerMode.EXECUTABLE === mode}
        Select installation file
      {:else if FileManagerMode.DIRECTORY === mode}
        Select the game folder
      {:else if FileManagerMode.IMAGE === mode}
        Select disk image
      {:else}
        File Manager
      {/if}
    </div>
  </div>
  <div class="content">
    <div class="center">
      {#if data}
        <List
          bind:this={list}
          items={data}
          headersDummy={2}
          paddingIndent={-30}
          itemSize={Menu.ITEM_HEIGHT - 20}
          itemSpace={40}
          itemCenter={true}
          horizontal={false}
          extendItemClass="vertical-item"
          type={StickerType.FILE}
          style="opacity: {data.length > 0 ? 1 : 0};"
        />

        <div class="empty-folder" style:opacity={data.length > 0 ? 0 : 1}>
          This folder is empty
        </div>
      {/if}
    </div>
  </div>
  <div class="footer">
    <Loader/>
  </div>

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
      padding-top: 10px;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;

      .center {
        width: calc(100% - 300px);
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
        top: -50px;
        left: 0;
        width: 100%;
        height: calc(100% + 100px);
        box-shadow: inset 0 0 50px 0 rgba(255, 255, 255, 30%);
      }
    }
  }
</style>