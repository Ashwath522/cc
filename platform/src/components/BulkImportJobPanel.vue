<template>
  <div class="cms-bulk-bar cms-card">
    <h3 class="cms-bulk-bar__title">Bulk import</h3>
    <p class="cms-bulk-bar__hint">
      Download a template (row 2 is example data—replace before import; Excel has a
      <strong>Field guide</strong> sheet). Column headers must match field names. Upload a
      <strong>spreadsheet</strong> and an <strong>assets ZIP</strong> together.
      <strong>File</strong> fields: use filename <em>with or without extension</em>, comma-separated for multiple
      (e.g. <code>hero,banner</code> or <code>hero.jpg,banner.png</code>). Files must exist in the assets ZIP.
      <strong>Product</strong> fields: enter SKU codes (comma-separated for multiple).
    </p>
    <div class="cms-bulk-bar__actions">
      <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="downloadTemplate('xlsx')">
        Download Excel template
      </button>
      <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="downloadTemplate('csv')">
        Download CSV template
      </button>
      <input
        ref="spreadsheetInput"
        type="file"
        class="cms-bulk-file-input"
        accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        @change="onSpreadsheetSelected"
      />
      <input
        ref="assetsInput"
        type="file"
        class="cms-bulk-file-input"
        accept=".zip,application/zip,application/x-zip-compressed"
        @change="onAssetsSelected"
      />
      <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="pickSpreadsheet">
        Choose spreadsheet…
      </button>
      <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" @click="pickAssets">
        Choose assets ZIP…
      </button>
      <button
        type="button"
        class="cms-btn cms-btn--primary cms-btn--sm"
        :disabled="!canStart || starting"
        @click="startImport"
      >
        {{ starting ? 'Starting…' : 'Start import' }}
      </button>
    </div>
    <p v-if="spreadsheetName || assetsName" class="cms-bulk-bar__file">
      <span v-if="spreadsheetName">Spreadsheet: {{ spreadsheetName }}</span>
      <span v-if="spreadsheetName && assetsName"> · </span>
      <span v-if="assetsName">Assets: {{ assetsName }}</span>
    </p>

    <div v-if="activeJob && isRunning" class="cms-bulk-progress">
      <div class="cms-bulk-progress__header">
        <span class="cms-bulk-progress__badge" :class="statusBadgeClass(activeJob.status)">{{ statusLabel(activeJob.status) }}</span>
        <span v-if="activeJob.total_rows" class="cms-bulk-progress__counts">
          {{ activeJob.processed_rows || 0 }} / {{ activeJob.total_rows }} rows
          · {{ activeJob.created_count || 0 }} created
          · {{ activeJob.failed_count || 0 }} failed
        </span>
      </div>
      <div v-if="activeJob.total_rows" class="cms-bulk-progress__bar-wrap">
        <div class="cms-bulk-progress__bar" :style="{ width: progressPercent + '%' }" />
      </div>
      <p v-if="activeJob.error_message" class="cms-bulk-progress__error">{{ activeJob.error_message }}</p>
    </div>

    <div class="cms-bulk-jobs">
      <div class="cms-bulk-jobs__header">
        <h4 class="cms-bulk-jobs__title">Import history</h4>
        <button type="button" class="cms-btn cms-btn--secondary cms-btn--sm" :disabled="jobsLoading" @click="fetchJobs">
          {{ jobsLoading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
      <p v-if="jobsLoading && !jobs.length" class="cms-bulk-jobs__empty">Loading jobs…</p>
      <p v-else-if="!jobs.length" class="cms-bulk-jobs__empty">No bulk imports yet.</p>
      <div v-else class="cms-bulk-jobs__table-wrap">
        <table class="cms-bulk-jobs__table">
          <thead>
            <tr>
              <th>Started</th>
              <th>Status</th>
              <th>Total</th>
              <th>Success</th>
              <th>Failed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.job_id">
              <td>{{ formatDate(job.created_at) }}</td>
              <td>
                <span class="cms-bulk-progress__badge" :class="statusBadgeClass(job.status)">
                  {{ statusLabel(job.status) }}
                </span>
              </td>
              <td>{{ job.total_rows || '—' }}</td>
              <td class="cms-bulk-jobs__success">{{ job.created_count || 0 }}</td>
              <td class="cms-bulk-jobs__failed">{{ job.failed_count || 0 }}</td>
              <td>
                <button
                  v-if="job.can_download_report"
                  type="button"
                  class="cms-btn cms-btn--secondary cms-btn--sm"
                  @click="downloadReportForJob(job.job_id)"
                >
                  Download report
                </button>
                <span v-else-if="job.status === 'pending' || job.status === 'processing'" class="cms-bulk-jobs__muted">
                  In progress…
                </span>
                <span v-else-if="job.error_message" class="cms-bulk-jobs__error-text" :title="job.error_message">
                  {{ job.error_message }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  downloadBulkTemplateBlob,
  startBulkImportAsync,
  getBulkImportJobStatus,
  listBulkImportJobs,
  downloadBulkImportReport,
} from '../services/objectInstance.service';

const TERMINAL = new Set(['completed', 'failed']);
const POLL_MS = 2500;

export default {
  name: 'BulkImportJobPanel',
  props: {
    slug: { type: String, required: true },
  },
  data() {
    return {
      spreadsheetFile: null,
      spreadsheetName: '',
      assetsFile: null,
      assetsName: '',
      starting: false,
      activeJob: null,
      pollTimer: null,
      jobs: [],
      jobsLoading: false,
    };
  },
  computed: {
    canStart() {
      return Boolean(this.slug && this.spreadsheetFile && this.assetsFile && !this.isRunning);
    },
    isRunning() {
      const s = this.activeJob && this.activeJob.status;
      return s === 'pending' || s === 'processing';
    },
    progressPercent() {
      if (!this.activeJob || !this.activeJob.total_rows) {
        return 0;
      }
      return Math.min(
        100,
        Math.round(((this.activeJob.processed_rows || 0) / this.activeJob.total_rows) * 100),
      );
    },
  },
  watch: {
    slug: {
      immediate: true,
      handler(val) {
        if (val) {
          this.fetchJobs();
        }
      },
    },
  },
  beforeDestroy() {
    this.stopPolling();
  },
  methods: {
    statusLabel(status) {
      const map = {
        pending: 'Queued',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
      };
      return map[status] || status || '—';
    },
    statusBadgeClass(status) {
      return `cms-bulk-progress__badge--${status || 'unknown'}`;
    },
    formatDate(value) {
      if (!value) {
        return '—';
      }
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return `${value}`;
      }
    },
    pickSpreadsheet() {
      const el = this.$refs.spreadsheetInput;
      if (el) {
        el.click();
      }
    },
    pickAssets() {
      const el = this.$refs.assetsInput;
      if (el) {
        el.click();
      }
    },
    onSpreadsheetSelected(event) {
      const f = event.target.files && event.target.files[0];
      this.spreadsheetFile = f || null;
      this.spreadsheetName = f ? f.name : '';
    },
    onAssetsSelected(event) {
      const f = event.target.files && event.target.files[0];
      this.assetsFile = f || null;
      this.assetsName = f ? f.name : '';
    },
    async fetchJobs() {
      if (!this.slug) {
        return;
      }
      this.jobsLoading = true;
      try {
        const res = await listBulkImportJobs(this.slug);
        this.jobs = (res.data && res.data.jobs) || [];
      } catch (e) {
        /* axios error toast */
      } finally {
        this.jobsLoading = false;
      }
    },
    async downloadTemplate(format) {
      if (!this.slug) {
        return;
      }
      try {
        const res = await downloadBulkTemplateBlob(this.slug, format);
        const ext = format === 'csv' ? 'csv' : 'xlsx';
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-template-${this.slug}.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          Vue.snackbar.showSuccess(`Downloaded ${ext.toUpperCase()} template.`);
        }
      } catch (e) {
        /* axios error toast */
      }
    },
    async startImport() {
      if (!this.canStart) {
        return;
      }
      this.starting = true;
      try {
        const res = await startBulkImportAsync(this.slug, this.spreadsheetFile, this.assetsFile);
        const jobId = res.data && res.data.job_id;
        if (!jobId) {
          throw new Error('No job id returned');
        }
        this.spreadsheetFile = null;
        this.assetsFile = null;
        this.spreadsheetName = '';
        this.assetsName = '';
        if (this.$refs.spreadsheetInput) {
          this.$refs.spreadsheetInput.value = '';
        }
        if (this.$refs.assetsInput) {
          this.$refs.assetsInput.value = '';
        }
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          Vue.snackbar.showSuccess('Bulk import started.');
        }
        await this.pollJob(jobId);
        this.startPolling(jobId);
        await this.fetchJobs();
      } finally {
        this.starting = false;
      }
    },
    async pollJob(jobId) {
      const res = await getBulkImportJobStatus(this.slug, jobId);
      this.activeJob = res.data || null;
      if (this.activeJob && TERMINAL.has(this.activeJob.status)) {
        this.stopPolling();
        this.$emit('import-complete', this.activeJob);
        await this.fetchJobs();
        if (Vue.snackbar && typeof Vue.snackbar.showSuccess === 'function') {
          if (this.activeJob.status === 'completed') {
            Vue.snackbar.showSuccess(
              `Import finished: ${this.activeJob.created_count || 0} created, ${this.activeJob.failed_count || 0} failed.`,
            );
          } else if (this.activeJob.error_message) {
            Vue.snackbar.showWarning(this.activeJob.error_message);
          }
        }
        this.activeJob = null;
      } else if (this.isRunning) {
        await this.fetchJobs();
      }
    },
    startPolling(jobId) {
      this.stopPolling();
      this.pollTimer = setInterval(() => {
        this.pollJob(jobId).catch(() => {});
      }, POLL_MS);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async downloadReportForJob(jobId) {
      if (!jobId) {
        return;
      }
      try {
        const res = await downloadBulkImportReport(this.slug, jobId, 'xlsx');
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk-import-report-${this.slug}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        /* axios error toast */
      }
    },
  },
};
</script>

