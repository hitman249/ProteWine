<script lang="ts">
  import VirtualList from 'svelte-tiny-virtual-list';
  import VerticalList from '../components/vertical-list/VerticalList.svelte';
  import HorizontalItem from './items/HorizontalItem.svelte';
  import VerticalItem from './items/VerticalItem.svelte';

  type MenuItem = {
    id: string,
    title: string,
  };

  let data: MenuItem[] = [
    {
      id: 'gamepad',
      title: 'Games',
    },
    {
      id: 'prefix',
      title: 'Prefix',
    },
    {
      id: 'layouts',
      title: 'Layouts',
    },
    {
      id: 'updates',
      title: 'Updates',
    },
    {
      id: 'database',
      title: 'Database',
    },
    {
      id: 'settings',
      title: 'Settings',
    },
    {
      id: 'build',
      title: 'Build',
    },
  ];

  data = [...data, ...data, ...data, ...data].map((v: any, index: number) => Object.assign({}, v, {key: index}));

  let containerWidth: number = 0;
  let containerHeight: number = 0;
</script>

<div class="list-container"
     bind:clientWidth={containerWidth}
     bind:clientHeight={containerHeight}>
  {#if containerWidth > 0}
    <VirtualList
      width={containerWidth - 650}
      height="170px"
      itemCount={data.length}
      itemSize={200}
      scrollDirection="horizontal"
    >
      <div slot="item" let:index let:style {style}>
        <HorizontalItem
          status={0 === index ? 'active' : 'normal'}
          title={data[index].title}
          icon={data[index].id}
        />
      </div>
    </VirtualList>
  {/if}
</div>

<div class="vertical-list">
  <VerticalList items={data} >
    <div
      slot="item"
      let:index
      let:dummy
      let:y
      let:active
      let:jump
      let:item
      let:scrollTop
      class="vertical-item"
      style="transform: translate(0px, {y}px); {jump ? 'transition: transform ease 0.2s;' : ''}"
    >
      {#if scrollTop >= 1124 && scrollTop <= 1210}
        <!--{@debug index, jump}-->
      {/if}

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

  .vertical-list {
    position: absolute;
    display: block;
    top: 0;
    left: 180px;
    width: calc(100% - 180px);
    height: 100%;
    z-index: 0;
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