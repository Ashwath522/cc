<template>
  <div class="cms-page">
    <div class="cms-page__inner">
      <div class="cms-page__header">
        <div>
          <h1 class="cms-page__title">{{ pageTitle }}</h1>
          <p class="cms-page__subtitle cms-page__subtitle--with-api">
            <span>Build a schema for structured content and reuse it across the CMS.</span>
            <button
              v-if="definition.slug"
              type="button"
              class="cms-api-info-btn"
              title="List API &amp; filters"
              aria-label="Open list API and filter documentation"
              @click="openApiInfo"
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
          </p>
        </div>
        <div class="cms-actions">
          <button type="button" class="cms-btn cms-btn--secondary" @click="goBack">Back</button>
          <button type="button" class="cms-btn cms-btn--primary" :disabled="loading" @click="saveDefinition">
            {{ isEdit ? 'Save changes' : 'Save definition' }}
          </button>
        </div>
      </div>

      <div v-if="loading && isEdit" class="cms-status">Loading definition…</div>
      <template v-else>
        <div class="cms-card cms-definition-form">
          <div class="field-row">
            <label>Name</label>
            <input v-model="definition.name" placeholder="Product Review" />
          </div>
          <div class="field-row">
            <label>Slug</label>
            <input v-model="definition.slug" placeholder="product-review" />
          </div>
          <div class="field-row">
            <label>Description</label>
            <textarea v-model="definition.description" placeholder="Describe this object" />
          </div>
          <div class="field-row">
            <div class="cms-field-label">Usage mode</div>
            <div class="cms-usage-mode-row">
              <label class="cms-switch">
                <input
                  id="def-usage-mode"
                  v-model="usageModeEmbedded"
                  type="checkbox"
                  class="cms-switch-input"
                  role="switch"
                  :aria-label="
                    usageModeEmbedded
                      ? 'Usage mode: embedded object'
                      : 'Usage mode: standalone object'
                  "
                />
                <span class="cms-switch-track" aria-hidden="true" />
              </label>
              <span class="cms-usage-mode-caption">{{
                usageModeEmbedded ? 'Embedded object' : 'Standalone object'
              }}</span>
            </div>
            <p class="cms-field-hint usage-mode-hint">
              Embedded object definitions are only used inside parent custom object fields. They do not appear as their
              own object list—you create and edit their data from the parent.
            </p>
          </div>
          <div class="field-list">
            <div class="field-list-header">
              <h2>Fields</h2>
              <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="addField">
                Add field
              </button>
            </div>
            <div v-if="definition.fields.length === 0" class="cms-status">Add fields to build the object schema.</div>
            <div v-for="(field, index) in definition.fields" :key="field.localId" class="field-preview">
              <div class="preview-header">
                <div>
                  <strong>{{ field.label || 'Untitled field' }}</strong>
                  <div class="field-meta">{{ field.field_type }} · {{ field.required ? 'required' : 'optional' }}</div>
                </div>
              </div>
              <FieldTypeEditor
                :field="field"
                :current-definition-slug="definition.slug"
                @update="updateField(index, $event)"
                @remove="removeField(index)"
              />
            </div>
          </div>

          <div class="actions">
            <button type="button" class="cms-btn cms-btn--primary" :disabled="loading" @click="saveDefinition">
              {{ isEdit ? 'Save changes' : 'Save definition' }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <CmsListApiModal
      :visible="apiInfoVisible"
      :definition="definitionForApiModal"
      @close="closeApiInfo"
    />
  </div>
</template>

<script>
import FieldTypeEditor from '../components/FieldTypeEditor.vue';
import CmsListApiModal from '../components/CmsListApiModal.vue';
import { createDefinition, getDefinition, updateDefinition } from '../services/objectDefinition.service';

export default {
  name: 'CmsDefinitionCreate',
  components: { FieldTypeEditor, CmsListApiModal },
  data() {
    return {
      loading: false,
      apiInfoVisible: false,
      definition: {
        name: '',
        slug: '',
        description: '',
        usage_mode: 'standalone',
        status: 'DRAFT',
        fields: [],
      },
      nextFieldId: 1,
    };
  },
  computed: {
    definitionId() {
      return this.$route.params.definition_id;
    },
    isEdit() {
      return Boolean(this.definitionId);
    },
    pageTitle() {
      return this.isEdit ? 'Edit content definition' : 'New content definition';
    },
    usageModeEmbedded: {
      get() {
        return this.definition.usage_mode === 'embedded_only';
      },
      set(value) {
        this.definition.usage_mode = value ? 'embedded_only' : 'standalone';
      },
    },
    definitionForApiModal() {
      if (!this.definition.slug) {
        return null;
      }
      return {
        ...this.definition,
        name: this.definition.name || this.definition.slug,
        fields: this.definition.fields || [],
      };
    },
  },
  created() {
    if (this.isEdit) {
      this.loadDefinitionForEdit();
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'CmsDefinitions', params: this.$route.params });
    },
    openApiInfo() {
      this.apiInfoVisible = true;
    },
    closeApiInfo() {
      this.apiInfoVisible = false;
    },
    async loadDefinitionForEdit() {
      this.loading = true;
      try {
        const response = await getDefinition(this.definitionId);
        const d = response.data || {};
        const fields = (d.fields || []).map((f, i) => ({
          ...f,
          localId: i + 1,
        }));
        this.nextFieldId = fields.length + 1;
        this.definition = {
          name: d.name || '',
          slug: d.slug || '',
          description: d.description || '',
          usage_mode: d.usage_mode || 'standalone',
          status: d.status || 'DRAFT',
          fields,
        };
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    addField() {
      this.definition.fields.push({
        localId: this.nextFieldId++,
        name: '',
        label: '',
        field_type: 'text',
        required: false,
        is_filterable: false,
        regex_pattern: '',
        placeholder: '',
        options: [],
        multiple: false,
      });
    },
    updateField(index, field) {
      this.$set(this.definition.fields, index, {
        ...this.definition.fields[index],
        ...field,
      });
    },
    removeField(index) {
      this.definition.fields.splice(index, 1);
    },
    async saveDefinition() {
      this.loading = true;
      try {
        const payload = {
          name: this.definition.name,
          slug: this.definition.slug,
          description: this.definition.description,
          usage_mode: this.definition.usage_mode || 'standalone',
          application_id: this.$route.params.application_id,
          fields: this.definition.fields.map((field) => {
            const updated = { ...field };
            delete updated.localId;
            return updated;
          }),
        };
        if (this.isEdit) {
          await updateDefinition(this.definitionId, payload);
        } else {
          await createDefinition(payload);
        }
        this.$router.push({ name: 'CmsDefinitions', params: this.$route.params });
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.cms-definition-form {
  padding: 24px 26px 28px;
}
.field-row {
  margin-bottom: 18px;
}
.field-row label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}
.field-row input,
.field-row textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--cms-border, #e2e8f0);
  border-radius: var(--cms-radius-sm, 8px);
  background: #f8fafc;
  box-sizing: border-box;
}
.field-row textarea {
  min-height: 120px;
}
.usage-mode-hint {
  margin-top: 8px;
}
.field-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.field-list-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}
.field-preview {
  margin-bottom: 16px;
  border: 1px solid var(--cms-border, #e2e8f0);
  border-radius: 12px;
  padding: 18px;
  background: #fafbfc;
}
.field-meta {
  color: #6b7280;
  margin-top: 4px;
}
.actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
