<template>
  <div class="embedded-object-fields">
    <div
      v-for="field in visibleFields"
      :key="field.name"
      class="form-field embedded-field"
    >
      <label :for="embedId(field.name)">
        {{ field.label || field.name }}
        <span v-if="field.required">*</span>
      </label>

      <template v-if="field.field_type === 'text' || field.field_type === 'long_text'">
        <textarea
          v-if="field.field_type === 'long_text'"
          :id="embedId(field.name)"
          v-model="local[field.name]"
          :placeholder="field.placeholder"
          @input="sync"
        />
        <input
          v-else
          :id="embedId(field.name)"
          v-model="local[field.name]"
          type="text"
          :placeholder="field.placeholder"
          @input="sync"
        />
      </template>

      <template v-else-if="field.field_type === 'number'">
        <input
          :id="embedId(field.name)"
          v-model.number="local[field.name]"
          type="number"
          :placeholder="field.placeholder"
          @input="sync"
        />
      </template>

      <template v-else-if="field.field_type === 'date'">
        <input :id="embedId(field.name)" v-model="local[field.name]" type="date" @input="sync" />
      </template>

      <template v-else-if="field.field_type === 'date_time'">
        <input :id="embedId(field.name)" v-model="local[field.name]" type="datetime-local" @input="sync" />
      </template>

      <template v-else-if="field.field_type === 'url'">
        <input
          :id="embedId(field.name)"
          v-model="local[field.name]"
          type="url"
          :placeholder="field.placeholder || 'https://…'"
          @input="sync"
        />
      </template>

      <template v-else-if="field.field_type === 'html'">
        <CmsQuillField
          :id="embedId(field.name)"
          v-model="local[field.name]"
          :placeholder="field.placeholder"
          @input="sync"
        />
      </template>

      <template v-else-if="field.field_type === 'json'">
        <textarea
          :id="embedId(field.name)"
          v-model="local[field.name]"
          class="code-area"
          placeholder='{"key": "value"}'
          rows="5"
          @input="sync"
        />
      </template>

      <template v-else-if="field.field_type === 'dropdown'">
        <select :id="embedId(field.name)" v-model="local[field.name]" @change="sync">
          <option value="">Select</option>
          <option v-for="option in field.options || []" :key="option" :value="option">{{ option }}</option>
        </select>
      </template>

      <template v-else-if="field.field_type === 'radio'">
        <div class="option-group">
          <label v-for="option in field.options || []" :key="option">
            <input type="radio" :name="embedId(field.name)" :value="option" v-model="local[field.name]" @change="sync" />
            {{ option }}
          </label>
        </div>
      </template>

      <template v-else-if="field.field_type === 'checkbox'">
        <div v-if="field.multiple" class="option-group">
          <label v-for="option in field.options || []" :key="option">
            <input
              type="checkbox"
              :value="option"
              :checked="(local[field.name] || []).includes(option)"
              @change="toggleCheckboxField(field.name, option, $event.target.checked)"
            />
            {{ option }}
          </label>
        </div>
        <div v-else class="option-group">
          <label v-for="option in field.options || []" :key="option">
            <input
              type="radio"
              :name="embedId(field.name) + '-chk'"
              :value="option"
              v-model="local[field.name]"
              @change="sync"
            />
            {{ option }}
          </label>
        </div>
      </template>

      <template v-else-if="field.field_type === 'multiple_values'">
        <template v-if="(field.options || []).length">
          <div class="option-group">
            <label v-for="option in field.options" :key="option">
              <input
                type="checkbox"
                :value="option"
                :checked="(local[field.name] || []).includes(option)"
                @change="toggleCheckboxField(field.name, option, $event.target.checked)"
              />
              {{ option }}
            </label>
          </div>
        </template>
        <template v-else>
          <div v-for="(row, idx) in multiRows(field.name)" :key="field.name + '-mv-' + idx" class="multi-row">
            <input v-model="local[field.name][idx]" type="text" @input="sync" />
            <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" @click="removeMultiRow(field.name, idx)">
              Remove
            </button>
          </div>
          <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="addMultiRow(field.name)">
            Add value
          </button>
        </template>
      </template>

      <template v-else-if="field.field_type === 'product'">
        <div class="relationship-field">
          <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="openProduct(field.name)">
            Select product
          </button>
          <div v-if="local[field.name]" class="selection-chip">{{ relationLabel(local[field.name]) }}</div>
        </div>
      </template>

      <template v-else-if="field.field_type === 'collection'">
        <div class="relationship-field">
          <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="openCollection(field.name)">
            Select collection
          </button>
          <div v-if="local[field.name]" class="selection-chip">{{ relationLabel(local[field.name]) }}</div>
        </div>
      </template>

      <template v-else-if="field.field_type === 'custom_object'">
        <p v-if="!field.ref_definition_slug" class="field-hint">Configure linked object type on the definition.</p>
        <div v-else-if="nestedFields(field.ref_definition_slug).length" class="nested-embed">
          <CmsEmbeddedObjectFields
            :id-prefix="nestedPrefix(field.name)"
            :embed-segments="[...embedSegments, field.name]"
            :child-fields="nestedFields(field.ref_definition_slug)"
            :value="local[field.name] || {}"
            :embedded-defs="embeddedDefs"
            @input="onNestedInput(field.name, $event)"
          />
        </div>
        <p v-else class="field-hint">Could not load nested definition.</p>
      </template>

      <template v-else-if="field.field_type === 'file'">
        <input
          :id="embedId(field.name)"
          type="file"
          :multiple="field.multiple"
          @change="onEmbedFileChange(field, $event)"
        />
        <div v-if="embedFileNameList(field).length" class="file-preview">
          <div v-for="(name, index) in embedFileNameList(field)" :key="index">{{ name }}</div>
        </div>
        <div v-else-if="local[field.name]" class="uploaded-preview">
          <span>Uploaded file URL:</span>
          <div>{{ local[field.name] }}</div>
        </div>
      </template>

      <template v-else>
        <input
          :id="embedId(field.name)"
          v-model="local[field.name]"
          type="text"
          :placeholder="field.placeholder"
          @input="sync"
        />
      </template>

      <div v-if="field.regex_pattern" class="field-hint">Validation: {{ field.regex_pattern }}</div>
    </div>

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
</template>

