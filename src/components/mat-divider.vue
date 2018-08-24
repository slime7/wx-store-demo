<template>
  <div class="mat-divider"></div>
</template>

<script>
  export default {
    name: 'MatDivider',
  };
</script>

<style scoped lang="less">
  @import '../assets/style/variable';

  .mat-divider {
    display: block;
    margin: 0;
    width: 100%;
    border-top: 1px solid rgba(0, 0, 0, .12);
  }
</style>