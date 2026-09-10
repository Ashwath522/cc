<template>
  <div class="pane-container">
    <div class="pane-header">
      <div class="pane-title">
        <span>{{ paneTitle }}</span>
        <slot name="pane_header"></slot>
      </div>
      <div class="pane-description">{{ paneDescription }}</div>
    </div>
    <div class="[{paneDescription ? pane-body : null}]">
      <slot name="pane_body"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pane',
  props: {
    paneTitle: String,
    paneDescription: String,
  },
};
</script>

<style lang="less" scoped>
.pane-container {
  padding: 24px;
  margin: 24px 0;
  border-radius: 12px;
  background-color: #fff;
  height: inherit;
  .pane-header {
    .pane-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .pane-description {
      font-weight: 400;
      font-size: 12px;
    }
  }
  .pane-body {
    margin-top: 24px;
  }
}
</style>
