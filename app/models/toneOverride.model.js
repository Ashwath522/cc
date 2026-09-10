'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;

const ToneOverrideSchema = new mongoose.Schema(
  {
    company_id: { type: String, required: true, trim: true },
    application_id: { type: String, required: true, trim: true },
    tone_id: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'warm_inviting',
        'elegant_sophisticated',
        'minimal_modern',
        'premium_indulgent',
        'playful_casual',
      ],
    },
    rule_text: { type: String, required: true, trim: true },
    updated_by: { type: String, default: '' },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

ToneOverrideSchema.index(
  { company_id: 1, application_id: 1, tone_id: 1 },
  { unique: true },
);

const toneOverride = mongo.model('toneOverrides', ToneOverrideSchema);

module.exports = toneOverride;
