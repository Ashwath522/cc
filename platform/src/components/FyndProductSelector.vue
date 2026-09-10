<template>
  <div class="fynd-selector-overlay" @click.self="$emit('close')">
    <div class="fynd-selector-modal" role="dialog" aria-labelledby="product-selector-title">
      <header class="fynd-selector-header">
        <div>
          <p class="fynd-selector-eyebrow">Browse</p>
          <h2 id="product-selector-title" class="fynd-selector-title">Select product</h2>
          <p class="fynd-selector-sub">Search by name or SKU, then pick a product to link.</p>
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
          placeholder="Search products…"
          autocomplete="off"
          @keyup.enter="search"
        />
        <button type="button" class="cms-btn cms-btn--primary fynd-selector-search-btn" @click="search">
          Search
        </button>
      </div>

      <div class="fynd-selector-body">
        <div v-if="loading" class="fynd-selector-state">
          <span class="fynd-selector-spinner" aria-hidden="true" />
          <span>Searching…</span>
        </div>
        <div v-else-if="items.length === 0" class="fynd-selector-state fynd-selector-state--empty">
          <p class="fynd-selector-empty-title">No products found</p>
          <p class="fynd-selector-empty-hint">Try another keyword or check the spelling.</p>
        </div>
        <ul v-else class="fynd-selector-list">
          <li v-for="item in items" :key="item._id || item.uid || item.slug" class="fynd-selector-row">
            <div class="fynd-selector-row-main">
              <span class="fynd-selector-name">{{ item.name || item.title || item.slug }}</span>
              <span class="fynd-selector-meta">
                <span v-if="item.slug" class="fynd-selector-chip">/{{ item.slug }}</span>
                <span v-if="uidLabel(item)" class="fynd-selector-id">{{ uidLabel(item) }}</span>
                <span v-if="item.sku" class="fynd-selector-code">SKU: {{ item.sku }}</span>
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
import { searchProducts } from '../services/fyndProduct.service';

export default {
  name: 'FyndProductSelector',
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      query: '',
      items: [],
      loading: false,
    };
  },
  methods: {
    uidLabel(item) {
      if (!item || typeof item !== 'object') return '';
      const id = item.uid != null ? item.uid : item._id;
      return id != null ? String(id) : '';
    },
    async search() {
      if (!this.query || !String(this.query).trim()) {
        return;
      }
      this.loading = true;
      try {
        const response = await searchProducts(this.query.trim());
        this.items = (response.data && response.data.items) || [];
      } catch (error) {
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    select(item) {
      this.$emit('select', item);
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
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.04);
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
  letter-spacing: -0.02em;
  color: #0f172a;
}

.fynd-selector-sub {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #64748b;
  max-width: 36ch;
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
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.fynd-selector-close:hover {
  background: #e2e8f0;
  color: #0f172a;
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
  color: #0f172a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.fynd-selector-input::placeholder {
  color: #94a3b8;
}

.fynd-selector-input:hover {
  border-color: #cbd5e1;
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
  max-width: 28ch;
}

.fynd-selector-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: fynd-spin 0.7s linear infinite;
}

@keyframes fynd-spin {
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
  transition: background 0.12s ease, border-color 0.12s ease;
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
  line-height: 1.35;
}

.fynd-selector-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.fynd-selector-chip {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
}

.fynd-selector-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: #94a3b8;
}

.fynd-selector-code {
  font-size: 12px;
  color: #64748b;
}
</style>
