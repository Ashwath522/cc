<template>
  <div class="ai-jobs-container">
    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">AI Content Generation Jobs</h1>
        <p class="subtitle">Generate high quality, catalog-grounded product descriptions and care attributes by category.</p>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="showStartModal = true">
          + Start AI Content Job
        </button>
      </div>
    </div>

    <!-- Start Job Modal / Card -->
    <div v-if="showStartModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Start New AI Content Generation Run</h2>
          <button class="btn-close" @click="showStartModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Target Category / Subcategory</label>
            <select v-model="selectedCategory">
              <option value="Beds">Bedroom / Beds</option>
              <option value="Bedroom Storage">Bedroom / Bedroom Storage</option>
              <option value="Mattresses">Bedroom / Mattresses</option>
              <option value="Wardrobes">Bedroom / Wardrobes</option>
              <option value="Kids Room">Bedroom / Kids Room</option>
              <option value="Pet Furniture">Bedroom / Pet Furniture</option>
              <option value="Dining">Dining</option>
              <option value="Living Room">Living Room</option>
              <option value="Decor">Decor</option>
            </select>
          </div>

          <div class="form-group">
            <label>Voice & Tone Preset</label>
            <select v-model="selectedTone">
              <option value="auto">Auto (Price-tier driven voice)</option>
              <option value="warm_inviting">Warm & Inviting (Cozy, lived-in, everyday rituals)</option>
              <option value="elegant_sophisticated">Elegant & Sophisticated (Restrained, timeless, tailored)</option>
              <option value="minimal_modern">Minimal & Modern (Crisp, clean lines, low adjective density)</option>
              <option value="premium_indulgent">Premium & Indulgent (Opulent, heirloom, craftsmanship)</option>
              <option value="playful_casual">Playful & Casual (Breezy, conversational, upbeat)</option>
            </select>
            <p class="hint">Sets the emotional tone and vocabulary across description prose.</p>
          </div>

          <div class="form-group">
            <label>Target CMS Definition (Optional for direct push)</label>
            <select v-model="selectedDefinitionSlug">
              <option value="">No direct CMS push (Review Queue only)</option>
              <option v-for="def in definitions" :key="def.slug" :value="def.slug">
                {{ def.name }} ({{ def.slug }})
              </option>
            </select>
            <p class="hint">Clean rows will be automatically upserted to this CMS collection.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showStartModal = false">Cancel</button>
          <button class="btn-preview-action" :disabled="previewLoading" @click="handlePreview">
            {{ previewLoading ? 'Generating Preview...' : '🔍 Preview (2-3 Items)' }}
          </button>
          <button class="btn-primary" :disabled="loading" @click="handleStartJob">
            {{ loading ? 'Starting...' : 'Launch Full Run' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Results Panel -->
    <div v-if="previewItems.length" class="preview-panel card">
      <div class="preview-header">
        <div>
          <h2>On-Screen Preview: {{ previewCategory }} ({{ previewItems.length }} Products)</h2>
          <p class="subtitle">Evaluate tone and structure before launching full run.</p>
        </div>
        <div class="preview-controls">
          <label>Tone Preset:</label>
          <select v-model="selectedTone" :disabled="previewLoading" @change="handleRePreview">
            <option value="auto">Auto (Tier-based)</option>
            <option value="warm_inviting">Warm & Inviting</option>
            <option value="elegant_sophisticated">Elegant & Sophisticated</option>
            <option value="minimal_modern">Minimal & Modern</option>
            <option value="premium_indulgent">Premium & Indulgent</option>
            <option value="playful_casual">Playful & Casual</option>
          </select>
          <button class="btn-primary" :disabled="confirming" @click="handleConfirmFullRun">
            {{ confirming ? 'Enqueuing...' : '🚀 Generate All' }}
          </button>
        </div>
      </div>

      <div class="preview-grid">
        <div v-for="(item, idx) in previewItems" :key="idx" class="preview-card">
          <div class="item-title">{{ item.source_product.name }}</div>
          <div class="item-summary">{{ item.generated_content.description?.summary }}</div>
          <div v-if="item.generated_content.description?.key_features?.length" class="item-bullets">
            <ul>
              <li v-for="(b, bIdx) in item.generated_content.description.key_features" :key="bIdx">{{ b }}</li>
            </ul>
          </div>
          <div class="item-meta">
            <span class="badge" :class="item.validation?.valid ? 'badge-success' : 'badge-warning'">
              {{ item.validation?.valid ? 'Valid Structure' : 'Validation Flags' }}
            </span>
            <span class="badge badge-info">Tone: {{ item.tone }}</span>
          </div>
        </div>
      </div>

      <!-- Free-text Feedback in Preview Panel -->
      <div class="feedback-box">
        <label>Refine with Feedback (creates reusable content rule):</label>
        <div class="feedback-input-row">
          <input
            v-model="feedbackText"
            placeholder="e.g., Avoid mentioning raw measurements in the summary"
            @keyup.enter="handleSubmitFeedback"
          />
          <button class="btn-secondary" :disabled="!feedbackText.trim() || feedbackSubmitting" @click="handleSubmitFeedback">
            {{ feedbackSubmitting ? 'Saving...' : 'Apply Feedback Rule' }}
          </button>
        </div>
        <p v-if="feedbackSuccess" class="text-success">{{ feedbackSuccess }}</p>
      </div>
    </div>

    <!-- Jobs Table -->
    <div class="table-card">
      <div v-if="loading && !jobs.length" class="loading-state">Loading jobs...</div>
      <div v-else-if="!jobs.length" class="empty-state">
        <p>No AI content generation jobs found. Start your first job to generate content.</p>
      </div>
      <table v-else class="jobs-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Category</th>
            <th>Status</th>
            <th>Total Products</th>
            <th>Clean / Pushed</th>
            <th>Needs Review</th>
            <th>Failed</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in jobs" :key="job._id">
            <td class="mono">{{ job._id.slice(-6) }}</td>
            <td><strong>{{ job.category || (job.category_ids && job.category_ids.join(', ')) || 'All' }}</strong></td>
            <td>
              <span class="status-badge" :class="job.status">
                {{ job.status }}
              </span>
            </td>
            <td>{{ job.total_count }}</td>
            <td>
              <span class="text-success">{{ job.clean_count }}</span>
              <span v-if="job.pushed_count"> ({{ job.pushed_count }} pushed)</span>
            </td>
            <td>
              <span :class="{'text-warning': job.needs_review_count > 0}">{{ job.needs_review_count }}</span>
            </td>
            <td>
              <span :class="{'text-danger': job.failed_count > 0}">{{ job.failed_count }}</span>
            </td>
            <td>{{ formatDate(job.created_at) }}</td>
            <td>
              <router-link
                :to="{
                  name: 'AiContentReview',
                  params: {
                    company_id: $route.params.company_id,
                    application_id: $route.params.application_id,
                    job_id: job._id
                  }
                }"
                class="btn-review"
              >
                Review Items
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  startAiJob,
  listAiJobs,
  previewAiJob,
  confirmAiJob,
  submitFeedback,
} from '../services/aiContent.service';
import { listDefinitions } from '../services/objectDefinition.service';

