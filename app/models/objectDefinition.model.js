'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const mongo = require('../common/mongo.init').host;
const Schema = mongoose.Schema;

const FieldSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    field_type: {
      type: String,
      required: true,
      enum: [
        'text',
        'long_text',
        'number',
        'file',
        'date',
        'date_time',
        'url',
        'json',
        'html',
        'multiple_values',
        'dropdown',
        'checkbox',
        'radio',
        'product',
        'collection',
        'custom_object',
      ],
    },
    required: {
      type: Boolean,
      default: false,
    },
    regex_pattern: {
      type: String,
      default: '',
    },
    is_filterable: {
      type: Boolean,
      default: false,
    },
    auto_generate: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
    default_value: {
      type: Schema.Types.Mixed,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    relation: {
      type: String,
      enum: ['none', 'product', 'collection'],
      default: 'none',
    },
    placeholder: {
      type: String,
      default: '',
    },
    /** Target CMS definition slug when field_type is custom_object */
    ref_definition_slug: {
      type: String,
      default: '',
      trim: true,
    },
    /** When field_type is file: restrictions (allow_all, categories, sizes) */
    file_config: {
      type: Schema.Types.Mixed,
      default: () => ({
        allow_all: true,
        allow_images: false,
        allow_videos: false,
        allow_documents: false,
        custom_extensions: '',
        image_max_mb: 20,
        video_max_mb: 1024,
        document_max_mb: 10,
      }),
    },
  },
  { _id: false },
);

const ObjectDefinition = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    usage_mode: {
      type: String,
      enum: ['standalone', 'embedded_only'],
      default: 'standalone',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    version: {
      type: Number,
      default: 1,
    },
    fields: {
      type: [FieldSchema],
      default: [],
    },
    published_at: {
      type: Date,
    },
    created_by: {
      type: String,
      default: '',
    },
    updated_by: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

ObjectDefinition.index(
  { company_id: 1, application_id: 1, slug: 1 },
  { unique: true },
);

ObjectDefinition.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const ObjectDefinitionModel = mongo.model('ObjectDefinition', ObjectDefinition);
module.exports = ObjectDefinitionModel;
