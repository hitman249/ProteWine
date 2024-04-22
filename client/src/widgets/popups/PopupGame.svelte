<script lang="ts">
import Progress from '../Progress.svelte';
import {onDestroy, onMount} from 'svelte';
import type {MenuItem} from '../../modules/menu';
import List from '../../components/list/List.svelte';
import _ from 'lodash';
import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';

let item: MenuItem = window.$app.getPopup().getData();

let list: List;

let left: HTMLDivElement;
let img: HTMLImageElement;
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
  }, 500);
}

percentUp();

function getImgTranslation(): string {
  let imgRect: DOMRect = img.getBoundingClientRect();
  let leftRect: DOMRect = left.getBoundingClientRect();

  return `transform: translate(${imgRect.left - leftRect.left}px, ${imgRect.top - leftRect.top}px);`;
}

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
    window.$app.getPopup().close();
  }
}, 100);

export function bindEvents(): void {
  window.$app.getKeyboard().on(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
}

export function unbindEvents(): void {
  window.$app.getKeyboard().off(KeyboardPressEvent.KEY_DOWN, keyboardWatch);
}

onMount(() => {
  bindEvents();

  setTimeout(() => {
    if (item) {
      animate = true;
    }
  }, 100);
});

onDestroy(() => {
  unbindEvents();
});
</script>

<div class="popup" class:animate={animate}>
  <div class="header">
    Running
  </div>
  <div class="content">
    <div class="title" style="{animate ? getTitleTranslation() : ''}">
      {item?.title}
    </div>
    <div class="left" bind:this={left}>
      <img class="show-img" src="local://{item?.poster}" alt="" style="{animate ? getImgTranslation() : ''}">
      <img class="hidden-img" src="local://{item?.poster}" alt="" bind:this={img}>
    </div>
    <div class="right">
      <div class="detail">
        <div class="hidden-title" style="opacity: 0" bind:this={title}>
          {item?.title}
        </div>
        <Progress {value} style="{animate ? 'opacity: 1;' : 'opacity: 0;'}"/>
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

    .hidden-img {
      position: absolute;
      opacity: 0;
      top: 0;
      right: 0;
      bottom: 0;
      width: 250px;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      margin: auto 0;
    }

    .show-img {
      .hidden-img;
      right: unset;
      left: 0;
      opacity: 1;
      width: 124px;
      margin: 0;
      border-radius: 5px;
      transition: transform 0.5s, width 0.5s, height 0.5s;
      transform: translate(209px, 143px);
    }

    &.animate {
      .show-img {
        .hidden-img;
        opacity: 1;
        right: unset;
        left: 0;
        margin: 0;
        width: 250px;
        border-radius: 5px;
        border: rgba(255, 255, 255, 80%) 1px solid;
      }
    }
  }
</style>