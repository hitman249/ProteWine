<script lang="ts">
  import type {ValueType} from '../../modules/value';

  export let status: 'normal' | 'active' | 'focused' = 'normal';
  export let item: ValueType = undefined;
  export let dummy: boolean = false;
</script>

<div aria-hidden="true" class="item" class:focused={'focused' === status} style="opacity: {dummy ? 0 : 1};">
  {item?.title}
</div>

<style lang="less">
  .item {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 30px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;
    color: #ffffff;
    -webkit-font-smoothing: antialiased;
    //border: 1px white solid;
  }

  .focused {

  }
</style>