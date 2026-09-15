'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;

const AiContentExcelVersionSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AiContentJob', required: true },
    category: { type: String, required: true, trim: true },
    version: { type: Number, required: true },
    file_path: { type: String, required: true, trim: true },
    file_name: { type: String, required: true, trim: true },
    row_count: { type: Number, default: 0 },
    rows_snapshot: { type: mongoose.Schema.Types.Mixed, default: () => [] },
    created_at: { type: Date, default: Date.now },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60-day revert window
    },
    change_summary: { type: String, default: 'Initial export', trim: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'reverted'],
      default: 'active',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

AiContentExcelVersionSchema.index(
  { company_id: 1, application_id: 1, category: 1, version: 1 },
  { unique: true },
);

AiContentExcelVersionSchema.index({
  company_id: 1,
  application_id: 1,
  job_id: 1,
  created_at: -1,
});

const AiContentExcelVersionModel = mongo.model(
  'AiContentExcelVersion',
  AiContentExcelVersionSchema,
);

module.exports = AiContentExcelVersionModel;
