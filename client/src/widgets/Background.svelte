<script lang="ts">
  const bg: number = Math.floor(Math.random() * 5);
</script>

<div class="bg-wrap">
  <div
    class="bg"
    class:bg0={bg === 0}
    class:bg1={bg === 1}
    class:bg2={bg === 2}
    class:bg3={bg === 3}
    class:bg4={bg === 4}
    class:bg5={bg === 5}
  />
</div>

<style lang="less">
  .bg-wrap {
    position: absolute;
    z-index: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .bg {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    position: absolute;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 */
    background-size: contain;
  }

  .bg0 {
    background-image: url('../assets/background/wave0.svg');
  }

  .bg1 {
    background-image: url('../assets/background/wave1.svg');
  }

  .bg2 {
    background-image: url('../assets/background/wave2.svg');
  }

  .bg3 {
    background-image: url('../assets/background/wave3.svg');
  }

  .bg4 {
    background-image: url('../assets/background/wave4.svg');
  }

  .bg5 {
    background-image: url('../assets/background/wave5.svg');
  }
</style>