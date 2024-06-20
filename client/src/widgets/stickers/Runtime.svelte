<script lang="ts">
  import Icon from '../icons/Icon.svelte';
  import {FileType} from '../../models/file';
  import type {ItemType} from '../../../../server/modules/repositories';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let percent: number;
  export let item: ItemType = undefined;

  $: descriptionExist = false;
</script>

<div aria-hidden="true" class="item {itemClass}" {style} style:opacity={dummy ? 0 : 1}>
  <div class="icon" style:transform="scale({1 + (0.3 * percent / 100)})">
    {#if item}
      <Icon
        icon={'file' === item.type ? FileType.ARCHIVE : FileType.DIRECTORY}
        status={active && percent > 90 ? 'focused' : 'normal'}
      />
    {/if}
  </div>
  <div class="footer" style:opacity={Math.max(percent / 100, 0.3)}>
    <div class="title" style:transform="translate(0px, {descriptionExist ? (22 - (22 * percent / 100)) + 10 : 32}px)">
      {item?.name}
    </div>
    <div
      class="description"
      class:exist={descriptionExist}
      style:transform="translate(0px, {40 - (20 * percent / 100)}px)"
      style:opacity={percent / 100}
    >

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
    flex-shrink: 0;
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
    font-size: 16px;
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
    font-size: 16px;
    border-top: rgb(255 255 255 / 40%) solid 1px;
    //filter: drop-shadow(rgba(0, 0, 0, 0.6) 0px 1px 1px);
  }
</style>