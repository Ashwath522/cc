<template>
  <div
    v-if="visible && definition"
    class="cms-api-modal-overlay"
    role="presentation"
    @click.self="onClose"
  >
    <div
      class="cms-api-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-api-modal-title"
    >
      <header class="cms-api-modal__header">
        <div>
          <h2 id="cms-api-modal-title" class="cms-api-modal__title">List API &amp; filters</h2>
          <p class="cms-api-modal__sub">
            <span class="cms-table__mono">{{ definition.slug }}</span>
            · {{ definition.name }}
          </p>
        </div>
        <button type="button" class="cms-api-modal__close" aria-label="Close" @click="onClose">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="cms-api-modal__body">
        <div
          v-if="definition.usage_mode === 'embedded_only'"
          class="cms-api-modal__callout cms-api-modal__callout--warn"
        >
          This definition is an <strong>embedded object</strong>. The list endpoint returns 403 for standalone
          access; data is stored on parent object documents only.
        </div>

        <div v-else-if="definition.status !== 'PUBLISHED'" class="cms-api-modal__callout">
          The list endpoint only works for a <strong>published</strong> definition. Publish this definition before
          calling the API below.
        </div>

        <section class="cms-api-modal__section">
          <h3 class="cms-api-modal__h3">GET — list object instances</h3>
          <p class="cms-api-modal__p">
            Returns paginated items: <span class="cms-table__mono">total</span>,
            <span class="cms-table__mono">page</span>, <span class="cms-table__mono">page_size</span>,
            <span class="cms-table__mono">items</span>.
          </p>
          <pre class="cms-api-modal__pre" tabindex="0">{{ listApiExampleUrl }}</pre>
        </section>

        <section class="cms-api-modal__section">
          <h3 class="cms-api-modal__h3">Query parameters</h3>
          <ul class="cms-api-modal__list">
            <li>
              <span class="cms-table__mono">application_id</span>, <span class="cms-table__mono">company_id</span>
              — required (same as other CMS API calls from this app).
            </li>
            <li>
              <span class="cms-table__mono">page</span> (default 1),
              <span class="cms-table__mono">page_size</span> (default 20, max 100).
            </li>
            <li>
              <span class="cms-table__mono">sort_by</span> (default <span class="cms-table__mono">createdAt</span>),
              <span class="cms-table__mono">sort_order</span> — <span class="cms-table__mono">asc</span> or
              <span class="cms-table__mono">desc</span>.
            </li>
            <li v-if="hasInstanceSlug">
              <span class="cms-table__mono">slug</span> — filter by instance slug (copied from the single product or
              collection field). Unique per company and application.
            </li>
          </ul>
        </section>

        <section v-if="hasInstanceSlug" class="cms-api-modal__section">
          <h3 class="cms-api-modal__h3">Instance slug</h3>
          <p class="cms-api-modal__p">
            This definition has a single product or collection field
            (<span class="cms-table__mono">{{ instanceSlugSourceField }}</span>). Each instance stores its
            <span class="cms-table__mono">slug</span> from that relation and it is indexed uniquely with
            <span class="cms-table__mono">company_id</span> and <span class="cms-table__mono">application_id</span>.
          </p>
          <pre class="cms-api-modal__pre" tabindex="0">{{ slugExampleUrl }}</pre>
        </section>

        <section class="cms-api-modal__section">
          <h3 class="cms-api-modal__h3">Filters</h3>
          <p class="cms-api-modal__p">
            Pass filters as query keys <span class="cms-table__mono">filter[fieldName]=…</span>. Only fields marked
            <strong>Filterable</strong> in the definition are applied; others are ignored.
          </p>
          <p v-if="filterableFieldLabels.length" class="cms-api-modal__p">
            Filterable fields for this type:
            <span class="cms-api-modal__tags">{{ filterableFieldLabels.join(', ') }}</span>
          </p>
          <p v-else class="cms-api-modal__p cms-api-modal__muted">
            No filterable fields on this definition yet. Enable “Filterable” on fields in the definition editor.
          </p>
          <ul class="cms-api-modal__list">
            <li>
              <strong>Text / long text / URL / HTML / JSON / custom object:</strong> single value uses a
              case-insensitive substring match (regex).
            </li>
            <li><strong>Number / date / date_time:</strong> exact match to the parsed value.</li>
            <li>
              <strong>Product / collection:</strong> match by UID, slug, or id string (see API implementation).
            </li>
            <li>
              <strong>Operators (plain object):</strong> use nested keys, e.g.
              <span class="cms-table__mono">filter[price][gte]=10</span>,
              <span class="cms-table__mono">filter[price][lte]=100</span>. Supported:
              <span class="cms-table__mono">gt</span>, <span class="cms-table__mono">gte</span>,
              <span class="cms-table__mono">lt</span>, <span class="cms-table__mono">lte</span>,
              <span class="cms-table__mono">in</span>, <span class="cms-table__mono">ne</span>.
            </li>
          </ul>
          <pre class="cms-api-modal__pre" tabindex="0">{{ filterExampleUrl }}</pre>
        </section>
      </div>

      <footer class="cms-api-modal__footer">
        <button type="button" class="cms-btn cms-btn--primary" @click="onClose">Done</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { url } from '../common/config';
