<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import type FormData from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';

  let formData: FormData<MenuItem> = window.$app.getPopup().getData();
  let data: {title: string, value: string} = window.$app.getPopup().getArguments();

  let value: string = data.value || '';
  let input: HTMLInputElement;

  const keyboardWatch = (event: KeyboardPressEvent.KEY_DOWN, key: KeyboardKey) => {
    if (KeyboardKey.DOWN === key) {
      return;
    }

    if (KeyboardKey.UP === key) {
      return;
    }

    if (KeyboardKey.ENTER === key) {
      unbindEvents();
      formData.runCallback(value);
      window.$app.getPopup().back();
      return;
    }

    if (KeyboardKey.ESC === key) {
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
    input?.focus();
  });

  onDestroy(() => {
    unbindEvents();
  });
</script>

<div class="popup">
  <div class="header">
    {data.title}
  </div>
  <div class="content">
    <div class="input">
      <div class="border">
        <input type="text" bind:this={input} bind:value={value}>
      </div>
    </div>

    <div class="description">
      To save, press the confirmation button.
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
      justify-content: flex-start;
      align-items: center;
      padding-top: 50px;
      flex-direction: column;
    }

    .input {
      position: relative;
      width: calc(100% - 200px);
      background-color: rgba(255, 255, 255, 70%);
      padding: 2px;
      border-radius: 9px;
    }

    .border {
      position: relative;
      background-color: rgba(0, 0, 0, 20%);
      padding: 1px;
      border-radius: 8px;
    }

    input {
      width: calc(100% - 30px);
      height: 50px;
      border-radius: 6px;
      padding: 0 15px;
      font-size: 20px;
      border-width: 0;
    }

    .description {
      margin-top: 100px;
    }
  }
</style>