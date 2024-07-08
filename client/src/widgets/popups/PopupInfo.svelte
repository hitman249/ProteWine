<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import type FormData from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';
  import type Config from '../../models/config';
  import Loader from '../Loader.svelte';

  let formData: FormData<MenuItem> = window.$app.getPopup().getData();
  const model: MenuItem = formData.getData();

  let loading: boolean = true;
  let items: {label: string, value: string}[] = [];

  window.$app.getApi().getGames().getInfoById(model.id).then((config: Config) => {
    loading = false;

    const labels: {label: string, value: string}[] = [
      {
        label: 'Title',
        value: config.title,
      },
      {
        label: 'Time',
        value: config.time,
      },
      {
        label: 'Size',
        value: config.size,
      },
      {
        label: 'Path',
        value: `C:${config.path}`,
      },
    ];

    if (config.arguments) {
      labels.push({
        label: 'Arguments',
        value: config.arguments,
      });
    }

    items = labels;
  });

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      return;
    }

    if (KeyboardKey.UP === key) {
      return;
    }

    if (KeyboardKey.ENTER === key) {
      unbindEvents();
      formData.runCallback();
      window.$app.getPopup().back();
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
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    Info
  </div>
  <div class="content">
    {#each items as item}
      <div class="line">
        <div class="label">{item.label}:</div>
        <div class="value">{item.value}</div>
      </div>
    {/each}
  </div>
  <div class="footer">
    {#if loading}
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
      justify-content: end;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .line {
      font-size: 20px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
      display: flex;
      flex-direction: row;
      height: 40px;
      align-items: center;

      .label {
        display: flex;
        width: 200px;
        justify-content: end;
        padding-right: 40px;
        font-weight: bold;
      }

      .value {
        display: flex;
        width: 500px;
        justify-content: start;
        line-height: 20px;
      }
    }
  }
</style>