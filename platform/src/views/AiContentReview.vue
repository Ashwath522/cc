<template>
  <div class="ai-review-container">
    <div class="header-section">
      <div>
        <router-link
          :to="{
            name: 'AiContentJobs',
            params: {
              company_id: $route.params.company_id,
              application_id: $route.params.application_id
            }
          }"
          class="back-link"
        >
          &larr; Back to AI Jobs
        </router-link>
        <h1 class="page-title">Content Review Queue</h1>
        <p class="subtitle">Review flagged rows, make manual edits, regenerate copy, or approve &amp; push to CMS.</p>
      </div>
      <div class="filter-group">
        <label>Filter by Status:</label>
        <select v-model="filterStatus" @change="fetchRows">
          <option value="">All Statuses</option>
          <option value="needs_review">Needs Review</option>
          <option value="approved">Approved</option>
          <option value="clean">Clean</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>

    <div v-if="loading && !rows.length" class="loading-state">Loading review items...</div>
    <div v-else-if="!rows.length" class="empty-state">
      <p>No items pending human review in this queue.</p>
    </div>

    <!-- Review Items List -->
    <div v-else class="review-items-list">
      <div v-for="row in rows" :key="row._id" class="review-card" :class="{'needs-review-border': row.status === 'needs_review'}">
        <div class="card-header">
          <div class="prod-title-group">
            <h3 class="product-name">{{ row.source_attributes?.name || row.product_ref?.name || 'Unnamed Product' }}</h3>
            <span class="sku-tag">SKU: {{ row.source_attributes?.item_code || row.product_ref?.uid || '-' }}</span>
            <span class="category-tag">{{ row.source_attributes?.category }} / {{ row.source_attributes?.subcategory }}</span>
          </div>
          <span class="status-pill" :class="row.status">{{ row.status }}</span>
        </div>

        <!-- Validation Errors Alert if any -->
        <div v-if="row.validation_result && !row.validation_result.valid" class="validation-box">
          <strong>Validation Issues:</strong>
          <ul>
            <li v-for="(err, eIdx) in row.validation_result.errors" :key="eIdx">{{ err }}</li>
          </ul>
        </div>

        <!-- Content Editors -->
        <div class="card-body">
          <div class="field-section">
            <div class="field-header">
              <label>Description Summary</label>
              <span v-if="isFieldEdited(row, 'description')" class="edited-badge">Human Edited</span>
              <span v-else class="ai-badge">AI Generated</span>
            </div>
            <textarea
              v-model="row.generated_content.description.summary"
              rows="4"
              class="field-input"
              :class="{'edited-input': isFieldEdited(row, 'description')}"
              @input="markFieldEdited(row, 'description')"
            />
          </div>

          <div class="field-section">
            <div class="field-header">
              <label>Care &amp; Maintenance Instructions</label>
              <span v-if="isFieldEdited(row, 'care_and_maintenance')" class="edited-badge">Human Edited</span>
              <span v-else class="ai-badge">AI Generated</span>
            </div>
            <div
              v-for="(instr, iIdx) in (row.generated_content.care_and_maintenance && row.generated_content.care_and_maintenance.instructions) || []"
              :key="'inst-' + iIdx"
              class="list-item-row"
            >
              <input
                v-model="row.generated_content.care_and_maintenance.instructions[iIdx]"
                class="field-input small"
                :class="{'edited-input': isFieldEdited(row, 'care_and_maintenance')}"
                @input="markFieldEdited(row, 'care_and_maintenance')"
              />
            </div>
          </div>

          <div class="field-section">
            <div class="field-header">
              <label>Avoid Instructions</label>
            </div>
            <div
              v-for="(av, aIdx) in (row.generated_content.care_and_maintenance && row.generated_content.care_and_maintenance.avoid) || []"
              :key="'av-' + aIdx"
              class="list-item-row"
            >
              <input
                v-model="row.generated_content.care_and_maintenance.avoid[aIdx]"
                class="field-input small"
                :class="{'edited-input': isFieldEdited(row, 'care_and_maintenance')}"
                @input="markFieldEdited(row, 'care_and_maintenance')"
              />
            </div>
          </div>

          <div class="field-section">
            <div class="field-header">
              <label>Warranty Status Line</label>
            </div>
            <input
              v-if="row.generated_content.warranty"
              v-model="row.generated_content.warranty.status_line"
              class="field-input"
              :class="{'edited-input': isFieldEdited(row, 'warranty')}"
              @input="markFieldEdited(row, 'warranty')"
            />
          </div>
        </div>

        <!-- Action Toolbar -->
        <div class="card-footer">
          <div class="left-actions">
            <button class="btn-feedback" @click="openFeedbackModal(row)">
              + Teach AI from Feedback
            </button>
          </div>
          <div class="right-actions">
            <button class="btn-secondary" :disabled="actionLoading" @click="handleRegenerate(row)">
              &#x21bb; Regenerate
            </button>
            <button class="btn-secondary" :disabled="actionLoading" @click="handleSaveEdits(row)">
              Save Edits
            </button>
            <button class="btn-push" :disabled="actionLoading" @click="handlePush(row)">
              Approve &amp; Push to CMS
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Training Modal -->
    <div v-if="showFeedbackModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Teach Rule to AI for {{ feedbackCategory }}</h2>
          <button class="btn-close" @click="showFeedbackModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Field</label>
            <select v-model="feedbackField">
              <option value="description">Description</option>
              <option value="care_and_maintenance">Care &amp; Maintenance</option>
              <option value="warranty">Warranty</option>
            </select>
          </div>
          <div class="form-group">
            <label>Human Feedback / Instruction</label>
            <textarea
              v-model="feedbackText"
              rows="4"
              placeholder="e.g. Always emphasize compact dimensions and polite tone for small bedrooms"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showFeedbackModal = false">Cancel</button>
          <button class="btn-primary" :disabled="actionLoading" @click="handleSendFeedback">
            Save Learned Rule
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  listReviewRows,
  editReviewRow,
  regenerateReviewRow,
  pushReviewRow,
  submitFeedback,
} from '../services/aiContent.service';

