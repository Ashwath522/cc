<template>
  <div class="acc-header" :class="isActive ? 'active' : 'inactive'">
    <div class="acc-text" @click="openAccordion">
      <div class="header-left">
        <progress-circle
          :stepNumber="stepNumber"
          :currentState="currentState"
        ></progress-circle>
        <div class="header-info">
          <span class="header-title">{{ title }}</span>
          <span class="header-sub-title">
            {{ subtitle }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <img
          :src="require('../../assets/svgs/chevron_up.svg')"
          alt="chevron_up-icon"
        />
      </div>
    </div>
    <div class="acc-partition" v-if="showPartition">
      <div class="verticle-line"></div>
      <div class="horizontal-line"></div>
    </div>
  </div>
</template>

<script>
import ProgressCircle from '../../components/common/ProgressCircle.vue';

export default {
  name: 'AccordionHeader',
  components: {
    ProgressCircle,
  },
  props: {
    stepNumber: {
      default: () => 1,
    },
    title: {
      type: String,
      default: () => '',
    },
    subtitle: {
      type: String,
      default: () => '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    showPartition: {
      type: Boolean,
      default: false,
    },
    currentState: {
      type: String,
      default: () => '',
    },
    openAccordion: {
      type: Function,
      default: () => {},
    },
  },
};
</script>

<style lang="less" scoped>
.acc-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  .header-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .header-title {
      font-size: 16px;
      line-height: 20.8px;
      font-weight: 600;
      color: #41434c;
    }
    .header-sub-title {
      font-weight: 400;
      font-size: 12px;
      line-height: 21px;
      color: #666666;
    }
  }
  .header-left {
    display: flex;
    gap: 16px;
  }
  .header-right {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }
}
.acc-partition {
  display: flex;
  .verticle-line {
    margin-left: 20px;
    height: 19px;
    width: 0px;
    border-left: 2px solid #e0e0e0;
  }
  .horizontal-line {
    flex: 1;
    border-top: 1px solid #e0e0e0;
    height: 0px;
    margin: 10px 0 0 10px;
  }
}
.acc-header.inactive {
  .acc-text {
    padding-bottom: 8px;
    .header-right {
      -webkit-transform: rotate(180deg);
      -moz-transform: rotate(180deg);
      -o-transform: rotate(180deg);
      transform: rotate(180deg);
      -webkit-transition-duration: 1s;
      -moz-transition-duration: 1s;
      -o-transition-duration: 1s;
      transition-duration: 1s;
    }
  }
}
</style>
