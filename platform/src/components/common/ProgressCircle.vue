<template>
  <div class="progress-circle">
    <div class="outer-circle" :class="currentState">
      <div class="inner-circle">
        {{ stepNumber }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressCircle',
  props: {
    stepNumber: {
      default: () => 1,
    },
    currentState: {
      default: 'pending',
    },
  },
};
</script>

<style lang="less" scoped>
.progress-circle {
  display: flex;
  .outer-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #d6d6d6;
    padding: 2px;
    box-sizing: border-box;
    transform: rotate(45deg);

    &.partial {
      border-top-color: #219653;
      border-right-color: #219653;

      .inner-circle {
        background: #e7eeff;
      }
    }

    &.complete {
      border-color: #219653;

      .inner-circle {
        background: #e9f5ee;
      }
    }

    .inner-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      transform: rotate(-45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      line-height: 130%;
      background: #f5f5f5;
    }
  }
}
</style>
