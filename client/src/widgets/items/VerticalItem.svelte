<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let active: boolean = false;
  export let item: MenuItem = undefined;
  export let dummy: boolean = false;
  export let click: (a: any) => void = () => null;
</script>

<div aria-hidden="true" class="item" on:click={click} style="opacity: {dummy ? 0 : 1};">
  <div class="item-icon">
    {#if item}
      <Icon icon={item?.getIcon()} status={active ? 'focused' : 'normal'} />
    {/if}
  </div>
  <div class="item-footer" class:title-normal={!active}>
    <div class="item-title">
      {item?.title || ''}
    </div>
    <div class="item-description" class:exist={Boolean(item?.description)}>
      {item?.description || ''}
    </div>
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

  .item-footer {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    height: 100%;
    padding-left: 20px;
    line-height: 1.5;
    font-size: 24px;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 400;
    justify-content: center;
    align-items: center;
    text-align: left;
    vertical-align: center;
    transition: opacity ease 0.3s;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
  }

  .item-title {
    display: flex;
    width: 100%;
    height: auto;
  }

  .item-description {
    display: none;
    width: 100%;
    height: auto;
    margin-top: 4px;
    padding-top: 4px;
    font-size: 16px;
    border-top: rgb(255 255 255 / 40%) solid 1px;
    //filter: drop-shadow(rgba(0, 0, 0, 0.6) 0px 1px 1px);
  }

  .title-normal {
    opacity: 0.3;
  }
</style>