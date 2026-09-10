<template>
  <div class="cms-page">
    <div class="cms-page__inner">
      <div class="cms-page__header">
        <div>
          <h1 class="cms-page__title">Object definitions</h1>
          <p class="cms-page__subtitle">
            Define schemas for structured content, publish when ready, and manage entries per type.
          </p>
        </div>
        <div class="cms-actions">
          <button type="button" class="cms-btn cms-btn--secondary" @click="goBack">Back</button>
          <button type="button" class="cms-btn cms-btn--primary" @click="goToCreate">Create definition</button>
        </div>
      </div>

      <div class="cms-stat-grid">
        <div class="cms-stat">
          <span class="cms-stat__label">Definitions</span>
          <span class="cms-stat__value">{{ definitions.length }}</span>
        </div>
        <div class="cms-stat">
          <span class="cms-stat__label">Published</span>
          <span class="cms-stat__value">{{ publishedCount }}</span>
        </div>
        <div class="cms-stat">
          <span class="cms-stat__label">Draft</span>
          <span class="cms-stat__value">{{ draftCount }}</span>
        </div>
      </div>

      <div v-if="loading" class="cms-status">Loading definitions…</div>
      <div v-else>
        <div v-if="definitions.length" class="cms-table-wrap">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Version</th>
                <th>Fields</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="definition in definitions" :key="definition._id">
                <td>
                  <div class="cms-name-cell">
                    <strong>{{ definition.name }}</strong>
                    <button
                      type="button"
                      class="cms-api-info-btn"
                      title="List API &amp; filters"
                      aria-label="Open list API and filter documentation"
                      @click.stop="openApiInfo(definition)"
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
                  </div>
                </td>
                <td class="cms-table__mono">{{ definition.slug }}</td>
                <td>
                  <span
                    class="cms-badge"
                    :class="definition.status === 'PUBLISHED' ? 'cms-badge--published' : 'cms-badge--draft'"
                  >
                    {{ definition.status === 'PUBLISHED' ? 'Published' : 'Draft' }}
                  </span>
                </td>
                <td>
                  {{ definition.usage_mode === 'embedded_only' ? 'Embedded object' : 'Standalone' }}
                </td>
                <td>{{ definition.version }}</td>
                <td>{{ (definition.fields && definition.fields.length) || 0 }}</td>
                <td>
                  <div class="cms-row-actions">
                    <button
                      type="button"
                      class="cms-btn cms-btn--ghost cms-btn--sm"
                      @click="editDefinition(definition)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="definition.usage_mode !== 'embedded_only'"
                      type="button"
                      class="cms-action-link"
                      @click="viewObjects(definition.slug)"
                    >
                      Entries
                    </button>
                    <button
                      v-if="definition.status === 'DRAFT'"
                      type="button"
                      class="cms-btn cms-btn--primary cms-btn--sm"
                      @click="publish(definition)"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      class="cms-action-link cms-action-link--danger"
                      @click="openDeleteDefinitionModal(definition)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="cms-empty cms-card">No definitions yet. Create one to get started.</div>
      </div>
    </div>

    <CmsListApiModal
      :visible="apiInfoModal.visible"
      :definition="apiInfoModal.definition"
      @close="closeApiInfo"
    />

    <div
      v-if="deleteModal.visible"
      class="cms-api-modal-overlay cms-delete-modal-overlay"
      role="presentation"
      @click.self="closeDeleteDefinitionModal"
    >
      <div
        class="cms-api-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-delete-def-title"
      >
        <header class="cms-api-modal__header">
          <div>
            <h2 id="cms-delete-def-title" class="cms-api-modal__title">Delete definition</h2>
            <p v-if="deleteModal.definition" class="cms-api-modal__sub">
              <span class="cms-table__mono">{{ deleteModal.definition.slug }}</span>
              · {{ deleteModal.definition.name }}
            </p>
          </div>
          <button
            type="button"
            class="cms-api-modal__close"
            aria-label="Close"
            @click="closeDeleteDefinitionModal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div class="cms-api-modal__body">
          <div v-if="deleteModal.loading && !deleteModal.impact" class="cms-status">Checking usage…</div>
          <template v-else-if="deleteModal.impact">
            <div
              v-if="deleteModal.impact.referenced_by && deleteModal.impact.referenced_by.length"
              class="cms-api-modal__callout cms-api-modal__callout--warn"
            >
              <p class="cms-api-modal__p">
                This definition cannot be deleted because another object type references it as an embedded custom
                object field. Remove or change those fields first.
              </p>
              <ul class="cms-api-modal__list">
                <li v-for="ref in deleteModal.impact.referenced_by" :key="ref.slug">
                  <strong>{{ ref.name }}</strong>
                  (<span class="cms-table__mono">{{ ref.slug }}</span>)
                </li>
              </ul>
            </div>
            <template v-else>
              <p class="cms-api-modal__p">
                This will permanently delete the definition, its version history, and
                <strong>{{ deleteModal.impact.entry_count }}</strong>
                standalone entr{{ deleteModal.impact.entry_count === 1 ? 'y' : 'ies' }} in this type’s collection.
              </p>
              <p class="cms-api-modal__p cms-api-modal__muted">
                Data already embedded inside parent object documents is not removed automatically; clean those parent
                records separately if needed.
              </p>
            </template>
          </template>
        </div>

        <footer class="cms-api-modal__footer cms-delete-modal__footer">
          <button type="button" class="cms-btn cms-btn--secondary" @click="closeDeleteDefinitionModal">
            Cancel
          </button>
          <button
            type="button"
            class="cms-btn cms-btn--danger"
            :disabled="
              deleteModal.loading ||
              !deleteModal.impact ||
              (deleteModal.impact.referenced_by && deleteModal.impact.referenced_by.length > 0)
            "
            @click="confirmDeleteDefinition"
          >
            Delete definition
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  listDefinitions,
  publishDefinition,
  getDefinitionDeletionImpact,
  deleteDefinition,
} from '../services/objectDefinition.service';
import CmsListApiModal from '../components/CmsListApiModal.vue';

