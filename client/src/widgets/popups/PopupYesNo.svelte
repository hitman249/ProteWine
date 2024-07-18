<script lang="ts">
  import {onDestroy, onMount} from 'svelte';
  import {KeyboardKey, KeyboardPressEvent} from '../../modules/keyboard';
  import type FormData from '../../models/form-data';
  import type {MenuItem} from '../../modules/menu';

  let formData: FormData<MenuItem> = window.$app.getPopup().getData();
  let data: {title: string, description: string} = window.$app.getPopup().getArguments();

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
      formData.runRejectCallback();
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
    {data.title}
  </div>
  <div class="content">
    <div class="description">
      {data.description}
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
      display: flex;
      position: relative;
      width: 100%;
      flex: 1;
      justify-content: center;
      align-items: center;
    }

    .description {
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
      font-size: 18px;
    }
  }
</style>