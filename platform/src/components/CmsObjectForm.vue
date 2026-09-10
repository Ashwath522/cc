<template>
  <div class="cms-page cms-object-form">
    <div class="cms-page__inner">
      <div class="cms-page__header">
        <div>
          <h1 class="cms-page__title">{{ title }}</h1>
          <p class="cms-page__subtitle cms-page__subtitle--with-api">
            <span>
              Object type <span class="cms-table__mono">{{ definition.slug || '—' }}</span>
              <template v-if="definition.name"> · {{ definition.name }}</template>
            </span>
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
          <button type="submit" form="object-form" class="cms-btn cms-btn--primary">Save</button>
        </div>
      </div>

      <div v-if="!pageReady" class="cms-status">Loading form…</div>
      <div v-else class="cms-card cms-object-form__card">
      <form id="object-form" @submit.prevent="submitForm">
        <div v-for="field in definition.fields" :key="field.name" class="form-field">
          <label :for="field.name">
            {{ field.label }}
            <span v-if="field.required">*</span>
          </label>

          <template v-if="field.field_type === 'text' || field.field_type === 'long_text'">
            <textarea
              v-if="field.field_type === 'long_text'"
              :id="field.name"
              v-model="values[field.name]"
              :placeholder="field.placeholder"
            ></textarea>
            <input
              v-else
              :id="field.name"
              type="text"
              v-model="values[field.name]"
              :placeholder="field.placeholder"
            />
          </template>

          <template v-else-if="field.field_type === 'number'">
            <input
              :id="field.name"
              type="number"
              v-model.number="values[field.name]"
              :placeholder="field.placeholder"
            />
          </template>

          <template v-else-if="field.field_type === 'date'">
            <input
              :id="field.name"
              type="date"
              v-model="values[field.name]"
            />
          </template>

          <template v-else-if="field.field_type === 'file'">
            <input
              :id="field.name"
              :name="field.name"
              type="file"
              :multiple="field.multiple"
              @change="onFileChange(field.name, $event)"
            />
            <div class="file-preview" v-if="fileNames[field.name]?.length">
              <div v-for="(name, index) in fileNames[field.name]" :key="index">{{ name }}</div>
            </div>
            <div class="uploaded-preview" v-if="values[field.name] && !fileNames[field.name]?.length">
              <span>Uploaded file URL:</span>
              <div>{{ values[field.name] }}</div>
            </div>
          </template>

          <template v-else-if="field.field_type === 'dropdown'">
            <select v-model="values[field.name]">
              <option value="">Select</option>
              <option v-for="option in field.options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </template>

          <template v-else-if="field.field_type === 'radio'">
            <div class="option-group">
              <label v-for="option in field.options" :key="option">
                <input
                  type="radio"
                  :name="field.name"
                  :value="option"
                  v-model="values[field.name]"
                />
                {{ option }}
              </label>
            </div>
          </template>

          <template v-else-if="field.field_type === 'checkbox'">
            <div class="option-group">
              <label v-for="option in field.options" :key="option">
                <input
                  type="checkbox"
                  :value="option"
                  :checked="(values[field.name] || []).includes(option)"
                  @change="toggleCheckbox(field.name, option, $event.target.checked)"
                />
                {{ option }}
              </label>
            </div>
          </template>

          <template v-else-if="field.field_type === 'multiple_values'">
            <input
              :id="field.name"
              type="text"
              v-model="stringFields[field.name]"
              placeholder="Comma-separated values"
            />
          </template>

          <template v-else-if="field.field_type === 'product'">
            <div class="relationship-field">
              <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="openProductSelector(field.name)">
                Select Product
              </button>
              <div v-if="values[field.name]" class="selection-chip">
                {{ values[field.name].name || values[field.name].title || values[field.name].slug }}
              </div>
            </div>
          </template>

          <template v-else-if="field.field_type === 'collection'">
            <div class="relationship-field">
              <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="openCollectionSelector(field.name)">
                Select Collection
              </button>
              <div v-if="values[field.name]" class="selection-chip">
                {{ values[field.name].name || values[field.name].title || values[field.name].slug }}
              </div>
            </div>
          </template>

          <template v-else-if="field.field_type === 'date_time'">
            <input
              :id="field.name"
              v-model="values[field.name]"
              type="datetime-local"
            />
          </template>

          <template v-else-if="field.field_type === 'url'">
            <input
              :id="field.name"
              v-model="values[field.name]"
              type="url"
              :placeholder="field.placeholder || 'https://…'"
            />
          </template>

          <template v-else-if="field.field_type === 'json'">
            <textarea
              :id="field.name"
              v-model="values[field.name]"
              class="code-area"
              placeholder='{"key": "value"}'
              rows="5"
            />
          </template>

          <template v-else-if="field.field_type === 'html'">
            <CmsQuillField
              :id="field.name"
              v-model="values[field.name]"
              :placeholder="field.placeholder"
            />
          </template>

          <template v-else-if="field.field_type === 'custom_object'">
            <p v-if="!field.ref_definition_slug" class="field-hint">
              Configure the linked embedded object type on the object definition.
            </p>
            <template v-else-if="nestedChildFields(field).length">
              <template v-if="field.multiple">
                <div
                  v-for="idx in customObjectRowIndices(field)"
                  :key="field.name + '-co-' + instanceVersion + '-' + idx"
                  class="cms-co-multi-block"
                >
                  <div class="cms-co-multi-block__head">
                    <span class="cms-co-multi-block__label">Entry {{ idx + 1 }}</span>
                    <button
                      type="button"
                      class="cms-btn cms-btn--ghost cms-btn--sm"
                      @click="removeCustomObjectRow(field.name, idx)"
                    >
                      Remove
                    </button>
                  </div>
                  <div class="cms-embed-wrap">
                    <CmsEmbeddedObjectFields
                      :id-prefix="'co-' + field.name + '-' + idx"
                      :embed-segments="[field.name, idx]"
                      :child-fields="nestedChildFields(field)"
                      :value="customObjectRowValue(field, idx)"
                      :embedded-defs="embeddedDefs"
                      @input="onCustomObjectMultiInput(field.name, idx, $event)"
                    />
                  </div>
                </div>
                <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="addCustomObjectRow(field.name)">
                  Add entry
                </button>
              </template>
              <div v-else class="cms-embed-wrap">
                <CmsEmbeddedObjectFields
                  :key="field.name + '-single-' + instanceVersion"
                  :id-prefix="'co-' + field.name"
                  :embed-segments="[field.name]"
                  :child-fields="nestedChildFields(field)"
                  :value="singleCustomObjectValue(field)"
                  :embedded-defs="embeddedDefs"
                  @input="onCustomObjectInput(field.name, $event)"
                />
              </div>
            </template>
            <p v-else class="field-hint">
              Could not load embedded type. Publish the linked definition (e.g. Banner Details) or check the slug.
            </p>
          </template>

          <div v-if="field.regex_pattern" class="field-hint">
            Validation: {{ field.regex_pattern }}
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="cms-btn cms-btn--primary">Save</button>
        </div>
      </form>

      <FyndProductSelector
        v-if="productModal.visible"
        @close="productModal.visible = false"
        @select="onProductSelect"
      />
      <FyndCollectionSelector
        v-if="collectionModal.visible"
        @close="collectionModal.visible = false"
        @select="onCollectionSelect"
      />
    </div>
    </div>

    <CmsListApiModal
      :visible="apiInfoVisible"
      :definition="definition"
      @close="closeApiInfo"
    />
  </div>
