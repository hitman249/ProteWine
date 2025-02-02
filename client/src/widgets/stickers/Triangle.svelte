<script lang="ts">
  import type {MenuItem} from '../../modules/menu';
  import Helpers from '../../modules/helpers';

  export let style: string;
  export let itemClass: string;
  export let active: boolean = false;
  export let dummy: boolean = false;
  export let percent: number;
  export let direction: boolean;
  export let item: MenuItem = undefined;

  function modifyStyle(percent: number, style: string = ''): string {
    const fixStyle: {[field: string]: string} = Helpers.parseStyles(style);
    const translate: number[] = Helpers.parseTransformTranslate(fixStyle['transform']);
    fixStyle['transform'] = `translate(${translate[0]}px, ${translate[1] + (10 * percent / 100)}px)`;

    return Object.keys(fixStyle).map((field: string) => `${field}: ${fixStyle[field]}`).join(';');
  }
</script>

<div class="item" style={modifyStyle(percent, style)} style:opacity={dummy ? 0 : (Math.max(percent / 100, 0.3))}>
  <div aria-hidden="true" class="triangle" class:focused={percent >= 60} style:transform="scale({1 + (0.6 * percent / 100) - 0.4})">
    <div class="layer1" style:background-image="url('{item?.poster}')" />
    <div class="layer2" style:background-image="url('{item?.poster}')" />
    <div class="layer3" />
    <div class="layer4" />
  </div>

  <div class="title ellipsis" style:opacity={dummy ? 0 : percent / 100}>
    {item?.getTitle()}
  </div>
</div>

<style lang="less">
  .item {
    display: flex;
    flex-direction: row;
    position: absolute;
    width: 100%;
    height: 200px;
    padding-left: 50px;
  }

  .title {
    display: block;
    position: relative;
    top: 30%;
    height: 60px;
    width: calc(100% - 300px);
    padding-left: 40px;
    color: #ffffff;
    font-size: 26px;
    font-weight: 400;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 4px 4px 2px);
  }

  .triangle {
    position: relative;
    --size: 200px;
    //filter: drop-shadow(0 6px 7px #2774ff);
    width: var(--size);
    height: var(--size);
    flex-shrink: 0;
  }

  .layer1 {
    position: absolute;
    top: 0;
    left: 0;
    clip-path: url(#svgPath);
    width: var(--size);
    height: var(--size);
    background-size: cover;
    background-position: center;
    filter: blur(10px) brightness(2.0);
  }

  .layer2 {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc(var(--size) - 6px);
    height: calc(var(--size) - 6px);
    clip-path: url(#svgPath);
    background-size: cover;
    background-position: center;
    background-color: rgb(131, 131, 131);
  }

  .layer3 {
    position: absolute;
    top: 12px;
    left: 108px;
    width: calc(var(--size) - 146px);
    height: calc(var(--size) - 50px);
    clip-path: url(#svgPath);
    background: linear-gradient(64deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 100%);
    transform: skewX(-159deg);
  }

  .layer4 {
    position: absolute;
    top: 28px;
    left: 25px;
    width: calc(var(--size) - 183px);
    height: calc(var(--size) - 80px);
    clip-path: url(#svgPath);
    background: linear-gradient(64deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%);
    transform: skewX(-206deg);
  }

  .triangle.focused {
    animation-duration: 1.2s;
    animation-name: triangle-focused;
    animation-iteration-count: infinite;

    @keyframes triangle-focused {
      0% {
        filter: drop-shadow(transparent 0px 0px 0px);
      }

      50% {
        filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px) drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 6px);
      }
    }
  }
</style>