export default {
  name: 'AiContentJobs',
  data() {
    return {
      jobs: [],
      definitions: [],
      loading: false,
      previewLoading: false,
      confirming: false,
      feedbackSubmitting: false,
      showStartModal: false,
      selectedCategory: 'Beds',
      selectedDefinitionSlug: '',
      selectedTone: 'auto',
      previewCategory: '',
      previewJobId: null,
      previewItems: [],
      feedbackText: '',
      feedbackSuccess: '',
      pollInterval: null,
    };
  },
  async mounted() {
    await this.fetchData();
    this.pollInterval = setInterval(this.fetchJobs, 6000);
  },
  beforeDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        await Promise.all([this.fetchJobs(), this.fetchDefinitions()]);
      } finally {
        this.loading = false;
      }
    },
    async fetchJobs() {
      try {
        const res = await listAiJobs();
        this.jobs = res.data?.jobs || [];
      } catch (err) {
        console.error('Failed to list AI jobs:', err);
      }
    },
    async fetchDefinitions() {
      try {
        const res = await listDefinitions();
        this.definitions = (res.data || []).filter((d) => d.status === 'PUBLISHED');
      } catch (err) {
        console.error('Failed to list definitions:', err);
      }
    },
    async handleStartJob() {
      this.loading = true;
      try {
        await startAiJob({
          category: this.selectedCategory,
          category_ids: [this.selectedCategory],
          definition_slug: this.selectedDefinitionSlug,
          selected_tone: this.selectedTone,
        });
        this.showStartModal = false;
        await this.fetchJobs();
      } catch (err) {
        alert('Failed to start job: ' + (err.response?.data?.error || err.message));
      } finally {
        this.loading = false;
      }
    },
    async handlePreview() {
      this.previewLoading = true;
      this.feedbackSuccess = '';
      try {
        // Start job in PREVIEW status or create preview job
        const jobRes = await startAiJob({
          category: this.selectedCategory,
          category_ids: [this.selectedCategory],
          definition_slug: this.selectedDefinitionSlug,
          selected_tone: this.selectedTone,
        });
        const job = jobRes.data?.job;
        if (!job) throw new Error('Could not create preview job');

        this.previewJobId = job._id;
        this.previewCategory = this.selectedCategory;

        // Fetch preview items
        const previewRes = await previewAiJob(job._id, {
          tone: this.selectedTone,
          count: 3,
        });

        this.previewItems = previewRes.data?.preview_items || [];
        this.showStartModal = false;
        await this.fetchJobs();
      } catch (err) {
        alert('Preview generation failed: ' + (err.response?.data?.error || err.message));
      } finally {
        this.previewLoading = false;
      }
    },
    async handleRePreview() {
      if (!this.previewJobId) return;
      this.previewLoading = true;
      this.feedbackSuccess = '';
      try {
        const previewRes = await previewAiJob(this.previewJobId, {
          tone: this.selectedTone,
          count: 3,
        });
        this.previewItems = previewRes.data?.preview_items || [];
      } catch (err) {
        alert('Re-preview failed: ' + (err.response?.data?.error || err.message));
      } finally {
        this.previewLoading = false;
      }
    },
    async handleConfirmFullRun() {
      if (!this.previewJobId) return;
      this.confirming = true;
      try {
        await confirmAiJob(this.previewJobId, {
          tone: this.selectedTone,
        });
        alert('Full AI content generation launched with selected tone!');
        this.previewItems = [];
        this.previewJobId = null;
        await this.fetchJobs();
      } catch (err) {
        alert('Failed to confirm job: ' + (err.response?.data?.error || err.message));
      } finally {
        this.confirming = false;
      }
    },
    async handleSubmitFeedback() {
      if (!this.feedbackText.trim() || !this.previewCategory) return;
      this.feedbackSubmitting = true;
      try {
        await submitFeedback({
          category: this.previewCategory,
          field: 'summary',
          feedback_text: this.feedbackText.trim(),
        });
        this.feedbackSuccess = '✓ Rule saved! Subsequent runs and preview regenerations will honor this rule.';
        this.feedbackText = '';
        // Automatically re-preview to show the effect of the new rule
        await this.handleRePreview();
      } catch (err) {
        alert('Failed to submit feedback: ' + (err.response?.data?.error || err.message));
      } finally {
        this.feedbackSubmitting = false;
      }
    },
    formatDate(d) {
      if (!d) return '-';
      return new Date(d).toLocaleString();
    },
  },
};
</script>

