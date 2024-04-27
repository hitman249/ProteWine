<script lang="ts">
  import type {ValueType} from '../../modules/value';

  export let style: string;
  export let itemClass: string;
  // export let active: boolean = false;
  export let item: string = undefined;
  export let percent: number;
  export let dummy: boolean = false;

  type ColorType = {
    color: string,
    textShadow: string,
  };

  const defaultColor: ColorType = {
    color: 'white',
    textShadow: '',
  };

  function getColor(item: string): ColorType {
    if (!item) {
      return defaultColor;
    }

    if (-1 !== item.indexOf(':err:')) {
      return {
        // color: 'rgb(255,241,0)',
        color: 'rgb(247,255,0)',
        textShadow: '0 0 2px red',
      };
    }

    if (-1 !== item.indexOf(':fixme:') || -1 !== item.indexOf('ATTENTION:') || -1 !== item.indexOf('esync:')) {
      return {
        color: 'rgba(255,255,255,1)',
        textShadow: '',
      };
    }

    return defaultColor;
  }

  $: color = getColor(item);
</script>

<div
  aria-hidden="true"
  class="item {itemClass}"
  style:opacity={dummy ? 0 : 1}
  style:border-bottom="1px solid rgba(255,255,255, {(0.5 * percent / 100)})"
  style:color="{color.color}"
  style:text-shadow="{color.textShadow}"
  {style}
>
  {item || ''}
</div>

<style lang="less">
  .item {
    position: absolute;
    display: block;
    padding: 0;
    font-size: 17px;
    width: 100%;
    height: 30px;
    margin: 0;
    box-sizing: border-box;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    border-bottom: 1px solid rgba(255,255,255,0);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>