'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;

const ContentRuleSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    field: { type: String, required: true, trim: true },
    rule_text: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

ContentRuleSchema.index(
  { company_id: 1, application_id: 1, category: 1, field: 1 },
  { unique: true },
);

const ContentRuleModel = mongo.model('ContentRule', ContentRuleSchema);
module.exports = ContentRuleModel;
