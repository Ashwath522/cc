<template>
  <div class="field-editor">
    <div class="field-editor-row">
      <label>Name</label>
      <input v-model="localField.name" @input="emitUpdate" placeholder="field_key" />
    </div>
    <div class="field-editor-row">
      <label>Label</label>
      <input v-model="localField.label" @input="emitUpdate" placeholder="Field label" />
    </div>
    <div class="field-editor-row">
      <label>Type</label>
      <select v-model="localField.field_type" @change="onTypeChange">
        <option value="text">Text</option>
        <option value="long_text">Long Text</option>
        <option value="number">Number</option>
        <option value="file">File</option>
        <option value="date">Date</option>
        <option value="date_time">Date &amp; time</option>
        <option value="url">URL</option>
        <option value="json">JSON</option>
        <option value="html">HTML</option>
        <option value="multiple_values">Multiple values</option>
        <option value="dropdown">Dropdown</option>
        <option value="checkbox">Checkbox</option>
        <option value="radio">Radio</option>
        <option value="product">Product</option>
        <option value="collection">Collection</option>
        <option value="custom_object">Custom object</option>
      </select>
    </div>

    <div v-if="localField.field_type === 'custom_object'" class="field-editor-row">
      <label>Linked object type</label>
      <select v-model="localField.ref_definition_slug" @change="emitUpdate">
        <option value="">{{
          embeddedObjectDefinitionChoices.length
            ? 'Select an embedded object type…'
            : 'No published embedded object definitions'
        }}</option>
        <option v-for="d in embeddedObjectDefinitionChoices" :key="d.slug" :value="d.slug">
          {{ d.name }} — {{ d.slug }}
        </option>
      </select>
      <p class="field-editor-hint">
        Only <strong>embedded object</strong> definitions can be linked here. Editors fill these fields inline on the
        parent object; values are stored on the same document (not as separate CMS entries). The current definition is
        excluded.
      </p>
    </div>

    <div v-if="localField.field_type === 'file'" class="file-config-box">
      <p class="section-title">File upload rules</p>
      <label class="radio-line">
        <input
          type="radio"
          :name="fileRadioGroup"
          :checked="localField.file_config.allow_all"
          @change="setFileAllowAll(true)"
        />
        Allow all file types
      </label>
      <label class="radio-line">
        <input
          type="radio"
          :name="fileRadioGroup"
          :checked="!localField.file_config.allow_all"
          @change="setFileAllowAll(false)"
        />
        Allow only specific types
      </label>

      <div v-if="!localField.file_config.allow_all" class="file-categories">
        <label class="cat-row">
          <input type="checkbox" v-model="localField.file_config.allow_images" @change="syncFileConfig" />
          <span>
            <strong>Images</strong>
            <span class="cat-hint">Common image types — max {{ localField.file_config.image_max_mb }} MB</span>
          </span>
        </label>
        <label class="cat-row">
          <input type="checkbox" v-model="localField.file_config.allow_videos" @change="syncFileConfig" />
          <span>
            <strong>Videos</strong>
            <span class="cat-hint">mp4, webm, quicktime, … — max {{ localField.file_config.video_max_mb }} MB</span>
          </span>
        </label>
        <label class="cat-row">
          <input type="checkbox" v-model="localField.file_config.allow_documents" @change="syncFileConfig" />
          <span>
            <strong>Documents</strong>
            <span class="cat-hint">pdf, office, csv, … — max {{ localField.file_config.document_max_mb }} MB</span>
          </span>
        </label>
        <div class="field-editor-row inner">
          <label>Other extensions (optional)</label>
          <input
            v-model="localField.file_config.custom_extensions"
            placeholder="e.g. zip, csv, json"
            @input="syncFileConfig"
          />
          <p class="field-editor-hint">Comma-separated extensions (without dot). Matched by filename when MIME is not in the lists above.</p>
        </div>
      </div>
    </div>

    <div class="field-editor-row checkbox-row">
      <label><input type="checkbox" v-model="localField.required" @change="emitUpdate" /> Required</label>
      <label><input type="checkbox" v-model="localField.is_filterable" @change="emitUpdate" /> Filterable</label>
      <label><input type="checkbox" v-model="localField.auto_generate" @change="emitUpdate" /> Auto Generate (AI)</label>
    </div>


    <div v-if="showCheckboxOptionMulti" class="field-editor-row toggle-row">
      <div>
        <span class="toggle-label">Multi-select from option list</span>
        <p class="field-editor-hint">Allow choosing more than one predefined option.</p>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="localField.multiple" @change="emitUpdate" />
        <span class="slider" />
      </label>
    </div>

    <div v-if="showAcceptMultipleToggle" class="field-editor-row toggle-row">
      <div>
        <span class="toggle-label">Accept multiple values</span>
        <p class="field-editor-hint">Users can add more than one entry for this field.</p>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="localField.multiple" @change="emitUpdate" />
        <span class="slider" />
      </label>
    </div>

    <div class="field-editor-row">
      <label>Validation regex</label>
      <input v-model="localField.regex_pattern" @input="emitUpdate" placeholder="^\w+$" />
    </div>
    <div class="field-editor-row">
      <label>Placeholder</label>
      <input v-model="localField.placeholder" @input="emitUpdate" placeholder="Enter text" />
    </div>

    <div v-if="hasOptions" class="choices-box">
      <div class="choices-header">
        <span class="choices-label">Choices</span>
        <button type="button" class="link-add" @click="addChoice">+ Add value</button>
      </div>
      <div
        v-for="(opt, idx) in localField.options || []"
        :key="'choice-' + idx"
        class="choice-row"
      >
        <input
          class="choice-input"
          v-model="localField.options[idx]"
          type="text"
          placeholder="Enter value"
          autocomplete="off"
          @input="emitUpdate"
        />
        <button type="button" class="icon-remove" title="Remove" @click="removeChoice(idx)">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p v-if="!(localField.options || []).length" class="field-editor-hint empty-hint">
        No choices yet. Add values for this list.
        <template v-if="localField.field_type === 'multiple_values'">
          If you leave this empty, users can enter any comma-separated values; if you add choices, each value must match one of them.
        </template>
      </p>
    </div>

    <div class="field-editor-row default-value-row" v-if="showDefaultValue">
      <label>Default value</label>
      <input v-model="localField.default_value" @input="emitUpdate" placeholder="Default value" />
    </div>
    <button class="remove-button" type="button" @click="$emit('remove')">Remove field</button>
  </div>
