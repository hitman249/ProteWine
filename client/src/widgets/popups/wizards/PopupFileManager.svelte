<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../../modules/keyboard';
  import _ from 'lodash';
  import Menu from '../../../modules/menu';
  import List from '../../../components/list/List.svelte';
  import File from '../../../models/File';

  let list: List;
  let data: File[] = undefined;
  let currentPath: string = '';
  let pathIndices: {[path: string]: number} = {};

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key && list) {
      list.keyDown();
      pathIndices[currentPath] = list.getIndex();
    }

    if (KeyboardKey.UP === key && list) {
      list.keyUp();
      pathIndices[currentPath] = list.getIndex();
    }

    if (KeyboardKey.ENTER === key) {
      const item: File = list?.getItem();

      if (!item || !item.isDirectory()) {
        return;
      }

      window.$app.getApi().getFileSystemLs(item.path).then((files: File[]) => {
        currentPath = item.path;
        list.changeIndex(pathIndices?.[currentPath] || 0);
        data = files;
      });
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
      const path: string[] = currentPath.split('/').slice(0, -1);

      if (path.length === 0) {
        window.$app.getPopup().close();
        return;
      }

      currentPath = path.join('/');

      (currentPath ? window.$app.getApi().getFileSystemLs(currentPath) : window.$app.getApi().getFileSystemStorages())
        .then((files: File[]) => {
          list.changeIndex(pathIndices?.[currentPath] || 0);
          data = files;
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
    <div class="right">File Manager</div>
  </div>
  <div class="content">
    <div class="center">
      {#if data}
        <List
          bind:this={list}
          items={data}
          headersDummy={2}
          paddingIndent={-50}
          itemSize={Menu.ITEM_HEIGHT}
          itemSpace={40}
          itemCenter={true}
          horizontal={false}
          extendItemClass="vertical-item"
          type={StickerType.FILE}
        />
      {/if}
    </div>
  </div>
  <div class="footer"></div>
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
      }
    }
  }
</style>