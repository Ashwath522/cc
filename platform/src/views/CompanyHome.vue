<template>
  <div>
    <breadcrumb class="breadcrumbs" :navigations="navs"></breadcrumb>
    <div class="apps-container">
      <pane
        :paneTitle="'Sales Channel'"
        :paneDescription="'These are the available sales channels for your company.'"
      >
        <template v-slot:pane_body>
          <loader v-if="showLoader" />
          <div v-else>
            <div class="topbar">
              <nitrozen-input
                :type="'text'"
                @input="getSalesChannelSearchInput"
                :showSearchIcon="true"
                :placeholder="'Search Sales Channels'"
                v-model="salesChannelSearchInput"
                class="sales-channel-search-bar"
              >
              </nitrozen-input>
            </div>
            <div v-if="showEmptyImage" class="empty-image-view">
              <img src="../assets/pngs/empty_state.png" alt="empty-view" />
              <span>No results found</span>
            </div>
            <div
              v-else
              class="grid-container"
              :style="{ 'grid-template-columns': gridTemplateColumns }"
            >
              <feature-card
                v-for="item in paginatedItems"
                :key="item.id"
                :fromCompany="true"
                :cardNavUrl="`application/${item.id}/cms/definitions`"
                :cardNavRouteProps="item"
                :cardTitle="item.name"
              >
                <template v-slot:card_header>
                  <img
                    class="feature-card-img"
                    :src="
                      item.favicon && item.favicon.secure_url !== ''
                        ? item.favicon.secure_url
                        : require('../assets/pngs/image-gallery.png')
                    "
                    alt="app-favicon"
                  />
                </template>
                <template v-slot>
                  <a
                    class="feature-card-link"
                    :href="`http://${item.domain.name}`"
                    target="_blank"
                    ref="no-referrer"
                    >{{ item.domain.name }}</a
                  >
                </template>
              </feature-card>
            </div>
            <div>
              <nitrozen-pagination
                name="Pages"
                v-model="paginationConfig"
                @change="paginationChange"
                :pageSizeOptions="[5, 10, 20, 50]"
              ></nitrozen-pagination>
            </div>
          </div>
        </template>
      </pane>
    </div>
  </div>
</template>

<script>
import {
  NitrozenInput,
  NitrozenDropdown,
  NitrozenPagination,
  NitrozenBadge,
} from '@gofynd/nitrozen-vue';
import { getCompanySalesChannels } from '../services/companyhome.service';
import FeatureCard from '../components/common/FeatureCard.vue';
import Loader from '../components/common/Loader.vue';
import Breadcrumb from '../components/common/Breadcrumb.vue';
import Pane from '../components/common/Pane.vue';

const NAVS = [
  {
    title: 'Extensions',
  },
  { title: `CMS`, link: `/` },
];

export default {
  name: 'CompanyHome',
  components: {
    FeatureCard,
    NitrozenInput,
    NitrozenDropdown,
    NitrozenPagination,
    Breadcrumb,
    NitrozenBadge,
    Loader,
    Pane,
  },
  data() {
    return {
      navs: NAVS,
      companyId: this.$route.params.company_id,
      appsData: [],
      filteredItems: [],
      paginatedItems: [],
      salesChannelSearchInput: '',
      showLoader: true,
      showEmptyImage: false,
      paginationConfig: {
        limit: 10,
        current: 1,
        total: 45,
      }
    };
  },
  methods: {
    paginationChange(e) {
      let { current, limit } = e;
      this.paginatedItems = this.appsData.slice(
        (current - 1) * limit,
        current * limit,
      );
      this.filteredItems = this.paginatedItems;
    },
    getSalesChannelSearchInput() {
      if (this.salesChannelSearchInput.length === '') {
        this.paginatedItems = this.filteredItems;
      } else {
        this.paginatedItems = this.appsData.filter((item) =>
          item.name
            .toLowerCase()
            .includes(this.salesChannelSearchInput.toLowerCase()),
        );
      }
    },
  },
  created() {
    getCompanySalesChannels()
      .then((response) => {
        let { current, limit } = this.paginationConfig;
        // this.appsData = response.data
        this.appsData = response.data.items;
        this.paginationConfig.total = this.appsData.length;
        this.paginatedItems = this.appsData.slice(
          (current - 1) * limit,
          current * limit,
        );
        this.filteredItems = this.paginatedItems;
        this.showLoader = false;
      })
      .catch((error) => {
        //this.$snackbar.global.showError(error.message);
      });
  },
  computed: {
    gridTemplateColumns() {
      let itemCount = this.paginatedItems.length < 4 ? 4 : 'auto-fit';
      return `repeat(${itemCount}, minmax(240px, 1fr))`;
    },
  },
};
</script>

<style lang="less" scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}
.filter-dropdown-container {
  // width: 20%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 30%;
  .filter-dropdown {
    width: 70%;
  }
}
.topbar-text {
  font-size: 0.8em;
  color: #41434c;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  // grid-template-columns: repeat(4,1fr);
  // grid-template-columns: repeat(5, minmax(0, 1fr));
  // grid-auto-rows: 1fr;
  column-gap: 24px;
}
.apps-container {
  height: 80%;
}

.feature-card-img {
  width: 40px;
  height: 40px;
}
.empty-image-view {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.feature-card-link {
  font-size: 0.8em;
  color: #808080;
  text-decoration: none;
}
</style>
