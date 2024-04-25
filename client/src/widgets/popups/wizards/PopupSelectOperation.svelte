<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../../stickers';
  import List from '../../../components/list/List.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../../modules/keyboard';
  import {PopupNames} from '../../../modules/popup';
  import FormData, {GameOperation} from '../../../models/form-data';
  import type {ValueType} from '../../../modules/value';
  import Menu, {type MenuItem} from '../../../modules/menu';

  let list: List;
  const data: FormData<MenuItem> = window.$app.getPopup().getData();

  const items: ValueType[] = [
    {
      value: GameOperation.INSTALL_FILE,
      title: 'Install file',
    },
    {
      value: GameOperation.INSTALL_IMAGE,
      title: 'Install file from disk image',
    },
    {
      value: GameOperation.COPY_GAME,
      title: 'Copy existing game folder',
    },
    {
      value: GameOperation.MOVE_GAME,
      title: 'Move existing game folder',
    },
    {
      value: GameOperation.SYMLINK_GAME,
      title: 'Symlink to an existing game folder',
    },
    {
      value: GameOperation.IMPORT_LINK,
      title: 'Import game link from *.lnk file',
    },
    {
      value: GameOperation.WINETRICKS,
      title: 'Winetricks',
    },
  ];

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      list?.keyDown();
    }

    if (KeyboardKey.UP === key) {
      list?.keyUp();
    }

    if (KeyboardKey.ENTER === key || KeyboardKey.RIGHT === key) {
      unbindEvents();
      data.setOperation(list?.getItem()?.value);
      data.setFileManagerExecutable(false);
      window.$app.getPopup().open(PopupNames.FILE_MANAGER, data);

      return;
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
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

    if (list) {
      let index: number;
      const operation: GameOperation = data.getOperation();

      for (let i: number = 0, max: number = items.length; i < max; i++) {
        if (operation === items[i].value) {
          index = i;
          break;
        }
      }

      if (undefined !== index) {
        list.changeIndex(index);
      }
    }
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    Install wizard
  </div>
  <div class="content">
    <div class="center">
      <List
        bind:this={list}
        {items}
        headersDummy={2}
        paddingIndent={-30}
        itemSize={Menu.ITEM_HEIGHT - 20}
        itemSpace={40}
        itemCenter={true}
        horizontal={false}
        extendItemClass="vertical-item"
        type={StickerType.OPERATION}
      />
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
        width: 600px;
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