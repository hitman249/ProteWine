<script lang="ts">
  export let infinite: boolean = false;
  export let value: number = 0;
  export let style: string = '';
</script>

<div class="progress" {style}>
  <div
    style={infinite ? '' : `width: ${value}%`}
    class="value {infinite ? 'animate' : ''}"
  />
</div>

<style lang="less">
  .progress {
    display: block;
    position: relative;
    margin-top: 10px;
    background-color: rgba(255, 255, 255, 40%);
    width: 80%;
    height: 6px;
    border-radius: 6px;
    border: rgba(255, 255, 255, 40%) 1px solid;
    overflow: hidden;
    box-sizing: border-box;
    transition: opacity 0.5s linear;
  }

  .value {
    top: 0;
    left: 0;
    display: block;
    content: '';
    position: absolute;
    height: 100%;
    background-color: #ffffff;
    transition: width 0.2s linear;
    contain: layout;
  }

  .animate {
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 100%) 30%, rgba(255, 255, 255, 100%) 70%, rgba(255, 255, 255, 0) 100%);
    animation: indeterminateAnimation 2s infinite linear;

    @keyframes indeterminateAnimation {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(calc(100% + 100% + 100% + 40%));
      }
    }
  }
</style>