<script>
import CmsQuillField from './CmsQuillField.vue';
import FyndProductSelector from './FyndProductSelector.vue';
import FyndCollectionSelector from './FyndCollectionSelector.vue';
import { buildCmsEmbedFileFormFieldName } from '../utils/cmsEmbedFileKey';

export default {
  name: 'CmsEmbeddedObjectFields',
  components: {
    CmsQuillField,
    FyndProductSelector,
    FyndCollectionSelector,
  },
  inject: {
    cmsEmbedFileRegister: { default: null },
  },
  props: {
    childFields: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    embeddedDefs: {
      type: Object,
      default: () => ({}),
    },
    idPrefix: {
      type: String,
      default: 'embed',
    },
    /** Path from root form: [rootCustomObjectField, optionalRowIndex, …nested custom_object names] */
    embedSegments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      local: {},
      embedFileNames: {},
      productModal: { visible: false, fieldName: null },
      collectionModal: { visible: false, fieldName: null },
    };
  },
  computed: {
    visibleFields() {
      return (this.childFields || []).filter((f) => f && f.name);
    },
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(v) {
        this.local = this.mergeFromProp(v || {});
      },
    },
    childFields: {
      immediate: true,
      handler() {
        this.local = this.mergeFromProp(this.value || {});
      },
    },
  },
  methods: {
    embedId(name) {
      return `${this.idPrefix}-${name}`;
    },
    nestedPrefix(name) {
      return `${this.idPrefix}-${name}`;
    },
    toDateInput(iso) {
      if (iso == null || iso === '') {
        return '';
      }
      const d = iso instanceof Date ? iso : new Date(iso);
      if (Number.isNaN(d.getTime())) {
        return '';
      }
      return d.toISOString().slice(0, 10);
    },
    toDatetimeLocal(iso) {
      if (iso == null || iso === '') {
        return '';
      }
      const d = iso instanceof Date ? iso : new Date(iso);
      if (Number.isNaN(d.getTime())) {
        return '';
      }
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    formatLoadedField(f, base) {
      if (!f || base[f.name] == null || base[f.name] === '') {
        return;
      }
      if (f.field_type === 'json' && typeof base[f.name] === 'object') {
        base[f.name] = JSON.stringify(base[f.name], null, 2);
      }
      if (f.field_type === 'date') {
        base[f.name] = this.toDateInput(base[f.name]);
      }
      if (f.field_type === 'date_time') {
        base[f.name] = this.toDatetimeLocal(base[f.name]);
      }
    },
    mergeFromProp(v) {
      const base = { ...(v && typeof v === 'object' ? v : {}) };
      (this.childFields || []).forEach((f) => {
        if (!f || !f.name) {
          return;
        }
        if (base[f.name] !== undefined) {
          this.formatLoadedField(f, base);
          return;
        }
        if (f.field_type === 'checkbox' && f.multiple) {
          base[f.name] = [];
        } else if (f.field_type === 'checkbox' && !f.multiple) {
          base[f.name] = '';
        } else if (f.field_type === 'multiple_values') {
          base[f.name] = (f.options || []).length ? [] : [''];
        } else if (f.field_type === 'custom_object') {
          base[f.name] = {};
        } else if (f.field_type === 'file') {
          base[f.name] = '';
        } else if (f.field_type === 'number') {
          base[f.name] = null;
        } else {
          base[f.name] = '';
        }
      });
      return base;
    },
    sync() {
      this.$emit('input', { ...this.local });
    },
    embedFileFormKey(fieldName) {
      return buildCmsEmbedFileFormFieldName([...this.embedSegments, fieldName]);
    },
    embedFileNameList(field) {
      const names = this.embedFileNames[this.embedFileFormKey(field.name)];
      return Array.isArray(names) ? names : [];
    },
    onEmbedFileChange(field, event) {
      const selected = Array.from(event.target.files || []);
      const pathKey = this.embedFileFormKey(field.name);
      if (!selected.length) {
        this.$delete(this.embedFileNames, pathKey);
        if (typeof this.cmsEmbedFileRegister === 'function') {
          this.cmsEmbedFileRegister(pathKey, null);
        }
        return;
      }
      this.$set(
        this.embedFileNames,
        pathKey,
        selected.map((f) => f.name),
      );
      if (typeof this.cmsEmbedFileRegister === 'function') {
        const files = field.multiple ? selected : [selected[0]];
        this.cmsEmbedFileRegister(pathKey, files);
      }
    },
    nestedFields(slug) {
      const d = this.embeddedDefs[slug];
      return (d && d.fields) || [];
    },
    onNestedInput(fieldName, nestedVal) {
      this.$set(this.local, fieldName, { ...nestedVal });
      this.sync();
    },
    multiRows(name) {
      const v = this.local[name];
      return Array.isArray(v) ? v : [];
    },
    addMultiRow(name) {
      if (!Array.isArray(this.local[name])) {
        this.$set(this.local, name, []);
      }
      this.local[name].push('');
      this.sync();
    },
    removeMultiRow(name, idx) {
      if (!Array.isArray(this.local[name])) {
        return;
      }
      this.local[name].splice(idx, 1);
      this.sync();
    },
    toggleCheckboxField(name, option, checked) {
      const cur = Array.isArray(this.local[name]) ? [...this.local[name]] : [];
      if (checked) {
        if (!cur.includes(option)) {
          cur.push(option);
        }
      } else {
        const i = cur.indexOf(option);
        if (i !== -1) {
          cur.splice(i, 1);
        }
      }
      this.$set(this.local, name, cur);
      this.sync();
    },
    relationLabel(ref) {
      if (!ref || typeof ref !== 'object') {
        return '';
      }
      return ref.name || ref.title || ref.slug || ref.uid || '';
    },
    toRelationRef(item) {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const uid =
        item.uid != null
          ? String(item.uid)
          : item.item_uid != null
            ? String(item.item_uid)
            : item.id != null
              ? String(item.id)
              : item.item_id != null
                ? String(item.item_id)
                : item._id != null
                  ? String(item._id)
                  : '';
      const slug = item.slug != null ? String(item.slug) : '';
      const name = (item.name || item.title || slug || '').trim();
      const ref = { uid, slug, name };
      if (uid) {
        ref.id = uid;
      }
      return ref;
    },
    openProduct(fieldName) {
      this.productModal.fieldName = fieldName;
      this.productModal.visible = true;
    },
    openCollection(fieldName) {
      this.collectionModal.fieldName = fieldName;
      this.collectionModal.visible = true;
    },
    onProductSelect(item) {
      const fn = this.productModal.fieldName;
      if (!fn) {
        return;
      }
      this.$set(this.local, fn, this.toRelationRef(item));
      this.productModal.visible = false;
      this.sync();
    },
    onCollectionSelect(item) {
      const fn = this.collectionModal.fieldName;
      if (!fn) {
        return;
      }
      this.$set(this.local, fn, this.toRelationRef(item));
      this.collectionModal.visible = false;
      this.sync();
    },
  },
};
</script>

<style scoped>
.embedded-object-fields {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.nested-embed {
  margin-top: 8px;
  padding-left: 8px;
  border-left: 3px solid #cbd5e1;
}
.form-field {
  margin-bottom: 20px;
}
.form-field:last-child {
  margin-bottom: 0;
}
.form-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
  color: #334155;
}
.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  min-height: 44px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 14px;
  box-sizing: border-box;
}
.form-field textarea {
  min-height: 88px;
}
.form-field textarea.code-area {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
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
  font-weight: 500;
}
.multi-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: flex-start;
}
.multi-row input {
  flex: 1;
}
.relationship-field {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.selection-chip {
  background: #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}
.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}
.file-preview,
.uploaded-preview {
  margin-top: 8px;
  font-size: 13px;
  color: #475569;
}
.file-preview div,
.uploaded-preview div {
  word-break: break-all;
}
</style>
