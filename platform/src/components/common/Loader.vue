<template>
  <div class="loader-container">
    <img
      :src="require('../../assets/gifs/loader.gif')"
      alt="loader-animation"
    />
  </div>
</template>

<style lang="less" scoped>
.loader-container {
  display: flex;
  width: 100%;
  height: inherit;
  justify-content: center;
  align-items: center;
}
</style>

<script>
export default {
  name: 'Loader',
  props: {
    showLoader: Boolean,
  },
};
</script>
