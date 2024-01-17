<script lang="ts">
  import VirtualList from 'svelte-tiny-virtual-list';
  import VerticalList from '../components/vertical-list/VerticalList.svelte';
  import HorizontalItem from './items/HorizontalItem.svelte';
  import VerticalItem from './items/VerticalItem.svelte';
  import Menu, {type MenuItem} from '../modules/menu';

  let containerWidth: number = 0;
  let paddingLeftCategories: number = -(Menu.ROOT_ITEM_HEIGHT + 20);

  const menu: Menu = new Menu();
  const items: MenuItem[] = menu.getRoot();

  menu.setCurrentIndex(0);

  $: categories = menu.getCategories();
</script>

<div class="list-container" bind:clientWidth={containerWidth}>
  {#if containerWidth > 0}
    <VirtualList
      width={containerWidth - 650}
      height={`${Menu.ROOT_ITEM_HEIGHT}px`}
      itemSize={Menu.ROOT_ITEM_WIDTH}
      itemCount={items.length}
      scrollDirection="horizontal"
    >
      <div slot="item" let:index let:style {style}>
        <HorizontalItem
          status={menu.getCurrentIndex() === index ? 'active' : 'normal'}
          item={items[index]}
        />
      </div>
    </VirtualList>
  {/if}
</div>

<div class="vertical-lists">
  {#each categories as item}
    {@const current = item?.isActive()}
    {@const left = (((item?.getStackIndex() || 0) * Menu.ROOT_ITEM_WIDTH) + Menu.ROOT_ITEM_HEIGHT + (current ? 10 : 0)) + paddingLeftCategories}

    <div class="vertical-list" style="left: {left}px; opacity: {current ? 1 : 0};">
      <VerticalList items={item ? item.items : []}>
        <div
          slot="item"
          let:index
          let:dummy
          let:y
          let:active
          let:jump
          let:item
          class="vertical-item"
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
  {/each}
</div>

<style lang="less">
  .list-container {
    position: absolute;
    display: block;
    top: 110px;
    left: 0;
    width: 100%;
    height: 170px;
    z-index: 1;
    text-align: center;
    color: rgba(255, 255, 255, 0.15);
    font-size: 20px;
  }

  .vertical-lists {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
  }

  .vertical-list {
    position: absolute;
    display: block;
    top: 0;
    left: 180px;
    width: calc(100% - 180px);
    height: 100%;
  }

  .vertical-item {
    position: absolute;
    width: 100%;
  }

  :global(.virtual-list-wrapper) {
    margin: 0;
    padding-left: 150px;
    padding-right: 500px;
    overflow-x: hidden !important;
    overflow-y: hidden !important;
  }
</style>