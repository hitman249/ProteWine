<script lang="ts" context="module">
  const COPY_FILES: string[] = [
    GameOperation.COPY_GAME,
    GameOperation.MOVE_GAME,
    GameOperation.SYMLINK_GAME,
  ];
</script>
<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import _ from 'lodash';
  import {StickerType} from '../stickers';
  import List from '../../components/list/List.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import FormData, {GameOperation} from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';
  import Loader from '../Loader.svelte';
  import Tasks from '../../modules/api/modules/tasks';
  import {RoutesTaskEvent} from '../../../../server/routes/routes';
  import {type BodyBus, TaskType} from '../../../../server/modules/tasks/types';
  import {PopupNames} from '../../modules/popup';
  import Kernel from '../../modules/api/modules/kernel';
  import Progress from '../Progress.svelte';
  import type {Progress as ProgressType} from '../../../../server/modules/archiver';
  import type Iso from '../../modules/api/modules/iso';
  import type {IsoData} from '../../../../server/routes/modules/iso';
  import type AppFolders from '../../modules/api/modules/app-folders';
  import type FileSystem from '../../modules/api/modules/file-system';
  import type Config from '../../models/config';
  import type {WineTrickItemType} from '../../../../server/modules/winetricks';
  import type {ItemType} from '../../../../server/modules/repositories';

  let list: List;
  const formData: FormData<MenuItem | any> = window.$app.getPopup().getData();
  const item: MenuItem = formData.getData();
  const operation: GameOperation = formData.getOperation();
  const args: {blockExit?: boolean} = window.$app.getPopup().getArguments() || {};

  let blockExit: boolean = GameOperation.PREFIX === operation || Boolean(args?.blockExit);
  let running: boolean = false;
  let completed: boolean = false;
  let progress: boolean = false;
  let progressData: ProgressType = {
    success: true,
    progress: 0,
    totalBytes: 0,
    transferredBytes: 0,
    totalBytesFormatted: '0',
    transferredBytesFormatted: '0',
    path: '',
    name: '',
    itemsCount: 0,
    itemsComplete: 0,
    event: 'download',
  };

  let items: string[] = [];

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      list?.keyDown();
    }

    if (KeyboardKey.UP === key) {
      list?.keyUp();
    }

    if ((running || completed) && !blockExit) {
      if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
        unbindEvents();
        window.$app.getPopup().back();
      }

      if (KeyboardKey.ENTER === key || KeyboardKey.RIGHT === key || KeyboardKey.LEFT === key) {
        if (GameOperation.DEBUG === operation) {
          window.$app.getApi().getGames().getRunningGame().then((config: Config) => {
            if (!config) {
              unbindEvents();
              window.$app.getPopup().back();
            }
          });
        } else if (GameOperation.RUNNER_INSTALL === operation) {
          unbindEvents();
          window.$app.getPopup().clearHistory().back();
        } else {
          unbindEvents();
          window.$app.getPopup().clearHistory().back();
        }
      }
    }
  };

  function pushLine(str: string): void {
    let autoscroll: boolean = (list?.getIndex() || 0) === (items.length - 1);
    items.push(str);
    items = items;

    tick().then(() => {
      if (autoscroll) {
        list?.changeIndex(items.length - 1, true);
      }
    });
  }

  function onRun(event: RoutesTaskEvent.RUN, data: {type: TaskType, cmd: string}): void {
    if (TaskType.KERNEL === data.type || TaskType.PLUGINS === data.type) {
      running = true;
      pushLine('Kernel start.');
      pushLine(data.cmd);
    }

    if (TaskType.FILE_SYSTEM === data.type) {
      running = true;
      blockExit = true;
      pushLine('Start.');
      pushLine(data.cmd);
    }

    if (TaskType.REPOSITORIES === data.type) {
      running = true;
      blockExit = true;
      pushLine(data.cmd);
    }
  }

  function onLog(event: RoutesTaskEvent.LOG, data: {type: TaskType, line: string}): void {
    if (TaskType.KERNEL === data.type || TaskType.FILE_SYSTEM === data.type || TaskType.REPOSITORIES === data.type || TaskType.PLUGINS === data.type) {
      pushLine(data.line);
    }
  }

  function onBus(event: RoutesTaskEvent.BUS, body: BodyBus): void {
    if ('iso' === body.module) {
      const value: IsoData = body.value;
      pushLine(`${body.module}.${body.event}: ${value.basename} (${value.src} -> ${value.dest})`);
    }

    if ('prefix' === body.module && 'created' === body.event) {
      if (GameOperation.PREFIX === operation) {
        formData.runCallback();
        running = false;
        completed = true;
        blockExit = false;
      }
    }
  }

  function onProgress(event: RoutesTaskEvent.PROGRESS, data: {type: TaskType, progress: ProgressType}): void {
    if (Boolean(data.progress.success)) {
      if (progress) {
        progress = false;
      }
    } else {
      progressData = data.progress;

      if (!progress) {
        progress = true;
      }
    }
  }

  function onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    if (TaskType.KERNEL === data.type || TaskType.PLUGINS === data.type) {
      pushLine('Kernel exit.');

      if (
        GameOperation.INSTALL_DISK_IMAGE !== operation
        && GameOperation.PREFIX !== operation
        && TaskType.PLUGINS !== data.type
      ) {
        running = false;
        completed = true;
      }
    }

    if ((TaskType.FILE_SYSTEM === data.type || TaskType.REPOSITORIES === data.type) && GameOperation.PREFIX !== operation) {
      pushLine('Complete.');

      running = false;
      completed = true;
      blockExit = false;
    }

    if (args?.blockExit) {
      running = false;
      completed = true;
      blockExit = false;
    }
  }

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
    const tasks: Tasks = window.$app.getApi().getTasks();

    tasks.on(RoutesTaskEvent.RUN, onRun);
    tasks.on(RoutesTaskEvent.LOG, onLog);
    tasks.on(RoutesTaskEvent.BUS, onBus);
    tasks.on(RoutesTaskEvent.PROGRESS, onProgress);
    tasks.on(RoutesTaskEvent.EXIT, onExit);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);

    const tasks: Tasks = window.$app.getApi().getTasks();

    tasks.off(RoutesTaskEvent.RUN, onRun);
    tasks.off(RoutesTaskEvent.LOG, onLog);
    tasks.off(RoutesTaskEvent.BUS, onBus);
    tasks.off(RoutesTaskEvent.PROGRESS, onProgress);
    tasks.off(RoutesTaskEvent.EXIT, onExit);
  }

  onMount(async () => {
    bindEvents();

    if (GameOperation.INSTALL_FILE === operation) {
      /**
       * Install file
       */

      const kernel: Kernel = window.$app.getApi().getKernel();
      await kernel.install(
        `${await kernel.getLauncherByFileType(formData.getExtension())} "${formData.getPath()}"`
      );

    } else if (GameOperation.DEBUG === operation) {
      /**
       * Run game with debug mode
       */

      await window.$app.getApi().getGames().debugById(item.id);

    } else if (GameOperation.INSTALL_DISK_IMAGE === operation) {
      /**
       * Mount image
       */

      const iso: Iso = window.$app.getApi().getIso();
      const mountedPath: string = await iso.mount(formData.getPath());
      formData.setFileManagerRootPath(mountedPath);
      formData.setOperation(GameOperation.INSTALL_FILE);
      formData.setFileManagerImage(true);

      window.$app.getPopup().open(PopupNames.FILE_MANAGER, formData);

    } else if (GameOperation.PREFIX === operation) {
      /**
       * Creating prefix
       */

      await window.$app.getApi().getPrefix().sendLastProgress();

    } else if (GameOperation.COPY_GAME === operation) {
      /**
       * Copy game folder
       */

      const fs: FileSystem = window.$app.getApi().getFileSystem();
      const appFolders: AppFolders = window.$app.getApi().getAppFolders();

      await fs.cp(
        formData.getPath(),
        `${await appFolders.getGamesDir()}/${await fs.basename(formData.getPath())}`
      );
    } else if (GameOperation.MOVE_GAME === operation) {
      /**
       * Move game folder
       */

      const fs: FileSystem = window.$app.getApi().getFileSystem();
      const appFolders: AppFolders = window.$app.getApi().getAppFolders();

      await fs.mv(
        formData.getPath(),
        `${await appFolders.getGamesDir()}/${await fs.basename(formData.getPath())}`
      );
    } else if (GameOperation.SYMLINK_GAME === operation) {
      /**
       * Create symlink
       */

      const fs: FileSystem = window.$app.getApi().getFileSystem();
      const appFolders: AppFolders = window.$app.getApi().getAppFolders();

      await fs.ln(
        formData.getPath(),
        `${await appFolders.getGamesDir()}/${await fs.basename(formData.getPath())}`
      );
    } else if (GameOperation.WINETRICKS === operation) {
      /**
       * Winetricks
       */

      const item: WineTrickItemType = window.$app.getPopup().getArguments();
      await window.$app.getApi().getKernel().winetricks(item.name);
    } else if (GameOperation.RUNNER_INSTALL === operation) {
      /**
       * Runner install
       */

      const item: ItemType = window.$app.getPopup().getArguments();
      await window.$app.getApi().getRepositories().installRunner(item.url || item.path);
    }
  });

  onDestroy(async () => {
    unbindEvents();

    if (running) {
      if (GameOperation.INSTALL_FILE === operation) {
        const tasks: Tasks = window.$app.getApi().getTasks();

        if (!(await tasks.isFinish()) && TaskType.KERNEL === (await tasks.getType())) {
          await tasks.kill();
        }
      } else if (GameOperation.DEBUG === operation) {
        await window.$app.getApi().getGames().kill();
      }
    }

    if (formData.isFileManagerImage() && !formData.isFileManagerMountImage()) {
      const iso: Iso = window.$app.getApi().getIso();
      await iso.unmount();
    }

    if (GameOperation.RUNNER_INSTALL === operation) {
      formData.runCallback();
    }
  });
