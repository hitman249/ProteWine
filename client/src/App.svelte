<script lang="ts">
  import Background from './widgets/Background.svelte';
  import Config from './models/config';
  import Containers from './widgets/Containers.svelte';
  import FormData, {GameOperation} from './models/form-data';
  import Menu from './widgets/Menu.svelte';
  import PopupConfig from './widgets/popups/PopupConfig.svelte';
  import PopupDatabase from './widgets/popups/PopupDatabase.svelte';
  import PopupExecuting from './widgets/popups/PopupExecuting.svelte';
  import PopupFileManager from './widgets/popups/PopupFileManager.svelte';
  import PopupFindLinks from './widgets/popups/PopupFindLinks.svelte';
  import PopupGallery from './widgets/popups/PopupGallery.svelte';
  import PopupGame from './widgets/popups/PopupGame.svelte';
  import PopupInfo from './widgets/popups/PopupInfo.svelte';
  import PopupInput from './widgets/popups/PopupInput.svelte';
  import PopupRunners from './widgets/popups/PopupRunners.svelte';
  import PopupWinetricks from './widgets/popups/PopupWinetricks.svelte';
  import PopupYesNo from './widgets/popups/PopupYesNo.svelte';
  import type Popup from './modules/popup';
  import {MenuItem} from './modules/menu';
  import {PopupEvents, PopupNames} from './modules/popup';


  let menu: Menu;
  let containers: Containers;
  let popup: Popup = window.$app.getPopup();

  const color1: string = '#3586ff';
  const color2: string = '#a9a9a9';

  let showMenu: boolean = true;
  let namePopup: PopupNames = undefined;
  let showPopup: boolean = false;

  let selectContainer: boolean = true;

  popup.on(PopupEvents.OPEN, (event: PopupEvents.OPEN, name: PopupNames) => {
    if (selectContainer) {
      containers?.unbindEvents();
    } else {
      menu?.unbindEvents();
      showMenu = false;
      namePopup = name;
      showPopup = true;

      if (PopupNames.FIND_LINKS === name) {
        menu?.getMenu()?.clearGames();
      }
    }
  });

  popup.on(PopupEvents.CLOSE, (event: PopupEvents.CLOSE, name: PopupNames) => {
    if (selectContainer) {
      containers?.bindEvents();
    } else {
      menu?.bindEvents();
      showPopup = false;
      showMenu = true;
    }
  });

  window.$app.getApi().getPrefix().isProcessed().then((processed: boolean) => {
    if (processed) {
      const data: FormData<void> = new FormData();
      data.setOperation(GameOperation.PREFIX);
      data.setCallback(() => {
        menu?.updateWineVersion();

        if (popup.isOpen(PopupNames.EXECUTING)) {
          popup.clearHistory().back();
        }
      });

      popup.open(PopupNames.EXECUTING, data);
    }
  });

  window.$app.getApi().getGames().getRunningGame().then((config?: Config) => {
    if (config) {
      const data: FormData<MenuItem> = new FormData(new MenuItem(config.toObject(), undefined, 0));
      popup.open(PopupNames.RUN_GAME, data);
    }
  });
</script>

<main style:background-color={color1}>
  <Background />

  {#if selectContainer}
    <Containers {popup} bind:this={containers} />

    <svg width="0" height="0">
      <defs>
        <clipPath id="svgPath" clipPathUnits="objectBoundingBox">
          <path
            d="M0.893167 0.609611C0.807466 0.417132 0.710059 0.233759 0.583426 0.0731167C0.556555 0.0265962 0.510401 0 0.45666 0C0.402919 0 0.356764 0.0265962 0.329894 0.0731167C0.205606 0.241428 0.098819 0.418489 0.0201528 0.609611C-0.0067176 0.656131 -0.0067176 0.709415 0.0201528 0.755936C0.0470232 0.802456 0.086563 0.818027 0.146919 0.829052C0.374602 0.859659 0.574307 0.853038 0.766401 0.829052C0.822346 0.823907 0.866296 0.802456 0.893167 0.755936C0.920037 0.709415 0.920037 0.656131 0.893167 0.609611Z" />
        </clipPath>
      </defs>
    </svg>
  {:else}
    <Menu
      bind:this={menu}
      style="{showMenu ? 'opacity: 1;' : 'opacity: 0;'}"
      {popup}
    />
  {/if}

  {#if showPopup}
    {#if namePopup === PopupNames.RUN_GAME}
      <PopupGame bind:this={popup.ref} />
    {:else if namePopup === PopupNames.FILE_MANAGER}
      <PopupFileManager bind:this={popup.ref} />
    {:else if namePopup === PopupNames.EXECUTING}
      <PopupExecuting bind:this={popup.ref} />
    {:else if namePopup === PopupNames.FIND_LINKS}
      <PopupFindLinks bind:this={popup.ref} />
    {:else if namePopup === PopupNames.GALLERY}
      <PopupGallery bind:this={popup.ref} />
    {:else if namePopup === PopupNames.YES_NO}
      <PopupYesNo bind:this={popup.ref} />
    {:else if namePopup === PopupNames.INPUT}
      <PopupInput bind:this={popup.ref} />
    {:else if namePopup === PopupNames.INFO}
      <PopupInfo bind:this={popup.ref} />
    {:else if namePopup === PopupNames.WINETRICKS}
      <PopupWinetricks bind:this={popup.ref} />
    {:else if namePopup === PopupNames.CONFIG}
      <PopupConfig bind:this={popup.ref} />
    {:else if namePopup === PopupNames.RUNNER}
      <PopupRunners bind:this={popup.ref} />
    {:else if namePopup === PopupNames.DATABASE}
      <PopupDatabase bind:this={popup.ref} />
    {/if}
  {/if}
</main>

<style lang="less">
  main {
    width: 100%;
    height: 100%;
  }
</style>
