<script lang="ts">
  import Gamepad from '../icons/Gamepad.svelte';
  import Settings from '../icons/Settings.svelte';
  import Layouts from '../icons/Layouts.svelte';
  import Prefix from '../icons/Prefix.svelte';
  import Updates from '../icons/Updates.svelte';
  import Build from '../icons/Build.svelte';
  import Database from '../icons/Database.svelte';
  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let icon: string = '';
  export let title: string = '';
  export let index: number = 0;
  export let dummy: boolean = false;
  export let click: (a: any) => void = () => null;

</script>

<button class="item" on:click={click} style="opacity: {dummy ? 0 : 1};">
  <div class="item-icon">
    {#if 'gamepad' === icon}
      <Gamepad status={`item-${status}`} />
    {/if}
    {#if 'settings' === icon}
      <Settings status={`item-${status}`} />
    {/if}
    {#if 'layouts' === icon}
      <Layouts status={`item-${status}`} />
    {/if}
    {#if 'prefix' === icon}
      <Prefix status={`item-${status}`} />
    {/if}
    {#if 'updates' === icon}
      <Updates status={`item-${status}`} />
    {/if}
    {#if 'build' === icon}
      <Build status={`item-${status}`} />
    {/if}
    {#if 'database' === icon}
      <Database status={`item-${status}`} />
    {/if}
  </div>
  <div class="item-title">
    {title}
  </div>
</button>

<style lang="less">
  .item {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 170px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-weight: 500;
    font-family: -apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
    color: #ffffff;
    -webkit-font-smoothing: antialiased;
    //border: 1px white solid;

    &:hover .item-icon {
      filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px);
    }
  }

  .item-icon {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 110px;

    transition: filter 0.6s;
    filter: drop-shadow(transparent 0px 0px 0px);
  }

  .item-title {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 40px;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-size: 20px;
    font-weight: 400;
    filter: drop-shadow(rgba(0, 0, 0, 0.7) 4px 4px 2px);
  }

  :global(.item-active) {
    filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px);
  }

  :global(.item-focused) {
    transform: scale(1.2);

    animation-duration: 1.2s;
    animation-name: item-focused;
    animation-iteration-count: infinite;

    @keyframes item-focused {
      0% {
        filter: drop-shadow(transparent 0px 0px 0px);
      }

      50% {
        filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px);
      }
    }
  }

  :global(.item-normal) {
    filter: drop-shadow(rgba(0, 0, 0, 0.7) 3px 3px 3px);
  }
</style>