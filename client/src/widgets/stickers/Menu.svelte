<script lang="ts" context="module">
  function styleIcon(active: boolean, percent: number, dummy: boolean): string {
    if (!active || dummy) {
      return 'transform: scale(0.75)';
    }

    return `transform: scale(${0.75 + (Math.trunc(650 / 100 * percent) / 1000)})`;
  }
</script>
<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let item: MenuItem = undefined;
  export let percent: number;

  let iconStyle: string = '';

  $: {
    let newStyle: string = styleIcon(active, percent, dummy);

    if (iconStyle !== newStyle) {
      iconStyle = newStyle;
    }
  }
</script>

<div aria-hidden="true" class="item {itemClass}" on:click={item?.click} {style} style:opacity={dummy ? 0 : 1}>
  <div class="icon">
    {#if item}
      <Icon icon={item?.getIcon()} status={active ? 'active' : 'normal'} style={iconStyle}/>
    {/if}
  </div>
  <div class="title" style:opacity={percent / 100}>
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

  .icon {
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

  .title {
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
  }
</style>