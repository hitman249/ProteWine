<script lang="ts">
  import {onDestroy, onMount, tick} from 'svelte';
  import {StickerType} from '../stickers';
  import List from '../../components/list/List.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import FormData, {FileManagerMode, GameOperation} from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';
  import Loader from '../Loader.svelte';
  import Tasks from '../../modules/api/modules/tasks';
  import {RoutesTaskEvent} from '../../../../server/routes/routes';
  import {TaskType} from '../../../../server/modules/tasks/types';
  import {PopupNames} from '../../modules/popup';

  let list: List;
  const data: FormData<MenuItem> = window.$app.getPopup().getData();
  let running: boolean = false;
  let completed: boolean = false;

  let items: string[] = [];

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      list?.keyDown();
    }

    if (KeyboardKey.UP === key) {
      list?.keyUp();
    }

    if (running || completed) {
      if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
        unbindEvents();
        window.$app.getPopup().back();
      }

      if (KeyboardKey.ENTER === key || KeyboardKey.RIGHT === key || KeyboardKey.LEFT === key) {
        window.$app.getPopup().open(PopupNames.GAME_OPERATION, data).clearHistory();
        return;
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
    if (TaskType.KERNEL === data.type) {
      running = true;
      pushLine(data.cmd);
    }
  }

  function onLog(event: RoutesTaskEvent.LOG, data: {type: TaskType, line: string}): void {
    if (TaskType.KERNEL === data.type) {
      pushLine(data.line);
    }
  }

  function onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    if (TaskType.KERNEL === data.type) {
      running = false;
      completed = true;
    }
  }

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
    const tasks: Tasks = window.$app.getApi().getTasks();

    tasks.on(RoutesTaskEvent.RUN, onRun);
    tasks.on(RoutesTaskEvent.LOG, onLog);
    tasks.on(RoutesTaskEvent.EXIT, onExit);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);

    const tasks: Tasks = window.$app.getApi().getTasks();

    tasks.off(RoutesTaskEvent.RUN, onRun);
    tasks.off(RoutesTaskEvent.LOG, onLog);
    tasks.off(RoutesTaskEvent.EXIT, onExit);
  }

  onMount(() => {
    bindEvents();

    if (GameOperation.INSTALL_FILE === data.getOperation() && FileManagerMode.EXECUTABLE === data.getFileManagerMode()) {
      window.$app.getApi().getKernel().install(`"${data.getPath()}"`);
    }
  });

  onDestroy(async () => {
    unbindEvents();

    if (running) {
      if (GameOperation.INSTALL_FILE === data.getOperation()) {
        const tasks: Tasks = window.$app.getApi().getTasks();

        if (!(await tasks.isFinish()) && TaskType.KERNEL === (await tasks.getType())) {
          await tasks.kill();
        }
      }
    }
  });
</script>

<div class="popup">
  <div class="header">
    {#if completed}
      Completed
    {:else}
      Running
    {/if}

  </div>
  <div class="content">
    <div class="center">
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
  </div>
  <div class="footer">
    {#if running}
      <Loader style="margin-top: 10px;"/>
    {/if}

    {#if completed}
      <div class="message">Press any key to exit.</div>
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
      position: relative;
      height: 100px;
      width: calc(100% - 100px);
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      border-top: rgb(255 255 255 / 80%) solid 1px;
      justify-content: end;

      .message {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding-top: 3px;
        font-weight: 100;
        font-size: 16px;
        filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
        text-align: center;
      }
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;

      .center {
        width: calc(100% - 100px);
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