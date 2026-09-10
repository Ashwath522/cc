'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;
const Schema = mongoose.Schema;
const { String } = Schema.Types;

function ISTDateType() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Config = new Schema(
  {
    company_id: {
      type: String,
      required: true,
    },
    application_id: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      default: '',
    },
    created_at: {
      type: Date,
      default: ISTDateType,
    },
    is_enabled: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  },
  {
    strict: true,
  },
);

Config.index({ company_id: 1, application_id: 1 });

const ConfigModel = mongo.model('Config', Config);
module.exports = ConfigModel;
