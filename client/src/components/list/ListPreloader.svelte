<script lang="ts">
  import {tick} from 'svelte';
  import {type MenuItem} from '../../modules/menu';
  import List from './List.svelte';
  import {StickerType} from '../../widgets/stickers';

  export let style: string = '';
  export let current: boolean = false;
  export let visible: boolean = false;
  export let left: number = 0;
  export let delta: number = 0;
  export let itemSize: number;
  export let headersDummy: number = 0;
  export let paddingIndent: number = 0;
  export let itemSpace: number = 0;
  export let itemCenter: boolean = false;
  export let horizontal: boolean = true;
  export let extendItemClass: string = '';
  export let type: StickerType = StickerType.ITEM;
  export let model: MenuItem = undefined;

  let list: List;

  $: items = model?.items || [];
  $: model?.load().then(() => {
    if (items !== model.items) {
      items = model.items;
    }

    tick().then(() => {
      const index: number = model?.getCurrentIndex();
      list?.changeIndex(index);

      if (!visible) {
        visible = true;
      }
    });
  });

  let prevItems: MenuItem[];

  $: {
    if (items !== prevItems && items.length > 0 && current) {
      prevItems = items;
      model?.getCurrentItem().updateFocusedItem();
    }
  }

  export function update(): void {
    items = items;
  }

  export function getIndex(): number {
    return list?.getIndex() || 0;
  }

  export function setIndex(index: number): void {
    list?.setIndex(index);
  }

  export function changeIndex(index: number): void {
    list?.changeIndex(index);
  }

  export function getItem(): MenuItem {
    return list?.getItem();
  }

  export function hasLeft(): boolean {
    return list?.hasLeft();
  }

  export function hasRight(): boolean {
    return list?.hasRight();
  }

  export function hasDown(): boolean {
    return list?.hasDown();
  }

  export function hasUp(): boolean {
    return list?.hasUp();
  }

  export function keyDown(): void {
    list?.keyDown();
  }

  export function keyUp(): void {
    list?.keyUp();
  }

  export function keyLeft(): void {
    list?.keyLeft();
  }

  export function keyRight(): void {
    list?.keyRight();
  }

  export function getModel(): MenuItem {
    return model;
  }

  export function changeList(list: MenuItem) {
    model = list;

    const focusedItem: MenuItem = list.getCurrentItem();

    if (!focusedItem) {
      return;
    }

    focusedItem.updateFocusedItem();

    changeIndex(focusedItem.index);

    if (visible) {
      visible = false;
    }
  }
</script>

<div
  class="list"
  class:active={current}
  class:list-transition={!Boolean(style)}
  style="transform: translate({left - delta}px, 0px); {style ? style : `opacity: ${current && visible ? 1 : 0};`}"
>
  <List
    bind:this={list}
    {items}
    {horizontal}
    {itemSize}
    {headersDummy}
    {paddingIndent}
    {itemSpace}
    {itemCenter}
    {extendItemClass}
    {type}
  />
</div>

<style lang="less">
  .list {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .list-transition {
    transition: opacity 0.15s ease;
  }
</style>