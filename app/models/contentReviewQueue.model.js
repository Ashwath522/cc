'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;
const { AI_CONTENT_ROW_STATUS, AI_CONTENT_REVIEW_TTL_DAYS } = require('../constants/constant');

const ContentReviewQueueSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AiContentJob', required: true },
    definition_slug: { type: String, trim: true, default: '' },
    product_ref: { type: mongoose.Schema.Types.Mixed, default: null },
    source_attributes: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    generated_content: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    validation_result: { type: mongoose.Schema.Types.Mixed, default: () => ({ valid: false, errors: [] }) },
    status: {
      type: String,
      enum: Object.values(AI_CONTENT_ROW_STATUS),
      default: AI_CONTENT_ROW_STATUS.NEEDS_REVIEW,
    },
    human_edited_fields: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

ContentReviewQueueSchema.index({
  company_id: 1,
  application_id: 1,
  job_id: 1,
  status: 1,
  created_at: -1,
});

// 14-day TTL index scoped only to prune unresolved 'needs_review' rows
ContentReviewQueueSchema.index(
  { created_at: 1 },
  {
    expireAfterSeconds: AI_CONTENT_REVIEW_TTL_DAYS * 86400,
    partialFilterExpression: { status: 'needs_review' },
  },
);

const ContentReviewQueueModel = mongo.model('ContentReviewQueue', ContentReviewQueueSchema);
module.exports = ContentReviewQueueModel;