</template>

<script>
import FyndProductSelector from './FyndProductSelector.vue';
import FyndCollectionSelector from './FyndCollectionSelector.vue';
import CmsQuillField from './CmsQuillField.vue';
import CmsEmbeddedObjectFields from './CmsEmbeddedObjectFields.vue';
import CmsListApiModal from './CmsListApiModal.vue';
import { createInstance, updateInstance, getDefinitionBySlug, getInstance } from '../services/objectInstance.service';

export default {
  name: 'CmsObjectForm',
  components: {
    FyndProductSelector,
    FyndCollectionSelector,
    CmsQuillField,
    CmsEmbeddedObjectFields,
    CmsListApiModal,
  },
  provide() {
    return {
      cmsEmbedFileRegister: this.registerEmbedFile,
    };
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator(value) {
        return ['create', 'edit'].includes(value);
      },
    },
  },
  data() {
    return {
      definition: {
        fields: [],
        name: '',
        slug: '',
        usage_mode: 'standalone',
        status: null,
      },
      apiInfoVisible: false,
      values: {},
      stringFields: {},
      files: {},
      fileNames: {},
      loading: false,
      productModal: {
        visible: false,
        field: null,
      },
      collectionModal: {
        visible: false,
        field: null,
      },
      embeddedDefs: {},
      embedFileRegistry: {},
      /** False until definition (+ edit: instance) are ready — avoids embedded fields mounting with empty data. */
      pageReady: false,
      /** Bumps when instance payload loads so embedded components remount with saved values. */
      instanceVersion: 0,
    };
  },
  computed: {
    title() {
      return this.mode === 'create' ? 'Create Object' : 'Edit Object';
    },
    slug() {
      return this.$route.params.slug;
    },
    objectId() {
      return this.$route.params.object_id;
    },
  },
  async created() {
    try {
      await this.loadDefinition();
      if (this.mode === 'edit' && this.objectId) {
        await this.loadInstance();
      } else {
        this.seedMultiCustomObjectDefaults();
      }
    } finally {
      this.pageReady = true;
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'CmsObjects', params: this.$route.params });
    },
    async loadDefinition() {
      try {
        const response = await getDefinitionBySlug(this.slug);
        this.definition = response.data || this.definition;
        await this.loadEmbeddedDefinitions();
      } catch (error) {
        console.error('Failed to load definition', error);
      }
    },
    collectCustomObjectSlugsFromFields(fields) {
      const slugs = [];
      (fields || []).forEach((f) => {
        if (f && f.field_type === 'custom_object' && f.ref_definition_slug) {
          slugs.push(f.ref_definition_slug);
        }
      });
      return slugs;
    },
    async loadEmbeddedDefinitions() {
      const defs = {};
      const pending = [...this.collectCustomObjectSlugsFromFields(this.definition.fields)];
      while (pending.length) {
        const slug = pending.shift();
        if (!slug || defs[slug]) {
          continue;
        }
        try {
          const res = await getDefinitionBySlug(slug);
          const d = res.data;
          if (d && d.slug) {
            defs[slug] = d;
            this.collectCustomObjectSlugsFromFields(d.fields).forEach((s) => {
              if (!defs[s]) {
                pending.push(s);
              }
            });
          }
        } catch (e) {
          console.error('Failed to load embedded definition', slug, e);
        }
      }
      this.embeddedDefs = defs;
    },
    nestedChildFields(field) {
      const slug = field.ref_definition_slug;
      if (!slug || !this.embeddedDefs[slug]) {
        return [];
      }
      return this.embeddedDefs[slug].fields || [];
    },
    onCustomObjectInput(fieldName, val) {
      this.$set(this.values, fieldName, { ...val });
    },
    singleCustomObjectValue(field) {
      const v = this.values[field.name];
      if (v == null || v === '') {
        return {};
      }
      if (Array.isArray(v)) {
        if (v.length === 1 && v[0] && typeof v[0] === 'object' && !Array.isArray(v[0])) {
          return { ...v[0] };
        }
        return {};
      }
      if (typeof v === 'object') {
        return { ...v };
      }
      return {};
    },
    customObjectRowIndices(field) {
      const arr = this.values[field.name];
      if (!Array.isArray(arr) || arr.length === 0) {
        return [];
      }
      return arr.map((_, i) => i);
    },
    customObjectRowValue(field, idx) {
      const arr = this.values[field.name];
      if (!Array.isArray(arr) || arr[idx] == null) {
        return {};
      }
      const row = arr[idx];
      return typeof row === 'object' && !Array.isArray(row) ? { ...row } : {};
    },
    onCustomObjectMultiInput(fieldName, idx, val) {
      const prev = Array.isArray(this.values[fieldName]) ? [...this.values[fieldName]] : [];
      while (prev.length <= idx) {
        prev.push({});
      }
      prev[idx] = { ...val };
      this.$set(this.values, fieldName, prev);
    },
    addCustomObjectRow(fieldName) {
      const prev = Array.isArray(this.values[fieldName]) ? [...this.values[fieldName]] : [];
      prev.push({});
      this.$set(this.values, fieldName, prev);
    },
    removeCustomObjectRow(fieldName, idx) {
      const prev = Array.isArray(this.values[fieldName]) ? [...this.values[fieldName]] : [];
      prev.splice(idx, 1);
      this.$set(this.values, fieldName, prev);
    },
    seedMultiCustomObjectDefaults() {
      (this.definition.fields || []).forEach((field) => {
        if (field.field_type !== 'custom_object' || !field.multiple) {
          return;
        }
        if (this.values[field.name] === undefined) {
          this.$set(this.values, field.name, [{}]);
        }
      });
    },
    normalizeCustomObjectValuesFromApi() {
      (this.definition.fields || []).forEach((field) => {
        if (field.field_type !== 'custom_object') {
          return;
        }
        const raw = this.values[field.name];
        if (field.multiple) {
          if (raw == null || raw === '') {
            this.$set(this.values, field.name, []);
            return;
          }
          if (!Array.isArray(raw)) {
            if (raw && typeof raw === 'object') {
              this.$set(this.values, field.name, [raw]);
            } else {
              this.$set(this.values, field.name, []);
            }
            return;
          }
          this.$set(
            this.values,
            field.name,
            raw.map((item) =>
              item && typeof item === 'object' && !Array.isArray(item) ? item : {},
            ),
          );
          return;
        }
        if (Array.isArray(raw)) {
          if (raw.length === 1 && raw[0] && typeof raw[0] === 'object' && !Array.isArray(raw[0])) {
            this.$set(this.values, field.name, { ...raw[0] });
          } else {
            this.$set(this.values, field.name, {});
          }
          return;
        }
        if (raw == null || raw === '') {
          this.$set(this.values, field.name, {});
        } else if (typeof raw === 'object' && !Array.isArray(raw)) {
          this.$set(this.values, field.name, { ...raw });
        } else {
          this.$set(this.values, field.name, {});
        }
      });
    },
    registerEmbedFile(pathKey, files) {
      if (files == null || files === undefined) {
        this.$delete(this.embedFileRegistry, pathKey);
        return;
      }
      this.$set(this.embedFileRegistry, pathKey, files);
    },
    async loadInstance() {
      if (!this.objectId) {
        return;
      }
      try {
        const response = await getInstance(this.slug, this.objectId);
        const raw = response.data || {};
        this.values = JSON.parse(JSON.stringify(raw));
        this.normalizeCustomObjectValuesFromApi();
        this.definition.fields.forEach((field) => {
          if (field.field_type === 'multiple_values' && Array.isArray(this.values[field.name])) {
            this.stringFields[field.name] = this.values[field.name].join(', ');
          }
        });
        this.instanceVersion += 1;
      } catch (error) {
        console.error('Failed to load instance', error);
      }
    },
    onFileChange(fieldName, event) {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) {
        return;
      }
      this.files[fieldName] = selectedFiles;
      this.fileNames[fieldName] = selectedFiles.map((file) => file.name);
    },
    toggleCheckbox(fieldName, option, checked) {
      const current = Array.isArray(this.values[fieldName]) ? [...this.values[fieldName]] : [];
      if (checked) {
        if (!current.includes(option)) {
          current.push(option);
        }
      } else {
        const index = current.indexOf(option);
        if (index !== -1) {
          current.splice(index, 1);
        }
      }
      this.values[fieldName] = current;
    },
    openProductSelector(fieldName) {
      this.productModal.field = fieldName;
      this.productModal.visible = true;
    },
    openCollectionSelector(fieldName) {
      this.collectionModal.field = fieldName;
      this.collectionModal.visible = true;
    },
    onProductSelect(item) {
      if (this.productModal.field) {
        this.values[this.productModal.field] = item;
      }
    },
    onCollectionSelect(item) {
      if (this.collectionModal.field) {
        this.values[this.collectionModal.field] = item;
      }
    },
    openApiInfo() {
      this.apiInfoVisible = true;
    },
    closeApiInfo() {
      this.apiInfoVisible = false;
    },
    buildFormData() {
      const formData = new FormData();
      const fields = this.definition.fields || [];

      fields.forEach((field) => {
        const name = field.name;
        let value;
        if (field.field_type === 'multiple_values') {
          const raw = this.stringFields[name] || '';
          value = raw
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          value = this.values[name];
        }
        if (value === undefined || value === null) {
          return;
        }
        if (typeof value === 'object') {
          formData.append(name, JSON.stringify(value));
        } else {
          formData.append(name, value);
        }
      });

      fields.forEach((field) => {
        if (field.field_type !== 'file') {
          return;
        }
        const selectedFiles = this.files[field.name];
        if (!selectedFiles || !selectedFiles.length) {
          return;
        }
        selectedFiles.forEach((file) => {
          formData.append(field.name, file);
        });
      });

      Object.keys(this.embedFileRegistry).forEach((key) => {
        const files = this.embedFileRegistry[key];
        if (!files) {
          return;
        }
        const arr = Array.isArray(files) ? files : [files];
        arr.forEach((file) => {
          if (file instanceof File) {
            formData.append(key, file);
          }
        });
      });

      return formData;
    },
    async submitForm() {
      this.loading = true;
      try {
        const data = this.buildFormData();
        if (this.mode === 'create') {
          await createInstance(this.slug, data);
        } else {
          await updateInstance(this.slug, this.objectId, data);
        }
        this.$router.push({ name: 'CmsObjects', params: this.$route.params });
      } catch (error) {
        console.error('Failed to save object', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.cms-object-form__card {
  padding: 24px 26px 28px;
}
.form-field {
  margin-bottom: 24px;
}
.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 10px;
}
.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  min-height: 50px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #d6d9df;
  background: #f9fafb;
}
.form-field textarea {
  min-height: 140px;
}
.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.option-group label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.relationship-field {
  display: flex;
  align-items: center;
  gap: 16px;
}
.selection-chip {
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 8px;
}
.file-preview,
.uploaded-preview {
  margin-top: 10px;
  color: #4c4c4c;
}
.field-hint {
  margin-top: 6px;
  color: #6b6b6b;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
.cms-embed-wrap {
  margin-top: 4px;
}
.cms-co-multi-block {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fafbfc;
}
.cms-co-multi-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.cms-co-multi-block__label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}
.code-area {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.45;
}
</style>
