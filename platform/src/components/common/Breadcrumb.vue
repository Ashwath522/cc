<template>
  <div class="breadcrumb-block">
    <div
      v-for="(navigation, index) in navigations"
      :key="index"
      class="breadcrumb"
    >
      <div
        :class="[
          { 'breadcrumb-title-minor': index != navigations.length - 1 },
          { 'breadcrumb-title-major': index == navigations.length - 1 },
        ]"
        @click="
          () =>
            index != navigations.length - 1 && handleNavigation(navigation.link)
        "
      >
        {{ navigation.title }}
        <p class="breadcrumb-icon" v-if="index != navigations.length - 1">></p>
      </div>
    </div>
  </div>
</template>

<script>
import { getCompanyBasePath } from '../../helper/utils'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';
export default {
  name: 'Breadcrumb',
  props: {
    navigations: {
      default: () => [],
    },
  },
  components: {},
  computed: {},
  methods: {
    mounted() {},
    handleNavigation(link = '') {
      this.$router.push({
        path: urlJoin(`${getCompanyBasePath()}${link}`),
      });
    },
  },
};
</script>

<style lang="less">
.breadcrumb-block {
  display: flex;
  .breadcrumb {
    .breadcrumb-title-minor {
      font-family: Inter;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 17px;
      opacity: 0.3;
      color: #393939;
      cursor: pointer;
    }
    .breadcrumb-title-major {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-size: 12px;
      line-height: 17px;
      text-transform: capitalize;
      color: #333333;

      opacity: 0.7;
    }
    .breadcrumb-icon {
      display: inline;
      margin: 0px 12px;
      font-size: 12px;
      color: #000000;
      opacity: 0.3;
    }
  }
}
</style>
