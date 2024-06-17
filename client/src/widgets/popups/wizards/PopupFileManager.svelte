<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {StickerType} from '../../stickers';
  import {KeyboardKey, KeyboardPressEvent} from '../../../modules/keyboard';
  import Menu, {type MenuItem} from '../../../modules/menu';
  import List from '../../../components/list/List.svelte';
  import File from '../../../models/file';
  import Value, {ValueLabels, type ValueType, ValueTypes} from '../../../modules/value';
  import FormData, {FileManagerMode, GameOperation} from '../../../models/form-data';
  import Loader from '../../Loader.svelte';
  import {PopupNames} from '../../../modules/popup';
  import FileSystem from '../../../modules/api/modules/file-system';
  import type Iso from '../../../modules/api/modules/iso';
  import Image from '../../../models/image';

  const fsApi: FileSystem = window.$app.getApi().getFileSystem();

  let list: List;
  let data: File[] = undefined;
  let currentPath: string = '';
  let pathIndices: {[path: string]: number} = {};

  const formData: FormData<MenuItem> = window.$app.getPopup().getData();
  const operation: GameOperation = formData.getOperation();
  const mode: FileManagerMode = formData.getFileManagerMode();
  const root: string = formData.getFileManagerRootPath();

  currentPath = root || '';

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

      if (isSelectList) {
        if (item) {
          const select: ValueType = selectList.getItem();

          switch (select.value) {
            case 'execute':
              formData.setFileManagerMountImage(false);
              formData.setExtension(item.getExtension());
              formData.setPath(item.getPath());

              break;
            case 'mount':
              formData.setFileManagerMountImage(true);
              formData.setFileManagerImage(true);
              formData.setPath(item.getPath());

              break;
            case 'copy':
            case 'move':
            case 'symlink':
              formData.setFileManagerMountImage(false);
              formData.setFileManagerImage(false);
              formData.setPath(item.getPath());

              break;
            case 'import':
              if (FileManagerMode.IMAGE === mode) {
                unbindEvents();
                formData.runCallback(new Image({
                  thumb: item.getPath(),
                  url: item.getPath(),
                  type: 'file',
                }));
                window.$app.getPopup().back();

                return;
              }

              break;
            case 'select':
              if (GameOperation.SELECT_EXE === operation) {
                unbindEvents();
                formData.runCallback(item);
                window.$app.getPopup().back();

                return;
              }

              break;
          }

          window.$app.getPopup().open(PopupNames.EXECUTING, formData);
        }

        return;
      }

      if (item && item.isDirectory()) {
        loading = true;

        fsApi.ls(item.path).then((files: File[]) => {
          currentPath = item.path;
          data = files.filter((file: File) => {
            if (FileManagerMode.EXECUTABLE === mode) {
              return file.isDirectory() || file.isExecutable();
            } else if (FileManagerMode.DIRECTORY === mode) {
              return file.isDirectory();
            } else if (FileManagerMode.IMAGE === mode) {
              return file.isDirectory() || file.isImage();
            } else if (FileManagerMode.DISK_IMAGE === mode) {
              return file.isDirectory() || file.isDiskImage();
            }
          });
          list.changeIndex(pathIndices?.[currentPath] || 0);
          loading = false;
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

      if (item.isDirectory() && (GameOperation.INSTALL_FILE === operation || GameOperation.INSTALL_DISK_IMAGE === operation || GameOperation.SELECT_IMAGE === operation || GameOperation.SELECT_EXE === operation)) {
        return keyboardWatch(event, KeyboardKey.ENTER);
      } else {
        selectListItems = value.getList().filter((value: ValueType) => {
          switch (value.value) {
            case 'execute':
              return item.isExecutable() && formData.isFileManagerExecutable() && GameOperation.SELECT_EXE !== operation;
            case 'mount':
              return item.isDiskImage();
            case 'copy':
              return GameOperation.COPY_GAME === operation;
            case 'move':
              return GameOperation.MOVE_GAME === operation;
            case 'symlink':
              return GameOperation.SYMLINK_GAME === operation;
            case 'import':
              return GameOperation.SELECT_IMAGE === operation;
            case 'select':
              return GameOperation.SELECT_EXE === operation;
          }

          return false;
        });

        isSelectList = true;
      }
    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key || KeyboardKey.LEFT === key) {
      if (isSelectList) {
        isSelectList = false;
        return;
      }

      let minLength: number = 0;

      if (root) {
        minLength = root.split('/').length - 1;
      }

      const path: string[] = currentPath.split('/').slice(0, -1);

      if (path.length === minLength) {
        unbindEvents();
        window.$app.getPopup().back();
        return;
      }

      currentPath = path.join('/');
      loading = true;

      (currentPath ? fsApi.ls(currentPath) : fsApi.getStorages())
        .then((files: File[]) => {
          data = files.filter((file: File) => {
            if (FileManagerMode.EXECUTABLE === mode) {
              return file.isDirectory() || file.isExecutable();
            } else if (FileManagerMode.DIRECTORY === mode) {
              return file.isDirectory();
            } else if (FileManagerMode.IMAGE === mode) {
              return file.isDirectory() || file.isImage();
            } else if (FileManagerMode.DISK_IMAGE === mode) {
              return file.isDirectory() || file.isDiskImage();
            }
          });
          list.changeIndex(pathIndices?.[currentPath] || 0);
          loading = false;
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

    (root ? fsApi.ls(root) : fsApi.getStorages()).then((files: File[]) => {
      data = files;
      loading = false;
    });
  });

  onDestroy(async () => {
    unbindEvents();

    if (formData.isFileManagerImage() && !window.$app.getPopup().isOpen(PopupNames.EXECUTING)) {
      const iso: Iso = window.$app.getApi().getIso();
      await iso.unmount();
    }
  });
</script>

<div class="popup">
  <div class="header">
    <div class="left">{currentPath}</div>
    <div class="right">
      {#if GameOperation.SELECT_EXE === operation}
        Select executable file
      {:else if FileManagerMode.EXECUTABLE === mode}
        Select installation file
      {:else if FileManagerMode.DIRECTORY === mode}
        Select the game folder
      {:else if FileManagerMode.DISK_IMAGE === mode}
        Select disk image
      {:else if FileManagerMode.IMAGE === mode}
        Select image
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