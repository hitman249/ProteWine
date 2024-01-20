<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let dummy: boolean = false;
  export let item: MenuItem = undefined;
</script>

<div aria-hidden="true" class="item" on:click={item?.click} style="opacity: {dummy ? 0 : 1};">
  <div class="item-icon">
    {#if item}
      <Icon icon={item?.getIcon()} bind:status />
    {/if}
  </div>
  <div class="item-title" class:item-title-active={'active' === status}>
    {item?.getTitle() || ''}
  </div>
</div>

<style lang="less">
  .item {
    display: flex;
    flex-direction: column;
    width: 170px;
    height: 170px;
    padding: 0;
    margin: 0;
    padding-top: 10px;
    box-sizing: border-box;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    color: #ffffff;
    cursor: pointer;
    -webkit-font-smoothing: antialiased;
    //border: 1px white solid;
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
    font-size: 18px;
    font-weight: 400;
    filter: drop-shadow(rgba(0, 0, 0, 0.7) 4px 4px 2px);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .item-title-active {
    opacity: 1;
  }
</style>