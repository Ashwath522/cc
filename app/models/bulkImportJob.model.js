'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;
const { BULK_IMPORT_JOB_STATUS } = require('../constants/constant');

const BulkImportJobSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    definition_slug: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(BULK_IMPORT_JOB_STATUS),
      default: BULK_IMPORT_JOB_STATUS.PENDING,
    },
    total_rows: { type: Number, default: 0 },
    processed_rows: { type: Number, default: 0 },
    created_count: { type: Number, default: 0 },
    failed_count: { type: Number, default: 0 },
    asset_count: { type: Number, default: 0 },
    spreadsheet_format: { type: String, enum: ['csv', 'xlsx'], default: 'xlsx' },
    spreadsheet_url: { type: String, default: '' },
    spreadsheet_file_id: { type: String, default: '' },
    assets_zip_url: { type: String, default: '' },
    assets_zip_file_id: { type: String, default: '' },
    error_message: { type: String, default: '' },
    report_ready: { type: Boolean, default: false },
    created_by: { type: String, default: '' },
    started_at: { type: Date },
    completed_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

BulkImportJobSchema.index({
  company_id: 1,
  application_id: 1,
  definition_slug: 1,
  created_at: -1,
});

const BulkImportJobModel = mongo.model('BulkImportJob', BulkImportJobSchema);
module.exports = BulkImportJobModel;
