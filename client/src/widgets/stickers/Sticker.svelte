<script lang="ts" context="module">
  import {StickerType} from './index';

  function styleToString(style: {}, active: boolean, percent: number, dummy: boolean): string {
    const opacity: string = `opacity: ${dummy ? 0 : 1}`;

    if (dummy) {
      return `transform: translate(-1000px, -1000px); ${opacity}`;
    }

    const result: string[] = Object.keys(style).map((field: string) => {
      if ("transform" === field && active) {
        return `${field}: ${style[field]}`;
      }

      if (!style[field]) {
        return "";
      }

      return `${field}: ${style[field]}`;
    });

    result.push(opacity);

    return result.join(";");
  }

  function isGame(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.GAME === type;
  }

  function isMenu(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.MENU === type;
  }

  function isSelect(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.SELECT === type;
  }

  function isSelectCenter(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.SELECT_CENTER === type;
  }

  function isItem(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.ITEM === type;
  }

  function isFile(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.FILE === type;
  }

  function isOperation(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.OPERATION === type;
  }

  function isLog(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.LOG === type;
  }

  function isLink(type: StickerType): boolean {
    if (!type) {
      return false;
    }

    return StickerType.LINK === type;
  }
</script>
<script lang="ts">
  import type {MenuItem} from '../../modules/menu';
  import Game from './Game.svelte';
  import Menu from './Menu.svelte';
  import Select from './Select.svelte';
  import SelectCenter from './SelectCenter.svelte';
  import Item from './Item.svelte';
  import File from './File.svelte';
  import Operation from './Operation.svelte';
  import Log from './Log.svelte';
  import Link from './Link.svelte';

  export let active: boolean;
  export let dummy: boolean;
  export let percent: number;
  export let type: StickerType;
  export let item: MenuItem | any;
  export let itemClass: string = '';
  export let itemStyle: {};

  let style: string = '';

  $: {
    let newStyle: string = styleToString(itemStyle, active, percent, dummy);

    if (style !== newStyle) {
      style = newStyle;
    }
  }
</script>

{#if isGame(type)}
  <Game
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isMenu(type)}
  <Menu
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isSelect(type)}
  <Select
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isSelectCenter(type)}
  <SelectCenter
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isItem(type)}
  <Item
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isFile(type)}
  <File
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isOperation(type)}
  <Operation
    {active}
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isLog(type)}
  <Log
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{:else if isLink(type)}
  <Link
    {dummy}
    {itemClass}
    {item}
    {percent}
    {style}
  />
{/if}