export default {
  name: 'AiContentReview',
  data() {
    return {
      rows: [],
      loading: false,
      actionLoading: false,
      filterStatus: 'needs_review',
      showFeedbackModal: false,
      feedbackCategory: '',
      feedbackField: 'description',
      feedbackText: '',
      feedbackRow: null,
    };
  },
  async mounted() {
    await this.fetchRows();
  },
  methods: {
    async fetchRows() {
      this.loading = true;
      try {
        const jobId = this.$route.params.job_id;
        const res = await listReviewRows(jobId, { status: this.filterStatus });
        this.rows = res.data?.rows || [];
      } catch (err) {
        console.error('Failed to list review rows:', err);
      } finally {
        this.loading = false;
      }
    },
    isFieldEdited(row, fieldName) {
      return (row.human_edited_fields || []).includes(fieldName);
    },
    markFieldEdited(row, fieldName) {
      if (!row.human_edited_fields) {
        this.$set(row, 'human_edited_fields', []);
      }
      if (!row.human_edited_fields.includes(fieldName)) {
        row.human_edited_fields.push(fieldName);
      }
    },
    async handleSaveEdits(row) {
      this.actionLoading = true;
      try {
        const jobId = this.$route.params.job_id;
        const res = await editReviewRow(jobId, row._id, row.generated_content);
        if (res.data?.success) {
          row.validation_result = res.data.validation;
          row.status = res.data.row.status;
          alert('Edits saved successfully.');
        }
      } catch (err) {
        alert('Failed to save edits: ' + (err.response?.data?.error || err.message));
      } finally {
        this.actionLoading = false;
      }
    },
    async handleRegenerate(row) {
      this.actionLoading = true;
      try {
        const jobId = this.$route.params.job_id;
        const res = await regenerateReviewRow(jobId, row._id);
        if (res.data?.success) {
          row.generated_content = res.data.row.generated_content;
          row.validation_result = res.data.validation;
          row.human_edited_fields = [];
          row.status = res.data.row.status;
        }
      } catch (err) {
        alert('Failed to regenerate item: ' + (err.response?.data?.error || err.message));
      } finally {
        this.actionLoading = false;
      }
    },
    async handlePush(row) {
      this.actionLoading = true;
      try {
        const jobId = this.$route.params.job_id;
        const res = await pushReviewRow(jobId, row._id);
        if (res.data?.success) {
          alert('Successfully pushed to CMS!');
          await this.fetchRows();
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        const valErrors = err.response?.data?.validation?.errors;
        alert(`Failed to push to CMS: ${errorMsg}\n${valErrors ? valErrors.join('\n') : ''}`);
      } finally {
        this.actionLoading = false;
      }
    },
    openFeedbackModal(row) {
      this.feedbackRow = row;
      this.feedbackCategory = row.source_attributes?.category || 'Beds';
      this.feedbackField = 'description';
      this.feedbackText = '';
      this.showFeedbackModal = true;
    },
    async handleSendFeedback() {
      if (!this.feedbackText.trim()) return;
      this.actionLoading = true;
      try {
        await submitFeedback({
          product_id: this.feedbackRow?.source_attributes?.id || '',
          category: this.feedbackCategory,
          field: this.feedbackField,
          feedback_text: this.feedbackText,
        });
        alert('Learned rule saved successfully. Subsequent AI runs for this category will reflect this rule.');
        this.showFeedbackModal = false;
      } catch (err) {
        alert('Failed to save rule: ' + (err.response?.data?.error || err.message));
      } finally {
        this.actionLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.ai-review-container {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.back-link {
  color: #4b5563;
  text-decoration: none;
  font-size: 13px;
  display: inline-block;
  margin-bottom: 8px;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.subtitle {
  color: #6b7280;
  margin: 4px 0 0 0;
}
.filter-group select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.review-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.review-card.needs-review-border {
  border-left: 4px solid #f59e0b;
}
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.sku-tag, .category-tag {
  font-size: 12px;
  background: #f3f4f6;
  color: #4b5563;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
}
.status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}
.status-pill.needs_review { background: #fef3c7; color: #92400e; }
.status-pill.approved { background: #d1fae5; color: #065f46; }
.status-pill.clean { background: #dbeafe; color: #1e40af; }
.validation-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  color: #b45309;
  font-size: 13px;
  margin: 16px 20px 0 20px;
  border-radius: 4px;
}
.validation-box ul {
  margin: 4px 0 0 16px;
  padding: 0;
}
.card-body {
  padding: 20px;
}
.field-section {
  margin-bottom: 16px;
}
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.field-header label {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}
.ai-badge {
  font-size: 11px;
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.edited-badge {
  font-size: 11px;
  background: #fdf2f8;
  color: #db2777;
  border: 1px solid #fbcfe8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.field-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
  color: #1f2937;
}
.field-input.edited-input {
  border-color: #f472b6;
  background-color: #fffdfd;
}
.field-input.small {
  margin-bottom: 6px;
}
.card-footer {
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.right-actions {
  display: flex;
  gap: 10px;
}
.btn-push {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-push:hover {
  background: #047857;
}
.btn-feedback {
  background: none;
  border: 1px dashed #6b7280;
  color: #4b5563;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.btn-feedback:hover {
  background: #f3f4f6;
  color: #111827;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: #ffffff;
  border-radius: 8px;
  width: 500px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  color: #374151;
}
.form-group select, .form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}
.loading-state, .empty-state {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}
</style>
