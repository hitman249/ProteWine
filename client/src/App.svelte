<script lang="ts">
  import Background from './widgets/Background.svelte';
  import Menu from './widgets/Menu.svelte';
  import PopupGame from './widgets/popups/PopupGame.svelte';
  import type Popup from './modules/popup';
  import {PopupEvents, PopupNames} from './modules/popup';
  import PopupSelectOperation from './widgets/popups/PopupSelectOperation.svelte';
  import PopupFileManager from './widgets/popups/PopupFileManager.svelte';
  import PopupExecuting from './widgets/popups/PopupExecuting.svelte';
  import FormData, {GameOperation} from './models/form-data';
  import PopupFindLinks from './widgets/popups/PopupFindLinks.svelte';
  import PopupGallery from './widgets/popups/PopupGallery.svelte';
  import PopupYesNo from './widgets/popups/PopupYesNo.svelte';
  import PopupInput from './widgets/popups/PopupInput.svelte';
  import PopupInfo from './widgets/popups/PopupInfo.svelte';
  import PopupWinetricks from './widgets/popups/PopupWinetricks.svelte';
  import PopupRuntime from './widgets/popups/PopupRuntime.svelte';

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

    if (PopupNames.FIND_LINKS === name) {
      menu?.getMenu()?.clearGames();
    }
  });

  popup.on(PopupEvents.CLOSE, (event: PopupEvents.CLOSE, name: PopupNames) => {
    menu?.bindEvents();
    showPopup = false;
    showMenu = true;
  });

  window.$app.getApi().getPrefix().isProcessed().then((processed: boolean) => {
    if (processed) {
      const data: FormData<void> = new FormData();
      data.setOperation(GameOperation.PREFIX);
      popup.open(PopupNames.EXECUTING, data)
    }
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
      <PopupGame bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.GAME_OPERATION}
      <PopupSelectOperation bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.FILE_MANAGER}
      <PopupFileManager bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.EXECUTING}
      <PopupExecuting bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.FIND_LINKS}
      <PopupFindLinks bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.GALLERY}
      <PopupGallery bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.YES_NO}
      <PopupYesNo bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.INPUT}
      <PopupInput bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.INFO}
      <PopupInfo bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.WINETRICKS}
      <PopupWinetricks bind:this={popup.ref}/>
    {:else if namePopup === PopupNames.RUNTIME}
      <PopupRuntime bind:this={popup.ref}/>
    {/if}
  {/if}
</main>

<style lang="less">
  main {
    width: 100%;
    height: 100%;
  }
</style>
