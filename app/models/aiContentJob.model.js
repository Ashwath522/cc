'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;
const { AI_CONTENT_JOB_STATUS } = require('../constants/constant');

const AiContentJobSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    definition_slug: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    category_ids: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(AI_CONTENT_JOB_STATUS),
      default: AI_CONTENT_JOB_STATUS.PENDING,
    },
    selected_tone: { type: String, default: 'auto' },
    preview_product_refs: { type: [mongoose.Schema.Types.Mixed], default: [] },
    preview_results: { type: [mongoose.Schema.Types.Mixed], default: [] },
    total_count: { type: Number, default: 0 },
    clean_count: { type: Number, default: 0 },
    needs_review_count: { type: Number, default: 0 },
    pushed_count: { type: Number, default: 0 },
    failed_count: { type: Number, default: 0 },
    created_by: { type: String, default: '' },
    started_at: { type: Date },
    completed_at: { type: Date },
    error_message: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

AiContentJobSchema.index({
  company_id: 1,
  application_id: 1,
  created_at: -1,
});

const AiContentJobModel = mongo.model('AiContentJob', AiContentJobSchema);
module.exports = AiContentJobModel;
