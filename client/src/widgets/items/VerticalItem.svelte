<script lang="ts">
  import Gamepad from '../icons/Gamepad.svelte';
  import Settings from '../icons/Settings.svelte';
  import Layouts from '../icons/Layouts.svelte';
  import Prefix from '../icons/Prefix.svelte';
  import Updates from '../icons/Updates.svelte';
  import Build from '../icons/Build.svelte';
  import Database from '../icons/Database.svelte';
  import {MenuItem} from '../../modules/menu';
  import Plus from '../icons/Plus.svelte';

  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let item: MenuItem = undefined;
  export let dummy: boolean = false;
  export let click: (a: any) => void = () => null;
</script>

<div aria-hidden="true" class="item" on:click={click} style="opacity: {dummy ? 0 : 1};">
  <div class="item-icon">
    {#if item}
      {#if 'gamepad' === item.getIcon()}
        <Gamepad status={`item-${status}`} />
      {/if}
      {#if 'settings' === item.getIcon()}
        <Settings status={`item-${status}`} />
      {/if}
      {#if 'layouts' === item.getIcon()}
        <Layouts status={`item-${status}`} />
      {/if}
      {#if 'prefix' === item.getIcon()}
        <Prefix status={`item-${status}`} />
      {/if}
      {#if 'updates' === item.getIcon()}
        <Updates status={`item-${status}`} />
      {/if}
      {#if 'build' === item.getIcon()}
        <Build status={`item-${status}`} />
      {/if}
      {#if 'database' === item.getIcon()}
        <Database status={`item-${status}`} />
      {/if}
      {#if 'plus' === item.getIcon()}
        <Plus status={`item-${status}`} />
      {/if}
    {/if}
  </div>
  <div class="item-title" class:item-title-normal={'normal' === status}>
    {item?.title || ''}
  </div>
</div>

<style lang="less">
  .item {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 110px;
    padding: 8px 16px;
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
    width: 110px;
    height: 100%;

    transition: filter 0.6s;
    filter: drop-shadow(transparent 0px 0px 0px);
  }

  .item-title {
    display: flex;
    position: relative;
    flex: 1;
    height: 100%;
    padding-left: 20px;
    line-height: 1.5;
    font-size: 24px;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 400;
    filter: drop-shadow(rgba(0, 0, 0, 0.7) 4px 4px 2px);
    justify-content: left;
    align-items: center;
    text-align: left;
    vertical-align: center;
    transition: opacity ease 0.3s;
  }

  .item-title-normal {
    opacity: 0.3;
  }

  :global(.item-active) {
    transform: scale(1.3);
    filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 4px);
  }

  :global(.item-focused) {
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