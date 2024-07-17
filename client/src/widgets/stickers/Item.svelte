<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let percent: number;
  export let item: MenuItem = undefined;

  $: descriptionExist = Boolean(item?.description || active && item?.value && item?.value?.isVisible());
</script>

<div aria-hidden="true" class="item {itemClass}" on:click={item?.click} {style} style:opacity={dummy ? 0 : 1}>
  <div class="icon">
    {#if item}
      <Icon
        icon={item?.getIcon()}
        status={active && percent > 90 ? 'focused' : 'normal'}
      />
    {/if}
  </div>
  <div class="footer" style:opacity={Math.max(percent / 100, 0.3)}>
    <div class="title" style:transform="translate(0px, {descriptionExist ? (20 - (20 * percent / 100)) + 10 : 32}px)">
      {#if 'layers' === item?.item?.type}
        {#if item?.item?.active}
          <svg class="svg-icon" style="width: 26px;height: 26px;vertical-align: middle;fill: #fff;overflow: hidden;top: -2px;position: relative;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M810.666 128H213.334C166.396 128 128 166.396 128 213.334v597.332C128 857.604 166.396 896 213.334 896h597.332C857.604 896 896 857.604 896 810.666V213.334C896 166.396 857.604 128 810.666 128z m-384 597.334L213.334 512l59.728-59.728 153.604 153.604 324.272-324.272 59.728 59.73-384 384z"  /></svg>
        {:else}
          <svg class="svg-icon" style="width: 26px;height: 26px;vertical-align: middle;fill: #fff;overflow: hidden;top: -2px;position: relative;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M810.666667 128H213.333333c-47.36 0-85.333333 37.973333-85.333333 85.333333v597.333334a85.333333 85.333333 0 0 0 85.333333 85.333333h597.333334a85.333333 85.333333 0 0 0 85.333333-85.333333V213.333333a85.333333 85.333333 0 0 0-85.333333-85.333333z" fill="" /></svg>
        {/if}
      {/if}

      {item?.title || ''}

      <div
        class="value"
        style:display={active && item?.value && item?.value?.isVisible() ? 'flex' : 'none'}
        style:opacity={percent / 100}
      >
        {item?.value?.getValueFormatted() || ''}
      </div>
    </div>
    <div
      class="description"
      class:exist={descriptionExist}
      style:transform="translate(0px, {40 - (20 * percent / 100)}px)"
      style:opacity={percent / 100}
    >
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

  .icon {
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

  .footer {
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
    align-items: start;
    text-align: left;
    vertical-align: center;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
  }

  .title {
    position: absolute;
    top: 0;
    display: block;
    width: calc(100% - 20px);
    height: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value {
    display: flex;
    position: absolute;
    width: 300px;
    height: 35px;
    right: 0;
    top: 0;
    font-size: 18px;
    justify-content: right;
    align-items: end;
  }

  .description {
    position: absolute;
    top: 30px;
    display: none;
    width: 100%;
    height: auto;
    margin-top: 4px;
    padding-top: 4px;
    font-size: 18px;
    border-top: rgb(255 255 255 / 40%) solid 1px;
    //filter: drop-shadow(rgba(0, 0, 0, 0.6) 0px 1px 1px);
  }
</style>