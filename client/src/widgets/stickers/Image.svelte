<script lang="ts">
  import Icon from '../icons/Icon.svelte';
  import Image from '../../models/image';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let percent: number;
  export let item: Image = undefined;
</script>

<div aria-hidden="true" class="item {itemClass}" {style} style:opacity={dummy ? 0 : 1}>
  {#if item?.isFile()}
    <div class="icon" class:focused={active} style="transform: scale({1.3 + (0.5 * percent / 100)})">
      <Icon
        icon={'plus'}
        style="position: relative; left: -12px;"
        status={active && percent > 90 ? 'focused' : 'normal'}
      />
    </div>

    <div class="footer" style:opacity={Math.max(percent / 100, 0.3)}>
      <p class="title">Select image</p>
    </div>
  {:else}
    <div class="icon" class:focused={active} style="transform: scale({1.3 + (0.5 * percent / 100)})">
      <img
        class="poster"
        src={item?.thumb || ''}
        alt=""
      >
    </div>
  {/if}
</div>

<style lang="less">
  .item {
    display: flex;
    flex-direction: column;
    width: 210px;
    height: 210px;
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
    width: 210px;
    height: 100%;
    //transition: transform 0.4s, opacity 0.3s;
    //transform: scale(1);
    //opacity: 0.2;

    img {
      position: absolute;
      margin: auto;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 2px;
      border-width: 1px;
      border-color: white;
      border-style: solid;
    }

    &.focused {
      img {
        transition: box-shadow 1.2s;
        animation-delay: 0.3s;
        animation-duration: 1.2s;
        animation-name: item-focused;
        animation-iteration-count: infinite;

        @keyframes item-focused {
          0% {
            box-shadow: 0 0 10px 0 rgba(255, 255, 255, 0.1);
          }

          50% {
            box-shadow: 0 0 10px 0 rgba(255, 255, 255, 1);
          }

          100% {
            box-shadow: 0 0 10px 0 rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
  }

  .poster {
    display: block;
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  .footer {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    width: 100%;
    line-height: 1.5;
    font-size: 24px;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 400;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: center;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
    //opacity: 0;
    //transition: opacity ease 0.3s;

    //&.focused {
    //  opacity: 1;
    //}
  }
</style>