<style scoped>
.ai-jobs-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-top: 4px;
}
.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.table-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.jobs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.jobs-table th, .jobs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}
.jobs-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.running { background: #dbeafe; color: #1e40af; }
.status-badge.completed { background: #d1fae5; color: #065f46; }
.status-badge.failed { background: #fee2e2; color: #991b1b; }
.text-success { color: #059669; font-weight: 600; }
.text-warning { color: #d97706; font-weight: 600; }
.text-danger { color: #dc2626; font-weight: 600; }
.btn-review {
  display: inline-block;
  padding: 6px 12px;
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}
.btn-review:hover {
  background: #e5e7eb;
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
  font-size: 14px;
  margin-bottom: 6px;
  color: #374151;
}
.form-group select, .form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.loading-state, .empty-state {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}
.btn-preview-action {
  background-color: #059669;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.btn-preview-action:hover {
  background-color: #047857;
}
.preview-panel {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #10b981;
  padding: 20px;
  margin-bottom: 24px;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.preview-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-controls select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.preview-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}
.item-title {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
  margin-bottom: 8px;
}
.item-summary {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 12px;
}
.item-bullets ul {
  padding-left: 18px;
  margin: 8px 0;
  font-size: 13px;
  color: #4b5563;
}
.item-meta {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}
.badge-success {
  background-color: #def7ec;
  color: #03543f;
}
.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}
.badge-info {
  background-color: #e0e7ff;
  color: #3730a3;
}
.feedback-box {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 12px;
}
.feedback-box label {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}
.feedback-input-row {
  display: flex;
  gap: 12px;
}
.feedback-input-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
</style>
