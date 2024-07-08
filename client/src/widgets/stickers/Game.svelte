<script lang="ts">
  import {MenuItem} from '../../modules/menu';
  import Icon from '../icons/Icon.svelte';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let percent: number;
  export let item: MenuItem = undefined;

  let size: {w: number, h: number} = {w: 0, h: 0};

  function onLoad(event: Event): void {
    const img: HTMLImageElement = event?.target as HTMLImageElement;

    if (img) {
      size = {w: img.width, h: img.height};
    }
  }
</script>

<div aria-hidden="true" class="item {itemClass}" class:focused={active} on:click={item?.click} {style} style:opacity={dummy ? 0 : 1}>
  <div class="icon">
    {#if item}
      {#if item.poster}
        <img
          class="poster"
          style="transform: scale({(100 + percent * ((160 - size.w) / size.w)) / 100})"
          style:opacity={Math.max(percent / 100, 0.2)}
          src={'local://' + item.poster + `?t=${new Date().getTime()}`}
          alt=""
          on:load={onLoad}
        >
      {:else}
        <Icon
          icon="dice"
          style="transform: scale({(100 + percent) / 100}); opacity: {Math.max(percent / 100, 0.2)};"
        />
      {/if}
    {/if}
  </div>
  <div class="footer" style:opacity={percent / 100}>
    <div class="title">
      {item?.title || ''}

      <div class="value" style:display={active && item?.value && item?.value?.isVisible() ? 'flex' : 'none'}>
        {item?.value?.getValueFormatted() || ''}
      </div>
    </div>
    <div class="description" class:exist={Boolean(item?.description || active && item?.value && item?.value?.isVisible())}>
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

    &.focused {
      .title {
        transition: text-shadow 1.2s;
        animation-delay: 0.3s;
        animation-duration: 1.2s;
        animation-name: title-focused;
        animation-iteration-count: infinite;

        @keyframes title-focused {
          0% {
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
          }

          50% {
            text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.5);
          }

          100% {
            text-shadow: 0 0 10px rgba(255,255,255,0.5);
          }
        }
      }
    }
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
    //filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
    //opacity: 0;
    //transition: opacity ease 0.3s;

    //&.focused {
    //  opacity: 1;
    //}
  }

  .title {
    position: relative;
    display: flex;
    width: 100%;
    height: auto;
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