import { getAppId, getCompany } from '../helper/utils';

export default {
  name: 'CmsListApiModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    definition: {
      type: Object,
      default: null,
    },
  },
  computed: {
    listApiExampleUrl() {
      const d = this.definition;
      if (!d) {
        return '';
      }
      const base = `${url.baseUrl}${url.baseApiUrl}`;
      const appId = getAppId() || '{application_id}';
      const companyId = getCompany() || '{company_id}';
      const q = new URLSearchParams({
        application_id: String(appId),
        company_id: String(companyId),
        page: '1',
        page_size: '20',
        sort_by: 'createdAt',
        sort_order: 'desc',
      });
      return `${base}/cms/${d.slug}?${q.toString()}`;
    },
    filterableFieldLabels() {
      const d = this.definition;
      if (!d || !Array.isArray(d.fields)) {
        return [];
      }
      return d.fields
        .filter((f) => f && f.is_filterable && f.name)
        .map((f) => `${f.label || f.name} (${f.name})`);
    },
    hasInstanceSlug() {
      const d = this.definition;
      if (!d || !Array.isArray(d.fields)) {
        return false;
      }
      return d.fields.some(
        (f) =>
          f &&
          (f.field_type === 'product' || f.field_type === 'collection') &&
          !f.multiple,
      );
    },
    instanceSlugSourceField() {
      const d = this.definition;
      if (!d || !Array.isArray(d.fields)) {
        return '';
      }
      const match = d.fields.find(
        (f) =>
          f &&
          (f.field_type === 'product' || f.field_type === 'collection') &&
          !f.multiple,
      );
      return match ? match.name : '';
    },
    slugExampleUrl() {
      const d = this.definition;
      if (!d) {
        return '';
      }
      const base = `${url.baseUrl}${url.baseApiUrl}`;
      const appId = getAppId() || '{application_id}';
      const companyId = getCompany() || '{company_id}';
      const q = new URLSearchParams({
        application_id: String(appId),
        company_id: String(companyId),
        slug: 'product-or-collection-slug',
      });
      return `${base}/cms/${d.slug}?${q.toString()}`;
    },
    filterExampleUrl() {
      const d = this.definition;
      if (!d) {
        return '';
      }
      const base = `${url.baseUrl}${url.baseApiUrl}`;
      const appId = getAppId() || '{application_id}';
      const companyId = getCompany() || '{company_id}';
      const filterField = d.fields && d.fields.find((f) => f && f.is_filterable && f.name);
      const exampleName = filterField ? filterField.name : 'your_filterable_field';
      const q = new URLSearchParams({
        application_id: String(appId),
        company_id: String(companyId),
        page: '1',
        page_size: '20',
      });
      q.append(`filter[${exampleName}]`, filterField && filterField.field_type === 'text' ? 'search text' : 'value');
      return `${base}/cms/${d.slug}?${q.toString()}`;
    },
  },
  methods: {
    onClose() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
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

.cms-api-modal__section {
  margin-bottom: 20px;
}

.cms-api-modal__h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
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

.cms-api-modal__pre {
  margin: 0;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.45;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #0f172a;
  white-space: pre-wrap;
  word-break: break-all;
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

.cms-api-modal__tags {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.cms-api-modal__footer {
  padding: 14px 22px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}
</style>
