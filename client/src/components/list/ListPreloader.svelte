<script lang="ts">
  import {tick} from 'svelte';
  import NavigateList from './NavigateList.svelte';
  import {type MenuItem} from '../../modules/menu';

  export let style: string = '';
  export let current: boolean = false;
  export let visible: boolean = false;
  export let left: number = 0;
  export let delta: number = 0;
  export let itemSize: number;
  export let headersDummy: number = 0;
  export let paddingIndent: number = 0;
  export let itemSpace: number = 0;
  export let horizontal: boolean = true;
  export let model: MenuItem = undefined;

  let list: NavigateList;

  $: items = model?.items || [];
  $: model?.load().then(() => {
    if (items !== model.items) {
      items = model.items;
    }

    tick().then(() => {
      const index: number = list?.getIndex();
      list?.changeIndex(index);

      if (!visible) {
        visible = true;
      }
    });
  });

  export function getIndex(): number {
    return list?.getIndex() || 0;
  }

  export function setIndex(index: number): void {
    list?.setIndex(index);
  }

  export function changeIndex(index: number): void {
    list?.changeIndex(index);
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

  export function changeList(data: MenuItem, index: number) {
    model = data;
    setIndex(index);

    if (visible) {
      visible = false;
    }
  }
</script>

<div
  class="list"
  class:active={current}
  style="transform: translate({left - delta}px, 0px); opacity: {current && visible ? 1 : 0}; {style}"
>
  <NavigateList
    bind:this={list}
    {items}
    {itemSize}
    {headersDummy}
    {paddingIndent}
    {itemSpace}
    {horizontal}
  >
    <slot
      slot="item"
      name="item"
      let:index
      let:dummy
      let:position
      let:active
      let:jump
      let:item

      {index}
      {dummy}
      {position}
      {active}
      {jump}
      {item}
    />
  </NavigateList>
</div>

<style lang="less">
  .list {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.15s ease;
  }
</style>