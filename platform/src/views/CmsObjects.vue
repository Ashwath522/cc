<template>
  <div class="cms-page">
    <div class="cms-page__inner">
      <div class="cms-page__header">
        <div>
          <h1 class="cms-page__title">{{ definition.name || 'Object instances' }}</h1>
          <p class="cms-page__subtitle">
            Manage content for <span class="cms-table__mono">{{ definition.slug || '—' }}</span>
          </p>
        </div>
        <div class="cms-actions">
          <button type="button" class="cms-btn cms-btn--secondary" @click="goBack">Back</button>
          <button
            v-if="!isEmbeddedOnlyDefinition"
            type="button"
            class="cms-btn cms-btn--primary"
            @click="createInstance"
          >
            New object
          </button>
        </div>
      </div>

      <div v-if="loading" class="cms-status">Loading…</div>
      <div v-else>
        <div v-if="isEmbeddedOnlyDefinition" class="cms-empty cms-card">
          This definition is an embedded object. Create or edit its data from parent object forms.
        </div>
        <div v-if="definition.fields.length" class="cms-filters">
          <h3>Filters</h3>
          <div class="cms-filter-grid">
            <div
              v-for="field in filterFields"
              :key="field.name"
              class="cms-filter-item"
            >
              <label>{{ field.label }}</label>
              <input
                v-if="field.field_type === 'text' || field.field_type === 'long_text'"
                v-model="filters[field.name]"
                placeholder="Search"
              />
              <input
                v-else-if="field.field_type === 'number'"
                type="number"
                v-model="filters[field.name]"
                placeholder="Value"
              />
              <input
                v-else-if="field.field_type === 'date'"
                type="date"
                v-model="filters[field.name]"
              />
              <input
                v-else-if="field.field_type === 'date_time'"
                type="datetime-local"
                v-model="filters[field.name]"
              />
              <input
                v-else-if="field.field_type === 'url' || field.field_type === 'json' || field.field_type === 'html'"
                v-model="filters[field.name]"
                type="text"
                placeholder="Search"
              />
              <input
                v-else-if="field.field_type === 'multiple_values'"
                v-model="filters[field.name]"
                type="text"
                placeholder="Value"
              />
              <select
                v-else-if="field.field_type === 'dropdown' || field.field_type === 'radio'
                  || field.field_type === 'checkbox'"
                v-model="filters[field.name]"
              >
                <option value="">Any</option>
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <input
                v-else-if="field.field_type === 'product' || field.field_type === 'collection' || field.field_type === 'custom_object'"
                v-model="filters[field.name]"
                type="text"
                :placeholder="filterPlaceholder(field)"
              />
            </div>
          </div>
          <div class="cms-actions" style="margin-top: 16px">
            <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" @click="fetchInstances">
              Apply filters
            </button>
          </div>
        </div>

        <BulkImportJobPanel
          v-if="!isEmbeddedOnlyDefinition && definition.fields.length && !loading"
          :slug="definition.slug"
          @import-complete="fetchInstances"
        />

        <div v-if="instances.length" class="cms-table-wrap">
          <table class="cms-table">
            <thead>
              <tr>
                <th>ID</th>
                <th v-for="field in definition.fields" :key="field.name">{{ field.label }}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in instances" :key="item._id">
                <td class="cms-table__mono">{{ item._id }}</td>
                <td v-for="field in definition.fields" :key="field.name">
                  {{ displayCellValue(item, field) }}
                </td>
                <td>
                  <div class="cms-row-actions">
                    <button
                      type="button"
                      class="cms-btn cms-btn--ghost cms-btn--sm"
                      @click="editInstance(item._id)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="cms-api-info-btn"
                      title="List API &amp; filters"
                      aria-label="Open list API and filter documentation"
                      @click.stop="openApiInfo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="cms-action-link cms-action-link--danger"
                      @click="openEntryDeleteModal(item._id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="!isEmbeddedOnlyDefinition" class="cms-empty cms-card">No objects found.</div>
      </div>
    </div>

    <CmsListApiModal
      :visible="apiInfoVisible"
      :definition="definition"
      @close="closeApiInfo"
    />

    <div
      v-if="entryDeleteModal.visible"
      class="entry-delete-overlay"
      role="presentation"
      @click.self="closeEntryDeleteModal"
    >
      <div class="entry-delete-modal" role="dialog" aria-modal="true" aria-labelledby="entry-delete-title">
        <header class="entry-delete-modal__header">
          <h2 id="entry-delete-title" class="entry-delete-modal__title">Delete entry</h2>
          <button type="button" class="entry-delete-modal__close" aria-label="Close" @click="closeEntryDeleteModal">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="entry-delete-modal__body">
          <p class="entry-delete-modal__text">
            Delete this entry permanently? This cannot be undone.
          </p>
          <p v-if="entryDeleteModal.id" class="entry-delete-modal__mono">ID: {{ entryDeleteModal.id }}</p>
        </div>
        <footer class="entry-delete-modal__footer">
          <button type="button" class="cms-btn cms-btn--secondary" @click="closeEntryDeleteModal">Cancel</button>
          <button
            type="button"
            class="cms-btn cms-btn--danger"
            :disabled="entryDeleteModal.loading"
            @click="confirmDeleteEntry"
          >
            Delete entry
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  listInstances,
  getDefinitionBySlug,
  deleteInstance,
} from '../services/objectInstance.service';
import CmsListApiModal from '../components/CmsListApiModal.vue';
import BulkImportJobPanel from '../components/BulkImportJobPanel.vue';

