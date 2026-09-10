<template>
  <div v-bind:class="classObject">
    <div class="card-header">
      <slot name="card_header"></slot>
    </div>
    <div class="card-body">
      <div class="card-title">{{ cardTitle }}</div>
      <div class="card-description">{{ cardDescription }}</div>
      <slot></slot>
    </div>
    <div class="card-footer">
      <div class="card-footer-slot">
        <slot name="card_footer"></slot>
      </div>
      <span class="card-footer-btn" @click="handleNavigation">
        <img :src="require('../../assets/svgs/next.svg')" alt="continue-icon" />
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.card-container {
  margin: 24px 0;
  padding: 24px;
  background-color: #fff;
  border: 1px solid #f3f3f3;
  box-sizing: border-box;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  // width: 30%;
  &:hover {
    border: 1px solid #fff;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
  .card-header {
    margin-bottom: 24px;
  }
  .card-body {
    margin-bottom: 29px;
    flex-grow: 1;
  }
  .card-title {
    font-weight: 600;
    font-size: 15px;
    line-height: 21px;
    word-wrap: break-word;
    color: #41434c;
  }
  .card-description {
    margin-top: 8px;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: #828282;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .card-footer-slot {
      flex-grow: 1;
    }
    .card-footer-btn {
      // &:hover{
      //   border: 1px solid #41434c;
      //   box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      // }
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
}
.card-container-disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>

<script>
// import { getAppId, getCompany } from '@/utils'
import urlJoin from 'url-join';
import { getAppBasePath, getCompanyBasePath } from '../../helper/utils'; // eslint-disable-line no-unused-vars

export default {
  name: 'FeatureCard',
  data() {
    return {
      classObject: {
        'card-container': true,
        'card-container-disabled': this.disabled,
      },
    };
  },
  props: {
    cardTitle: String,
    cardDescription: String,
    cardNavUrl: String,
    cardNavRouteProps: Object,
    fromCompany: Boolean,
    disabled: Boolean,
  },
  methods: {
    handleNavigation() {
      if (this.fromCompany) {
        return this.$router.push({
          path: urlJoin(getCompanyBasePath(), this.cardNavUrl),
        });
      }
      this.$router.push({
        path: urlJoin(getAppBasePath(), this.cardNavUrl),
        params: { ...this.cardNavRouteProps },
      });
    },
  },
};
</script>
