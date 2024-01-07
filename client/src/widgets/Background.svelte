<script lang="ts">
  const bg: number = Math.floor(Math.random() * 5);
</script>

<div
  class="bg"
  class:bg0={bg === 0}
  class:bg1={bg === 1}
  class:bg2={bg === 2}
  class:bg3={bg === 3}
  class:bg4={bg === 4}
  class:bg5={bg === 5}
/>

<style lang="less">
  .bg {
    position: absolute;
    z-index: 0;
    background-size: cover;
    width: 100vw;
    height: 100vh;
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