<script lang="ts">
  import Background from './widgets/Background.svelte';
  import Menu from './widgets/Menu.svelte';
  import PopupGame from './widgets/PopupGame.svelte';
  import type {MenuItem} from './modules/menu';

  const color1: string = '#3586ff';
  const color2: string = '#a9a9a9';

  let hideMenu: boolean = false;
  let openRunGame: boolean = false;
  let item: MenuItem;

  function openPopupRunGame(model: MenuItem): void {
    item = model;
    hideMenu = true;
    openRunGame = true;
  }

  function closePopupRunGame(): void {
    openRunGame = false;
    hideMenu = false;
  }
</script>

<main style="background-color: {color1};">
  <Background/>

  <Menu
    style="{hideMenu ? 'opacity: 0;' : 'opacity: 1;'}"
    openPopupRunGame={openPopupRunGame}
    closePopupRunGame={closePopupRunGame}
  />

  {#if openRunGame && item}
    <PopupGame {item}/>
  {/if}
</main>

<style lang="less">
  main {
    width: 100%;
    height: 100%;
  }
</style>