<style scoped>
.cms-bulk-bar {
  margin-bottom: 20px;
  padding: 16px 18px;
}

.cms-bulk-bar__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.cms-bulk-bar__hint {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
  max-width: 56rem;
}

.cms-bulk-bar__hint code {
  font-size: 12px;
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 4px;
}

.cms-bulk-bar__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.cms-bulk-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.cms-bulk-bar__file {
  margin: 10px 0 0;
  font-size: 13px;
  color: #475569;
}

.cms-bulk-progress {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.cms-bulk-progress__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.cms-bulk-progress__badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background: #f1f5f9;
  color: #475569;
}

.cms-bulk-progress__badge--pending,
.cms-bulk-progress__badge--processing {
  background: #dbeafe;
  color: #1d4ed8;
}

.cms-bulk-progress__badge--completed {
  background: #dcfce7;
  color: #15803d;
}

.cms-bulk-progress__badge--failed {
  background: #fee2e2;
  color: #b91c1c;
}

.cms-bulk-progress__counts {
  font-size: 13px;
  color: #64748b;
}

.cms-bulk-progress__bar-wrap {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.cms-bulk-progress__bar {
  height: 100%;
  background: #2563eb;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.cms-bulk-progress__error {
  margin: 0 0 8px;
  font-size: 13px;
  color: #b91c1c;
}

.cms-bulk-jobs {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.cms-bulk-jobs__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cms-bulk-jobs__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.cms-bulk-jobs__empty {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.cms-bulk-jobs__table-wrap {
  overflow-x: auto;
}

.cms-bulk-jobs__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cms-bulk-jobs__table th,
.cms-bulk-jobs__table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.cms-bulk-jobs__table th {
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
}

.cms-bulk-jobs__success {
  color: #15803d;
  font-weight: 600;
}

.cms-bulk-jobs__failed {
  color: #b91c1c;
  font-weight: 600;
}

.cms-bulk-jobs__muted {
  font-size: 12px;
  color: #94a3b8;
}

.cms-bulk-jobs__error-text {
  font-size: 12px;
  color: #b91c1c;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style>
