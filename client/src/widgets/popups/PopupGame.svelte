<script lang="ts">
  import _ from 'lodash';
  import {onDestroy, onMount} from 'svelte';
  import type {MenuItem} from '../../modules/menu';
  import type FormData from '../../models/form-data';
  import type Tasks from '../../modules/api/modules/tasks';
  import List from '../../components/list/List.svelte';
  import Progress from '../Progress.svelte';
  import Icon from '../icons/Icon.svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import {RoutesTaskEvent} from '../../../../server/routes/routes';
  import {TaskType} from '../../../../server/modules/tasks/types';
  import type Config from '../../models/config';

  type RectType = {width: number, height: number, left: number, top: number, scale: number};

  let data: FormData<MenuItem> = window.$app.getPopup().getData();
  let item: MenuItem = data.getData();

  const parentImg: HTMLImageElement = window.document.querySelector('.inner-list .list-item.active img');
  const parentSvg: HTMLImageElement = window.document.querySelector('.inner-list .list-item.active svg');
  const parentRect: DOMRect = getRect();
  const src: string = getSrc();

  let rect: RectType = {
    width: parentRect.width,
    height: parentRect.height,
    top: parentRect.top + (src ? 0 : 40),
    left: parentRect.left + (src ? 0 : 40),
    scale: 2,
  };

  let list: List;

  let leftDiv: HTMLDivElement;
  let title: HTMLDivElement;

  let animate: boolean = false;
  let value: number = 0;

  function percentUp() {
    setTimeout(() => {
      if (value >= 100) {
        value = 0;
      } else {
        value = value + 5;
      }

      percentUp();
    }, 1000);
  }

  function getRect(): any {
    return (parentImg || parentSvg)?.getBoundingClientRect() || {
      height: 238,
      left: 241,
      top: 217,
      width: 159
    };
  }

  function getSrc() {
    if (!parentImg && !parentSvg) {
      return item.poster;
    }

    return parentImg?.src;
  }

  function updateImageRect(): void {
    const parent: DOMRect = getRect();
    const leftRect: DOMRect = leftDiv.getBoundingClientRect();
    const aspect: number = parent.height / parent.width;
    const width: number = 250;
    const height: number = width * aspect;
    const left: number = leftRect.left + (leftRect.width / 2) - (width / 4) + (src ? 0 : 80);
    const top: number = leftRect.top + (leftRect.height / 2) - (height / 2) + (src ? 0 : 80);

    rect = {width, height, left, top, scale: 4};
  }

  percentUp();

  function getTitleTranslation(): string {
    let titleRect: DOMRect = title.getBoundingClientRect();

    return `transform: translate(${titleRect.left}px, ${titleRect.top - 101}px);`;
  }

  const keyboardWatch = _.throttle((event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      list?.keyDown();
    }

    if (KeyboardKey.UP === key) {
      list?.keyUp();
    }

    if (KeyboardKey.ENTER === key) {

    }

    if (KeyboardKey.ESC === key || KeyboardKey.BACKSPACE === key) {
      unbindEvents();
      window.$app.getPopup().back();
    }
  }, 100);

  function onExit(event: RoutesTaskEvent.EXIT, data: {type: TaskType}): void {
    if (TaskType.KERNEL === data.type) {
      unbindEvents();
      window.$app.getPopup().back();
    }
  }

  export function bindEvents(): void {
    window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  export function unbindEvents(): void {
    window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
  }

  onMount(async () => {
    bindEvents();

    const tasks: Tasks = window.$app.getApi().getTasks();
    tasks.on(RoutesTaskEvent.EXIT, onExit);

    const config: Config = await window.$app.getApi().getGames().getRunningGame();

    if (!config) {
      await window.$app.getApi().getGames().runById(item.id);
    }

    setTimeout(() => {
      if (item) {
        updateImageRect();
        animate = true;
      }
    }, 100);
  });

  onDestroy(() => {
    window.$app.getApi().getGames().kill();
    unbindEvents();
  });
</script>

<div class="popup" class:animate={animate}>
  {#if src}
    <img
      class="poster"
      src={src}
      style:width="{rect.width}px"
      style:height="{rect.height}px"
      style:transform="translate({rect.left}px, {rect.top}px)"
      alt=""
    >
  {:else}
    <Icon
      icon="dice"
      style="position: absolute; top: {rect.top}px; left: {rect.left}px; transition: top 0.5s, left 0.5s, transform 0.5s; transform: scale({rect.scale});"
    />
  {/if}

  <div class="header">
    Running
  </div>
  <div class="content">
    <div class="title" style="{animate ? getTitleTranslation() : ''}">
      {item?.title}
    </div>
    <div class="left" bind:this={leftDiv} />
    <div class="right">
      <div class="detail">
        <div class="hidden-title" style="opacity: 0" bind:this={title}>
          {item?.title}
        </div>
        <Progress {value} style="{animate ? 'opacity: 1;' : 'opacity: 0;'}" />
      </div>
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

    .poster {
      position: absolute;
      top: 0;
      left: 0;
      transition: transform 0.5s, width 0.5s, height 0.5s;
      border-radius: 5px;
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
      border-bottom: rgb(255 255 255 / 80%) solid 1px;
      padding-bottom: 3px;
      font-weight: 400;
      font-size: 18px;
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
      display: block;
      position: relative;
      width: 100%;
      flex: 1;

      .left, .right {
        display: inline-block;
        position: relative;
        height: 100%;
        vertical-align: top;
      }

      .left {
        left: 50px;
        width: calc(30% - 50px);
      }

      .right {
        left: 100px;
        width: calc(70% - 100px);
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }
    }

    .detail {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      position: relative;
    }

    .hidden-title {
      display: inline-block;
      position: relative;
      filter: none;
      text-align: left;
      font-weight: 400;
      font-size: 24px;
      transition: all 0.5s;
      margin-bottom: 20px;
    }

    .title {
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
      text-align: left;
      font-weight: 400;
      font-size: 24px;
      transition: all 0.5s;
      transform: translate(446px, 218px);
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
    }
  }
</style>