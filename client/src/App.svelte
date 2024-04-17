<script lang="ts">
  import Background from './widgets/Background.svelte';
  import Menu from './widgets/Menu.svelte';
  import PopupGame from './widgets/popups/PopupGame.svelte';
  import Popup, {PopupEvents, PopupNames} from './modules/popup';

  let popup: Popup = new Popup();

  const color1: string = '#3586ff';
  const color2: string = '#a9a9a9';

  let showMenu: boolean = true;
  let namePopup: PopupNames = undefined;
  let showPopup: boolean = false;

  popup.on(PopupEvents.OPEN, (event: PopupEvents.OPEN, name: PopupNames) => {
    showMenu = false;
    namePopup = name;
    showPopup = true;
  });

  popup.on(PopupEvents.CLOSE, (event: PopupEvents.CLOSE, name: PopupNames) => {
    showPopup = false;
    showMenu = true;
  });
</script>

<main style:background-color={color1}>
  <Background/>

  <Menu
    style="{showMenu ? 'opacity: 1;' : 'opacity: 0;'}"
    {popup}
  />

  {#if showPopup}
    {#if namePopup === PopupNames.RUN_GAME}
      <PopupGame bind:this={popup.ref} item={popup.getData()}/>
    {/if}
  {/if}
</main>

<style lang="less">
  main {
    width: 100%;
    height: 100%;
  }
</style>
