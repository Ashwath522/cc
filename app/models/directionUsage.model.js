'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;

const DirectionUsageSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    profile_hash: { type: String, required: true, trim: true },
    profile: { type: mongoose.Schema.Types.Mixed, required: true },
    usage_count: { type: Number, default: 0 },
    last_used_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: true,
  },
);

DirectionUsageSchema.index(
  {
    company_id: 1,
    application_id: 1,
    category: 1,
    profile_hash: 1,
  },
  { unique: true },
);

DirectionUsageSchema.index({
  company_id: 1,
  application_id: 1,
  category: 1,
  usage_count: 1,
});

const DirectionUsageModel = mongo.model('DirectionUsage', DirectionUsageSchema);
module.exports = DirectionUsageModel;