</template>

<script>
import { listDefinitions } from '../services/objectDefinition.service';

const defaultFileConfig = () => ({
  allow_all: true,
  allow_images: false,
  allow_videos: false,
  allow_documents: false,
  custom_extensions: '',
  image_max_mb: 20,
  video_max_mb: 1024,
  document_max_mb: 10,
});

export default {
  name: 'FieldTypeEditor',
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentDefinitionSlug: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      localField: { ...this.normalizeIncomingField(this.field) },
      allDefinitions: [],
    };
  },
  computed: {
    /** Custom object fields may only reference embedded-only definitions (not standalone object types). */
    embeddedObjectDefinitionChoices() {
      return this.allDefinitions.filter(
        (d) =>
          d.slug &&
          d.slug !== this.currentDefinitionSlug &&
          d.usage_mode === 'embedded_only',
      );
    },
    hasOptions() {
      return ['dropdown', 'radio', 'checkbox', 'multiple_values'].includes(this.localField.field_type);
    },
    showCheckboxOptionMulti() {
      return this.localField.field_type === 'checkbox';
    },
    showAcceptMultipleToggle() {
      const t = this.localField.field_type;
      if (t === 'multiple_values' || t === 'checkbox') {
        return false;
      }
      return true;
    },
    showDefaultValue() {
      return !['checkbox', 'product', 'collection', 'file', 'custom_object', 'json', 'html'].includes(
        this.localField.field_type,
      );
    },
    fileRadioGroup() {
      return `file-mode-${this.localField.localId || this.localField.name || 'f'}`;
    },
  },
  watch: {
    field: {
      handler(newVal) {
        this.localField = { ...this.normalizeIncomingField(newVal) };
      },
      deep: true,
    },
  },
  async mounted() {
    await this.loadDefinitions();
  },
  methods: {
    normalizeIncomingField(f) {
      const merged = {
        ref_definition_slug: '',
        options: [],
        ...f,
        file_config: {
          ...defaultFileConfig(),
          ...(f.file_config && typeof f.file_config === 'object' ? f.file_config : {}),
        },
      };
      if (!Array.isArray(merged.options)) {
        merged.options = [];
      }
      return merged;
    },
    ensureOptionsArray() {
      if (!Array.isArray(this.localField.options)) {
        this.$set(this.localField, 'options', []);
      }
    },
    addChoice() {
      this.ensureOptionsArray();
      this.localField.options.push('');
      this.emitUpdate();
    },
    removeChoice(index) {
      this.ensureOptionsArray();
      this.localField.options.splice(index, 1);
      this.emitUpdate();
    },
    setFileAllowAll(val) {
      this.$set(this.localField, 'file_config', {
        ...defaultFileConfig(),
        ...(this.localField.file_config && typeof this.localField.file_config === 'object' ? this.localField.file_config : {}),
        allow_all: val,
      });
      this.emitUpdate();
    },
    syncFileConfig() {
      this.emitUpdate();
    },
    async loadDefinitions() {
      try {
        const res = await listDefinitions();
        const list = res.data || [];
        this.allDefinitions = list.filter((d) => d.status === 'PUBLISHED');
        this.clearInvalidCustomObjectRef();
      } catch (e) {
        this.allDefinitions = [];
      }
    },
    clearInvalidCustomObjectRef() {
      if (this.localField.field_type !== 'custom_object' || !this.localField.ref_definition_slug) {
        return;
      }
      const allowed = new Set(this.embeddedObjectDefinitionChoices.map((d) => d.slug));
      if (!allowed.has(this.localField.ref_definition_slug)) {
        this.localField.ref_definition_slug = '';
        this.emitUpdate();
      }
    },
    onTypeChange() {
      if (this.localField.field_type !== 'custom_object') {
        this.localField.ref_definition_slug = '';
      } else {
        this.clearInvalidCustomObjectRef();
      }
      if (this.localField.field_type === 'file') {
        if (!this.localField.file_config || typeof this.localField.file_config !== 'object') {
          this.$set(this.localField, 'file_config', defaultFileConfig());
        }
      }
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit('update', { ...this.localField });
    },
  },
};
</script>

