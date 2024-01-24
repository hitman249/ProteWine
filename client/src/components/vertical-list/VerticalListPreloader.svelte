<script lang="ts">
import VerticalList from './VerticalList.svelte';
import VerticalItem from '../../widgets/items/VerticalItem.svelte';
import type {MenuItem} from '../../modules/menu';
import {tick} from 'svelte';

export let current: boolean = false;
export let left: number = 0;
export let delta: number = 0;
export let model: MenuItem = undefined;

let list: VerticalList;

$: items = model?.items || [];
$: model?.load().then(() => {
  if (items !== model.items) {
    items = model.items;
  }
});

export function getIndex(): number {
  return list?.getIndex() || 0;
}

export function keyDown(): void {
  list?.keyDown();
}

export function keyUp(): void {
  list?.keyUp();
}

export function getModel(): MenuItem {
  return model;
}

export function changeList(data: MenuItem, index: number) {
  model = data;
  tick().then(() => list?.changeIndex(index));
}
</script>

<div class="vertical-list" class:active={current} style="transform: translate({left - delta}px, 0px); opacity: {current ? 1 : 0};">
  <VerticalList {items} bind:this={list}>
    <div
      slot="item"
      class="vertical-item"
      class:active={active}
      let:index
      let:dummy
      let:y
      let:active
      let:jump
      let:item
      style="transform: translate(0px, {y}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
    >
      {#key y}
        <VerticalItem
          {dummy}
          {item}
          status={active ? 'focused' : 'normal'}
        />
      {/key}
    </div>
  </VerticalList>
</div>

<style lang="less">
  .vertical-list {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: calc(100% - 180px);
    height: 100%;
    transition: opacity 0.15s ease;
  }
</style>