<template>
  <div class="fynd-selector-overlay" @click.self="$emit('close')">
    <div class="fynd-selector-modal" role="dialog" aria-labelledby="custom-obj-selector-title">
      <header class="fynd-selector-header">
        <div>
          <p class="fynd-selector-eyebrow">CMS object</p>
          <h2 id="custom-obj-selector-title" class="fynd-selector-title">Select entry</h2>
          <p class="fynd-selector-sub">Choose an instance from “{{ definitionTitle }}” ({{ refSlug }}).</p>
        </div>
        <button type="button" class="fynd-selector-close" aria-label="Close" @click="$emit('close')">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="fynd-selector-search">
        <span class="fynd-selector-search-icon" aria-hidden="true">⌕</span>
        <input
          v-model="query"
          type="search"
          class="fynd-selector-input"
          placeholder="Filter current results…"
          autocomplete="off"
          @input="applyLocalFilter"
        />
        <button type="button" class="cms-btn cms-btn--primary fynd-selector-search-btn" @click="fetchItems">
          Refresh
        </button>
      </div>

      <div class="fynd-selector-body">
        <div v-if="loading" class="fynd-selector-state">
          <span class="fynd-selector-spinner" aria-hidden="true" />
          <span>Loading…</span>
        </div>
        <div v-else-if="filteredItems.length === 0" class="fynd-selector-state fynd-selector-state--empty">
          <p class="fynd-selector-empty-title">No entries found</p>
          <p class="fynd-selector-empty-hint">Create objects for this definition first, or refresh the list.</p>
        </div>
        <ul v-else class="fynd-selector-list">
          <li
            v-for="item in filteredItems"
            :key="item._id"
            class="fynd-selector-row"
          >
            <div class="fynd-selector-row-main">
              <span class="fynd-selector-name">{{ rowLabel(item) }}</span>
              <span class="fynd-selector-meta">
                <span class="fynd-selector-chip">{{ item._id }}</span>
              </span>
            </div>
            <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" @click="select(item)">
              Choose
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { listInstances, getDefinitionBySlug } from '../services/objectInstance.service';

export default {
  name: 'CustomObjectSelector',
  props: {
    refSlug: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      query: '',
      items: [],
      loading: false,
      definitionTitle: '',
      defFields: [],
    };
  },
  computed: {
    filteredItems() {
      const q = (this.query || '').trim().toLowerCase();
      if (!q) {
        return this.items;
      }
      return this.items.filter((item) => {
        const label = this.rowLabel(item).toLowerCase();
        const id = String(item._id || '').toLowerCase();
        return label.includes(q) || id.includes(q);
      });
    },
  },
  async mounted() {
    await this.loadDefinitionMeta();
    await this.fetchItems();
  },
  methods: {
    rowLabel(item) {
      const first = this.defFields.find((f) => f.name && f.field_type !== 'file');
      if (first && item[first.name] != null && item[first.name] !== '') {
        const v = item[first.name];
        if (typeof v === 'object') {
          return v.name || v.title || v._id || JSON.stringify(v);
        }
        return String(v);
      }
      return item.name || item.title || item.slug || String(item._id || '');
    },
    async loadDefinitionMeta() {
      try {
        const res = await getDefinitionBySlug(this.refSlug);
        const d = res.data || {};
        this.definitionTitle = d.name || this.refSlug;
        this.defFields = d.fields || [];
      } catch (e) {
        this.definitionTitle = this.refSlug;
        this.defFields = [];
      }
    },
    async fetchItems() {
      this.loading = true;
      try {
        const res = await listInstances(this.refSlug, { page: 1, page_size: 100 });
        this.items = (res.data && res.data.items) || [];
      } catch (e) {
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    applyLocalFilter() {
      /* computed handles filter */
    },
    select(item) {
      const first = this.defFields.find((f) => f.name && f.field_type !== 'file');
      let name = String(item._id || '');
      if (first && item[first.name] != null && item[first.name] !== '') {
        const v = item[first.name];
        name = typeof v === 'object' ? (v.name || v.title || name) : String(v);
      }
      this.$emit('select', {
        _id: String(item._id),
        name,
        ref_slug: this.refSlug,
      });
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.fynd-selector-overlay {
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
.fynd-selector-modal {
  width: 100%;
  max-width: 560px;
  max-height: min(90vh, 640px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}
.fynd-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 22px 22px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.fynd-selector-eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}
.fynd-selector-title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}
.fynd-selector-sub {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  max-width: 40ch;
}
.fynd-selector-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 24px;
  cursor: pointer;
}
.fynd-selector-close:hover {
  background: #e2e8f0;
}
.fynd-selector-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.fynd-selector-search-icon {
  position: absolute;
  left: 34px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #94a3b8;
  pointer-events: none;
}
.fynd-selector-input {
  flex: 1;
  min-width: 0;
  padding: 11px 14px 11px 38px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}
.fynd-selector-input:focus {
  outline: none;
  border-color: #93c5fd;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.fynd-selector-search-btn {
  flex-shrink: 0;
}
.fynd-selector-body {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.fynd-selector-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  color: #64748b;
  font-size: 14px;
}
.fynd-selector-state--empty {
  text-align: center;
}
.fynd-selector-empty-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}
.fynd-selector-empty-hint {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}
.fynd-selector-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: co-spin 0.7s linear infinite;
}
@keyframes co-spin {
  to {
    transform: rotate(360deg);
  }
}
.fynd-selector-list {
  list-style: none;
  margin: 0;
  padding: 8px 12px 16px;
  overflow-y: auto;
  flex: 1;
}
.fynd-selector-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  border: 1px solid transparent;
}
.fynd-selector-row:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.fynd-selector-row-main {
  min-width: 0;
  flex: 1;
}
.fynd-selector-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.fynd-selector-meta {
  display: block;
  margin-top: 6px;
}
.fynd-selector-chip {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
}
</style>
