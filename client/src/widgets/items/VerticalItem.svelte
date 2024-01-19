<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let item: MenuItem = undefined;
  export let dummy: boolean = false;
  export let click: (a: any) => void = () => null;
</script>

<div aria-hidden="true" class="item" on:click={click} style="opacity: {dummy ? 0 : 1};">
  <div class="item-icon">
    {#if item}
      <Icon icon={item?.getIcon()} bind:status />
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
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
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
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
    justify-content: left;
    align-items: center;
    text-align: left;
    vertical-align: center;
    transition: opacity ease 0.3s;
  }

  .item-title-normal {
    opacity: 0.3;
  }
</style>