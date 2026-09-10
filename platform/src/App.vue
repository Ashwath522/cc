<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style lang="less">
@import './../node_modules/@gofynd/nitrozen-vue/dist/nitrozen.css';

html,
body {
  margin: 0px !important;
  padding: 0px !important;
  height: 100%;
}

#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
  background-color: #f8f8f8;
  color: #2c3e50;
  padding: 24px;
  height: inherit;
}
</style>