</script>

<div class="popup">
  <div class="header">
    {#if !completed}
      {#if GameOperation.PREFIX === operation}
        Prefix initialization
      {:else if GameOperation.COPY_GAME === operation}
        Copying the game folder
      {:else if GameOperation.MOVE_GAME === operation}
        Moving the game folder
      {:else if GameOperation.SYMLINK_GAME === operation}
        Creating a link to the game folder
      {:else if GameOperation.RUNNER_INSTALL === operation}
        Runner install
      {:else if GameOperation.WINETRICKS === operation}
        Winetricks
      {:else}
        Running
      {/if}
    {/if}
  </div>
  <div class="content">
    <div class="list" class:with-progress={progress}>
      <List
        bind:this={list}
        {items}
        headersDummy={Math.trunc((window.innerHeight - 200) / 30 / 2) - 1}
        paddingIndent={0}
        itemSize={30}
        itemSpace={40}
        itemCenter={true}
        horizontal={false}
        extendItemClass="vertical-item"
        type={StickerType.LOG}
      />
    </div>

    <div class="list-additional" class:with-progress={progress}>
      <div class="message">{Math.trunc(progressData.progress)}%</div>
      <Progress value={progressData.progress} style="width: calc(100% - 500px); margin-top: 0px;"/>
      <div class="message">
        {#if progressData.name && -1 === COPY_FILES.indexOf(operation)}
          {#if GameOperation.PREFIX !== operation}
            {_.capitalize(progressData.event)}:
          {/if}
          {progressData.name}

          {#if progressData.totalBytesFormatted || progressData.itemsCount > 1}
            <div class="hr"/>
          {/if}
        {/if}

        {#if progressData.totalBytesFormatted}
          Completed: {progressData.transferredBytesFormatted} / {progressData.totalBytesFormatted}

          {#if progressData.itemsCount > 1}
            <div class="hr"/>
          {/if}
        {/if}

        {#if progressData.itemsCount > 1}
          {#if GameOperation.PREFIX === operation}
            Step:
          {:else}
            Files:
          {/if}

          [{progressData.itemsComplete}/{progressData.itemsCount}]
        {/if}
      </div>
    </div>
  </div>
  <div class="footer">
    {#if completed}
      <div class="message">Press any key to exit.</div>
    {/if}

    {#if running}
      <Loader style="margin-top: 10px;"/>
    {/if}
  </div>
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

    .message {
      display: flex;
      justify-content: center;
      width: 100%;
      font-weight: 400;
      font-size: 18px;
      text-align: center;
      line-height: 18px;
      margin-top: 12px;
      margin-bottom: 14px;
    }

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
      padding-bottom: 3px;
      font-weight: 400;
      font-size: 18px;
      border-bottom: rgb(255 255 255 / 80%) solid 1px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
    }

    .footer {
      display: flex;
      position: relative;
      height: 100px;
      width: calc(100% - 100px);
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      justify-content: end;
      border-top: rgb(255 255 255 / 80%) solid 1px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);

      .message {
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        padding-top: 14px;
      }
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;

      .list {
        width: calc(100% - 100px);
        height: 100%;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        &.with-progress {
          height: calc(100% - 125px);
          bottom: 125px;
        }
      }

      .list-additional {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        //border-top: rgb(255 255 255 / 80%) solid 1px;
        width: calc(100% - 100px);
        height: 100px;
        position: absolute;
        margin: auto;
        top: calc(100% - 125px);
        left: 0;
        right: 0;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 212, 255, 30%) 50%, rgba(0, 0, 0, 0) 100%);
        opacity: 0;
        transition: opacity 0.2s;

        &.with-progress {
          opacity: 1;
        }

        .message {
          filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
        }

        &:before {
          position: absolute;
          display: block;
          content: '';
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 0, 0, 0) 100%);
        }
        &:after {
          position: absolute;
          display: block;
          content: '';
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 0, 0, 0) 100%);
          filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
        }

        .hr {
          display: inline-block;
          height: 20px;
          width: 2px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 0, 0, 0) 100%);
          margin-left: 10px;
          margin-right: 10px;
        }
      }
    }
  }
</style>