export default {
  name: 'CmsObjects',
  components: {
    CmsListApiModal,
    BulkImportJobPanel,
  },
  data() {
    return {
      definition: {
        fields: [],
        name: '',
        slug: '',
        usage_mode: 'standalone',
      },
      instances: [],
      filters: {},
      loading: false,
      entryDeleteModal: {
        visible: false,
        id: null,
        loading: false,
      },
      apiInfoVisible: false,
    };
  },
  computed: {
    filterFields() {
      return this.definition.fields.filter((field) => field.is_filterable);
    },
    isEmbeddedOnlyDefinition() {
      return this.definition.usage_mode === 'embedded_only';
    },
  },
  created() {
    this.loadDefinition();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'CmsDefinitions', params: this.$route.params });
    },
    async loadDefinition() {
      this.loading = true;
      try {
        const { slug } = this.$route.params;
        const response = await getDefinitionBySlug(slug);
        this.definition = response.data || this.definition;
        if (!this.isEmbeddedOnlyDefinition) {
          this.fetchInstances();
        }
      } catch (error) {
        this.definition = { fields: [], name: '', slug: '', usage_mode: 'standalone' };
      } finally {
        this.loading = false;
      }
    },
    async fetchInstances() {
      if (!this.definition.slug || this.isEmbeddedOnlyDefinition) {
        return;
      }
      this.loading = true;
      try {
        const params = { filter: this.filters };
        const response = await listInstances(this.definition.slug, params);
        this.instances = (response.data && response.data.items) || [];
      } catch (error) {
        this.instances = [];
      } finally {
        this.loading = false;
      }
    },
    createInstance() {
      this.$router.push({
        name: 'CmsObjectCreate',
        params: {
          ...this.$route.params,
          slug: this.definition.slug,
        },
      });
    },
    editInstance(id) {
      this.$router.push({
        name: 'CmsObjectEdit',
        params: {
          ...this.$route.params,
          slug: this.definition.slug,
          object_id: id,
        },
      });
    },
    openApiInfo() {
      this.apiInfoVisible = true;
    },
    closeApiInfo() {
      this.apiInfoVisible = false;
    },
    openEntryDeleteModal(id) {
      this.entryDeleteModal.visible = true;
      this.entryDeleteModal.id = id;
      this.entryDeleteModal.loading = false;
    },
    closeEntryDeleteModal() {
      this.entryDeleteModal.visible = false;
      this.entryDeleteModal.id = null;
      this.entryDeleteModal.loading = false;
    },
    async confirmDeleteEntry() {
      const id = this.entryDeleteModal.id;
      if (!id || !this.definition.slug) {
        return;
      }
      this.entryDeleteModal.loading = true;
      try {
        await deleteInstance(this.definition.slug, id);
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          Vue.snackbar.showSuccess('Entry deleted.');
        }
        this.closeEntryDeleteModal();
        await this.fetchInstances();
      } finally {
        this.entryDeleteModal.loading = false;
      }
    },
    filterPlaceholder(field) {
      if (field.field_type === 'product' || field.field_type === 'collection') {
        return 'UID or slug';
      }
      if (field.field_type === 'custom_object') {
        return 'Object id or name';
      }
      if (field.field_type === 'number') {
        return 'Value';
      }
      return 'Search';
    },
    displayCellValue(item, field) {
      const value = item[field.name];
      if (value == null || value === '') {
        return '';
      }
      if (field.field_type === 'date' || field.field_type === 'date_time') {
        const d = value instanceof Date ? value : new Date(value);
        if (!Number.isNaN(d.getTime())) {
          return field.field_type === 'date_time' ? d.toLocaleString() : d.toLocaleDateString();
        }
      }
      if (field.field_type === 'json') {
        if (Array.isArray(value)) {
          const s = value.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v)).join(', ');
          return s.length > 120 ? `${s.slice(0, 120)}…` : s;
        }
        if (typeof value === 'object' && value !== null) {
          const s = JSON.stringify(value);
          return s.length > 120 ? `${s.slice(0, 120)}…` : s;
        }
      }
      if (field.field_type === 'html' && typeof value === 'string' && value.length > 80) {
        return `${value.slice(0, 80)}…`;
      }
      if (field.field_type === 'custom_object') {
        const summarize = (v) => {
          if (!v || typeof v !== 'object') {
            return '';
          }
          const s = JSON.stringify(v);
          return s.length > 72 ? `${s.slice(0, 72)}…` : s;
        };
        if (Array.isArray(value)) {
          return value.map(summarize).filter(Boolean).join(' · ');
        }
        if (typeof value === 'object') {
          return summarize(value);
        }
      }
      if (field.field_type === 'product' || field.field_type === 'collection') {
        if (Array.isArray(value)) {
          return value
            .map((v) =>
              v && typeof v === 'object' ? v.name || v.title || v.slug || v.uid || '' : v,
            )
            .filter(Boolean)
            .join(', ');
        }
        if (typeof value === 'object' && value !== null) {
          return value.name || value.title || value.slug || value.uid || '';
        }
      }
      if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : v)).join(', ');
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    },
  },
};
</script>

<style scoped>
.entry-delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}

.entry-delete-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.entry-delete-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.entry-delete-modal__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.entry-delete-modal__close {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #475569;
}

.entry-delete-modal__body {
  padding: 16px 20px;
}

.entry-delete-modal__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
}

.entry-delete-modal__mono {
  margin: 12px 0 0;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #64748b;
  word-break: break-all;
}

.entry-delete-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px 18px;
  border-top: 1px solid #f1f5f9;
}
</style>