export default {
  name: 'CmsDefinitions',
  components: {
    CmsListApiModal,
  },
  data() {
    return {
      definitions: [],
      loading: false,
      apiInfoModal: {
        visible: false,
        definition: null,
      },
      deleteModal: {
        visible: false,
        loading: false,
        definition: null,
        impact: null,
      },
    };
  },
  created() {
    this.fetchDefinitions();
  },
  computed: {
    publishedCount() {
      return this.definitions.filter((definition) => definition.status === 'PUBLISHED').length;
    },
    draftCount() {
      return this.definitions.filter((definition) => definition.status !== 'PUBLISHED').length;
    },
  },
  methods: {
    async fetchDefinitions() {
      this.loading = true;
      try {
        const response = await listDefinitions();
        this.definitions = response.data || [];
      } catch (error) {
        this.definitions = [];
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({
        name: 'CompanyHome',
        params: { company_id: this.$route.params.company_id },
      });
    },
    goToCreate() {
      this.$router.push({ name: 'CmsDefinitionCreate', params: this.$route.params });
    },
    editDefinition(definition) {
      this.$router.push({
        name: 'CmsDefinitionEdit',
        params: {
          ...this.$route.params,
          definition_id: definition._id,
        },
      });
    },
    viewObjects(slug) {
      this.$router.push({
        name: 'CmsObjects',
        params: {
          ...this.$route.params,
          slug,
        },
      });
    },
    async publish(definition) {
      try {
        await publishDefinition(definition._id);
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          Vue.snackbar.showSuccess('Definition published.');
        }
        await this.fetchDefinitions();
      } catch (error) {
        console.error(error);
      }
    },
    openApiInfo(definition) {
      this.apiInfoModal.definition = definition;
      this.apiInfoModal.visible = true;
    },
    closeApiInfo() {
      this.apiInfoModal.visible = false;
      this.apiInfoModal.definition = null;
    },
    async openDeleteDefinitionModal(definition) {
      this.deleteModal.visible = true;
      this.deleteModal.definition = definition;
      this.deleteModal.impact = null;
      this.deleteModal.loading = true;
      try {
        const response = await getDefinitionDeletionImpact(definition._id);
        this.deleteModal.impact = response.data || null;
      } catch (e) {
        this.closeDeleteDefinitionModal();
      } finally {
        this.deleteModal.loading = false;
      }
    },
    closeDeleteDefinitionModal() {
      this.deleteModal.visible = false;
      this.deleteModal.definition = null;
      this.deleteModal.impact = null;
      this.deleteModal.loading = false;
    },
    async confirmDeleteDefinition() {
      const def = this.deleteModal.definition;
      const impact = this.deleteModal.impact;
      if (!def || !impact || (impact.referenced_by && impact.referenced_by.length > 0)) {
        return;
      }
      this.deleteModal.loading = true;
      try {
        await deleteDefinition(def._id);
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          Vue.snackbar.showSuccess('Definition and related entries were deleted.');
        }
        this.closeDeleteDefinitionModal();
        await this.fetchDefinitions();
      } finally {
        this.deleteModal.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.cms-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Shared with delete dialog (List API modal lives in CmsListApiModal.vue) */
.cms-api-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}

.cms-api-modal {
  width: 100%;
  max-width: 640px;
  max-height: min(90vh, 720px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.cms-api-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.cms-api-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.cms-api-modal__sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.cms-api-modal__close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.cms-api-modal__close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.cms-api-modal__body {
  padding: 16px 22px 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.cms-api-modal__p {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.cms-api-modal__p:last-child {
  margin-bottom: 0;
}

.cms-api-modal__muted {
  color: #94a3b8;
}

.cms-api-modal__list {
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.cms-api-modal__list li {
  margin-bottom: 6px;
}

.cms-api-modal__callout {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  line-height: 1.5;
  color: #334155;
}

.cms-api-modal__callout--warn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.cms-api-modal__footer {
  padding: 14px 22px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.cms-delete-modal-overlay {
  z-index: 1001;
}

.cms-delete-modal__footer {
  justify-content: flex-end;
  gap: 10px;
}
</style>