<style scoped>
.field-editor {
  background: #ffffff;
  border: 1px solid #d8d8d8;
  padding: 16px;
  margin-top: 12px;
  border-radius: 6px;
}
.field-editor-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.field-editor-row label {
  font-weight: 600;
  margin-bottom: 6px;
}
.field-editor-row input,
.field-editor-row select,
.field-editor-row textarea {
  padding: 8px;
  border: 1px solid #c3c3c3;
  border-radius: 4px;
  width: 100%;
}
.field-editor-row.inner {
  margin-top: 12px;
}
.checkbox-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
}
.toggle-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
.toggle-label {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #cbd5e1;
  border-radius: 24px;
  transition: 0.2s;
}
.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}
.switch input:checked + .slider {
  background: #2563eb;
}
.switch input:checked + .slider:before {
  transform: translateX(20px);
}
.file-config-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fafbfc;
}
.section-title {
  margin: 0 0 12px;
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}
.radio-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  cursor: pointer;
}
.file-categories {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}
.cat-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}
.cat-row strong {
  display: block;
}
.cat-hint {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: #64748b;
  margin-top: 2px;
}
.choices-box {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: #fafbfc;
}
.choices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 2px;
}
.choices-label {
  font-weight: 700;
  font-size: 13px;
  color: #334155;
}
.link-add {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 0;
}
.link-add:hover {
  text-decoration: underline;
}
.choice-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 10px;
}
.choice-row:last-of-type {
  margin-bottom: 0;
}
.choice-input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
  line-height: 1.4;
  color: #0f172a;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.choice-input::placeholder {
  color: #94a3b8;
}
.choice-input:hover {
  border-color: #cbd5e1;
}
.choice-input:focus {
  outline: none;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background: #ffffff;
}
.icon-remove {
  flex-shrink: 0;
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.icon-remove span {
  position: relative;
  top: -1px;
}
.icon-remove:hover {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.icon-remove:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
.empty-hint {
  margin-top: 4px;
}
.remove-button {
  background: #e74c3c;
  color: #ffffff;
  border: none;
  padding: 10px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.field-editor-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}
</style>
