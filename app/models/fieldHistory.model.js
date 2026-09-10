'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;

const FieldHistorySchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    definition_slug: { type: String, trim: true, default: '' },
    product_ref: { type: mongoose.Schema.Types.Mixed, default: null },
    field_name: { type: String, required: true, trim: true },
    previous_value: { type: mongoose.Schema.Types.Mixed, default: null },
    new_value: { type: mongoose.Schema.Types.Mixed, default: null },
    changed_by: { type: String, default: 'ai' },
    changed_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

FieldHistorySchema.index({
  company_id: 1,
  application_id: 1,
  'product_ref.uid': 1,
  field_name: 1,
  changed_at: -1,
});

const FieldHistoryModel = mongo.model('FieldHistory', FieldHistorySchema);
module.exports = FieldHistoryModel;
