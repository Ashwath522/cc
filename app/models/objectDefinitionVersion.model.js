'use strict';

const mongoose = require('mongoose');
const mongo = require('../common/mongo.init').host;
const Schema = mongoose.Schema;

const ObjectDefinitionVersion = new Schema(
  {
    company_id: {
      type: String,
      required: true,
      trim: true,
    },
    application_id: {
      type: String,
      required: true,
      trim: true,
    },
    definition_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ObjectDefinition',
    },
    version: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    snapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    created_by: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

ObjectDefinitionVersion.index(
  { company_id: 1, application_id: 1, definition_id: 1, version: 1 },
  { unique: true },
);

const ObjectDefinitionVersionModel = mongo.model(
  'ObjectDefinitionVersion',
  ObjectDefinitionVersion,
);
module.exports = ObjectDefinitionVersionModel;
