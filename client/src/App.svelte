<script lang="ts">
  import Background from './widgets/Background.svelte';
  import Menu from './widgets/Menu.svelte';
  import PopupGame from './widgets/popups/PopupGame.svelte';
  import type Popup from './modules/popup';
  import {PopupEvents, PopupNames} from './modules/popup';
  import PopupSelectOperation from './widgets/popups/wizards/PopupSelectOperation.svelte';
  import PopupFileManager from './widgets/popups/wizards/PopupFileManager.svelte';

  let menu: Menu;
  let popup: Popup = window.$app.getPopup();

  const color1: string = '#3586ff';
  const color2: string = '#a9a9a9';

  let showMenu: boolean = true;
  let namePopup: PopupNames = undefined;
  let showPopup: boolean = false;

  popup.on(PopupEvents.OPEN, (event: PopupEvents.OPEN, name: PopupNames) => {
    menu?.unbindEvents();
    showMenu = false;
    namePopup = name;
    showPopup = true;
  });

  popup.on(PopupEvents.CLOSE, (event: PopupEvents.CLOSE, name: PopupNames) => {
    menu?.bindEvents();
    showPopup = false;
    showMenu = true;
  });
</script>

<main style:background-color={color1}>
  <Background/>

  <Menu
    bind:this={menu}
    style="{showMenu ? 'opacity: 1;' : 'opacity: 0;'}"
    {popup}
  />

  {#if showPopup}
    {#if namePopup === PopupNames.RUN_GAME}
      <PopupGame bind:this={popup.ref} item={popup.getData()}/>
    {:else if namePopup === PopupNames.GAME_OPERATION}
      <PopupSelectOperation bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.FILE_MANAGER}
      <PopupFileManager bind:this={popup.ref}/>
    {/if}
  {/if}
</main>

<style lang="less">
  main {
    width: 100%;
    height: 100%;
  }
</style>
