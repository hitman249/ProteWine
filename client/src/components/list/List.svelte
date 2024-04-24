<script lang="ts">
  import Menu, {MenuItem} from '../../modules/menu';
  import NavigateList from './NavigateList.svelte';
  import type {Dimension} from './index';
  import {StickerType} from '../../widgets/stickers';
  import Sticker from '../../widgets/stickers/Sticker.svelte';

  export let style: string = undefined;
  export let items: any[] = [];
  export let itemSize: number = Menu.ROOT_ITEM_WIDTH;
  export let horizontal: boolean = true;
  export let headersDummy: number = 1;
  export let type: StickerType = StickerType.MENU;
  export let itemCenter: boolean = false;
  export let itemSpace: number = 0;
  export let marginIndent: number = 0;
  export let paddingIndent: number = 0;
  export let extendItemClass: string = '';
  export let onScroll: (position: number, activeIndex: number) => void = undefined;


  let list: NavigateList;
  let listSize: Dimension;

  function updateSize(size: Dimension): void {
    if (!listSize) {
      listSize = size;
    }

    if (listSize.width !== size.width || listSize.height !== size.height) {
      listSize = size;
    }
  }

  export function scrollTo(position: number) {
    list?.scrollTo(position);
  }

  export function setDirection(value: boolean) {
    list?.setDirection(value);
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

  export function getItem(): any {
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
</script>

<NavigateList
  bind:this={list}
  {style}
  {onScroll}
  {headersDummy}
  {itemCenter}
  {itemSize}
  {itemSpace}
  {items}
  {marginIndent}
  {horizontal}
  {paddingIndent}
  {type}
  {updateSize}
>
  <Sticker
    slot="navigate-list-item"

    let:active
    let:index
    let:dummy
    let:item
    let:itemClass
    let:itemStyle
    let:percent
    let:type

    {index}
    {active}
    {dummy}
    {itemStyle}
    {item}
    {percent}
    {type}
    itemClass="{extendItemClass} {itemClass}"
  />
</NavigateList>