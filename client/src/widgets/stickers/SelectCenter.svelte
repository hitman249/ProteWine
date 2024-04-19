<script lang="ts">
  import type {ValueType} from '../../modules/value';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let item: any | ValueType = undefined;
  export let percent: number;
  export let index: number;
  export let dummy: boolean = false;
</script>

<div aria-hidden="true" class="item-wrap" style:opacity={dummy ? 0 : 1}>
  <div aria-hidden="true" class="item {itemClass}" class:focused={active} {style}>
    <p class="title">{item?.title || ''}</p>
  </div>
</div>

<style lang="less">
  .item-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 35px;
  }

  .item {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 25px;
    font-size: 17px;
    width: auto;
    height: 35px;
    margin: 0;
    box-sizing: border-box;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    color: #ffffff;
    -webkit-font-smoothing: antialiased;
    //border: 1px white solid;

    &:after {
      content: '';
      display: flex;
      position: absolute;
      top: 0;
      left: -50px;
      width: calc(100% + 100px);
      height: 100%;
    }
  }

  .title {
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 3px 3px 3px);
  }

  .focused:after {
    transition: box-shadow 0.2s;
    animation-duration: 1.2s;
    animation-name: item-focused;
    animation-iteration-count: infinite;

    @keyframes item-focused {
      0% {
        box-shadow: inset 0 0 20px 0 rgba(255,255,255,0.8);
      }

      70% {
        box-shadow: inset 0 0 20px 0 rgba(255,255,255,0.1);
      }

      100% {
        box-shadow: inset 0 0 20px 0 rgba(255,255,255,0.8);
      }
    }
  }
</style>