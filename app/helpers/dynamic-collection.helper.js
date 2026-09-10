'use strict';

const mongoose = require('mongoose');
const slugify = require('slugify');
const _ = require('lodash');
const mongo = require('../common/mongo.init').host;
const logger = require('../common/logger');

const FIELD_TYPES = [
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
];

/**
 * Path names that must not appear in Schema definitions — they collide with
 * Mongoose Document / connection internals (e.g. `collection` breaks model compile).
 * Those fields are still stored and returned because `strict: false` is enabled.
 */
const MONGOOSE_RESERVED_SCHEMA_PATHS = new Set([
  'collection',
  'collectionName',
  'db',
  'errors',
  'isNew',
  'schema',
  'listeners',
  'prototype',
  'constructor',
  'model',
  'paths',
  'path',
  'options',
  'parent',
  'base',
  'save',
  'validate',
]);

/** Stored on every CMS instance; not valid as user-defined field names. */
const TENANT_SCOPE_PATHS = new Set(['application_id', 'company_id', 'slug']);

const sanitizeIdentifier = (value) =>
  slugify(`${value}`, { lower: true, strict: true }).replace(/-/g, '_');

const isSingleRelationField = (field) =>
  field &&
  (field.field_type === 'product' || field.field_type === 'collection') &&
  !field.multiple;

/**
 * When a definition has a single (non-multiple) product or collection field,
 * instance documents get a top-level slug copied from that relation's slug.
 * @returns {string|null} source field name
 */
const resolveInstanceSlugSourceField = (definition) => {
  const match = (definition?.fields || []).find(isSingleRelationField);
  return match && match.name ? String(match.name) : null;
};

const isDuplicateInstanceSlugError = (error) =>
  Boolean(
    error &&
      (error.code === 11000 || error.code === 11001) &&
      /slug/i.test(`${error.message || ''}`),
  );

/**
 * One physical MongoDB collection per definition slug (sanitized identifier only — no prefix),
 * shared by all companies and applications. The same string is used as the Mongoose model name
 * on the connection. Tenant isolation is enforced via company_id / application_id on each document
 * and in every query.
 */
const getDynamicKey = (definition) =>
  sanitizeIdentifier(definition.slug || 'instance');

/**
 * Merge tenant scope with a filter built from user filters. Tenant fields always win.
 */
const mergeTenantScope = (companyId, applicationId, filterQuery = {}) => {
  const tenant = {
    company_id: companyId,
    application_id: applicationId,
  };
  if (!filterQuery || typeof filterQuery !== 'object' || Object.keys(filterQuery).length === 0) {
    return tenant;
  }
  const hasTopLevelOperator = Object.keys(filterQuery).some((k) => k.startsWith('$'));
  if (hasTopLevelOperator) {
    return { $and: [tenant, filterQuery] };
  }
  return { ...filterQuery, ...tenant };
};

const wrapRequired = (definition, field) => {
  if (_.isPlainObject(definition) && !Array.isArray(definition) && field.required) {
    definition.required = true;
  }
  return definition;
};

const singleValueSchema = (field) => {
  switch (field.field_type) {
    case 'number':
      return { type: Number };
    case 'date':
    case 'date_time':
      return { type: Date };
    case 'file':
      return { type: mongoose.Schema.Types.Mixed };
    case 'multiple_values':
      return [{ type: String, trim: true }];
    case 'checkbox':
      return field.multiple ? [{ type: String, trim: true }] : { type: String, trim: true };
    case 'dropdown':
    case 'radio':
    case 'product':
    case 'collection':
    case 'custom_object':
    case 'json':
      return { type: mongoose.Schema.Types.Mixed };
    case 'long_text':
    case 'html':
      return { type: String, trim: true };
    case 'url':
      return { type: String, trim: true };
    default:
      return { type: String, trim: true };
  }
};

const buildFieldSchema = (field) => {
  if (field.field_type === 'multiple_values') {
    return wrapRequired([{ type: String, trim: true }], field);
  }

  if (field.field_type === 'checkbox') {
    return wrapRequired(singleValueSchema(field), field);
  }

  if (field.multiple) {
    let inner;
    switch (field.field_type) {
      case 'number':
        inner = { type: Number };
        break;
      case 'date':
      case 'date_time':
        inner = { type: Date };
        break;
      case 'file':
      case 'product':
      case 'collection':
      case 'custom_object':
        inner = { type: mongoose.Schema.Types.Mixed };
        break;
      case 'text':
      case 'long_text':
      case 'dropdown':
      case 'radio':
      case 'url':
      case 'html':
        inner = { type: String, trim: true };
        break;
      case 'json':
        inner = { type: mongoose.Schema.Types.Mixed };
        break;
      default:
        inner = { type: mongoose.Schema.Types.Mixed };
    }
    return [inner];
  }

  return wrapRequired(singleValueSchema(field), field);
};

const buildSchema = (definition) => {
  const schemaDefinition = {};
  definition.fields.forEach((field) => {
    if (!field.name) {
      return;
    }
    if (TENANT_SCOPE_PATHS.has(field.name)) {
      logger.warn(
        `Skipping field "${field.name}" — reserved for application_id / company_id on each document.`,
      );
      return;
    }
    if (!FIELD_TYPES.includes(field.field_type)) {
      return;
    }
    if (MONGOOSE_RESERVED_SCHEMA_PATHS.has(field.name)) {
      logger.warn(
        `Skipping explicit schema path for reserved field name "${field.name}" ` +
          `(still persisted via strict: false).`,
      );
      return;
    }
    schemaDefinition[field.name] = buildFieldSchema(field);
  });

  schemaDefinition.application_id = { type: String, trim: true };
  schemaDefinition.company_id = { type: String, trim: true };

  if (resolveInstanceSlugSourceField(definition)) {
    schemaDefinition.slug = { type: String, trim: true };
  }

  return new mongoose.Schema(schemaDefinition, {
    timestamps: true,
    strict: false,
    /** Build indexes even when the connection uses autoIndex: false (common in production). */
    autoIndex: true,
  });
};

const safeIndexName = (definition, suffix) => {
  const slug = sanitizeIdentifier(definition.slug || 'def');
  const cleanSuffix = `${suffix}`.replace(/[^a-z0-9_]/gi, '_');
  const base = `cms_ff_${slug}_${cleanSuffix}`;
  return base.slice(0, 120);
};

/**
 * Sparse indexes on filterable fields to speed list API filters (equality / $in style).
 * Text regex filters still may scan; product/collection benefit from uid/slug subpaths.
 */
const applyFilterableFieldIndexes = (schema, definition) => {
  const tenantPrefix = { company_id: 1, application_id: 1 };
  (definition.fields || []).forEach((field) => {
    if (!field || !field.name || !field.is_filterable) {
      return;
    }
    const n = field.name;
    try {
      switch (field.field_type) {
        case 'product':
        case 'collection':
          schema.index(
            { ...tenantPrefix, [`${n}.uid`]: 1 },
            { name: safeIndexName(definition, `${n}_uid`) },
          );
          schema.index(
            { ...tenantPrefix, [`${n}.slug`]: 1 },
            { name: safeIndexName(definition, `${n}_slug`) },
          );
          schema.index(
            { ...tenantPrefix, [`${n}.id`]: 1 },
            { name: safeIndexName(definition, `${n}_relid`) },
          );
          break;
        case 'number':
        case 'date':
        case 'date_time':
        case 'dropdown':
        case 'radio':
        case 'text':
        case 'long_text':
        case 'url':
        case 'html':
          if (!MONGOOSE_RESERVED_SCHEMA_PATHS.has(n)) {
            schema.index({ ...tenantPrefix, [n]: 1 }, { name: safeIndexName(definition, n) });
          }
          break;
        default:
          break;
      }
    } catch (e) {
      logger.warn(`Skipping filter index for field "${n}": ${e.message}`);
    }
  });
};

/** Avoid duplicate createIndexes work; retry if a previous attempt failed. */
const indexEnsureStarted = new Set();

const ensureDynamicIndexes = (modelName, Model, collectionName) => {
  if (indexEnsureStarted.has(modelName)) {
    return;
  }
  indexEnsureStarted.add(modelName);
  void Model.createIndexes()
    .catch((err) => {
      indexEnsureStarted.delete(modelName);
      logger.warn(`CMS dynamic model createIndexes failed (${collectionName}): ${err.message}`);
    });
};

const createDynamicModel = (definition) => {
  const name = getDynamicKey(definition);

  if (mongo.models[name]) {
    ensureDynamicIndexes(name, mongo.models[name], name);
    return mongo.models[name];
  }

  const schema = buildSchema(definition);
  schema.index(
    { company_id: 1, application_id: 1, createdAt: -1 },
    { name: safeIndexName(definition, 'tenant_created') },
  );
  if (resolveInstanceSlugSourceField(definition)) {
    schema.index(
      { company_id: 1, application_id: 1, slug: 1 },
      {
        unique: true,
        sparse: true,
        name: safeIndexName(definition, 'instance_slug'),
      },
    );
  }
  applyFilterableFieldIndexes(schema, definition);
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });

  try {
    const Model = mongo.model(name, schema, name);
    ensureDynamicIndexes(name, Model, name);
    return Model;
  } catch (error) {
    logger.error(`Failed to create dynamic model ${name}: ${error.message}`);
    throw error;
  }
};

const parseValue = (value, field) => {
  if (value == null) {
    return null;
  }

  switch (field.field_type) {
    case 'number':
      return Number(value);
    case 'date':
    case 'date_time':
      return new Date(value);
    case 'multiple_values':
    case 'checkbox':
      if (Array.isArray(value)) {
        return value.map((item) => `${item}`);
      }
      return [`${value}`];
    default:
      if (field.multiple && Array.isArray(value)) {
        return value.map((item) => parseValue(item, { ...field, multiple: false }));
      }
      return value;
  }
};

const validateObjectData = (data, definition) => {
  if (!definition || !definition.fields) {
    return { valid: true };
  }

  for (const field of definition.fields) {
    const rawValue = _.get(data, field.name);

    const isMulti =
      field.field_type === 'multiple_values' ||
      (field.multiple && !['checkbox', 'multiple_values'].includes(field.field_type));

    if (field.required && field.field_type === 'checkbox') {
      if (field.multiple) {
        if (!Array.isArray(rawValue) || rawValue.length === 0) {
          return { valid: false, error: `${field.label || field.name} is required` };
        }
      } else if (rawValue === null || rawValue === undefined || rawValue === '') {
        return { valid: false, error: `${field.label || field.name} is required` };
      }
    }

    if (field.required) {
      if (isMulti) {
        if (!Array.isArray(rawValue) || rawValue.length === 0) {
          return { valid: false, error: `${field.label || field.name} is required` };
        }
      } else if (rawValue === null || rawValue === undefined || rawValue === '') {
        return { valid: false, error: `${field.label || field.name} is required` };
      }
    }

    if (field.field_type === 'custom_object') {
      if (field.required) {
        if (isMulti) {
          if (!Array.isArray(rawValue) || rawValue.length === 0) {
            return { valid: false, error: `${field.label || field.name} is required` };
          }
        } else if (!_.isPlainObject(rawValue) || Array.isArray(rawValue)) {
          return { valid: false, error: `${field.label || field.name} is required` };
        }
      }
      if (rawValue == null || rawValue === '') {
        continue;
      }
      if (isMulti) {
        if (!Array.isArray(rawValue)) {
          return { valid: false, error: `${field.label || field.name} must be an array` };
        }
        for (const item of rawValue) {
          if (!_.isPlainObject(item) || Array.isArray(item)) {
            return { valid: false, error: `${field.label || field.name} must be a list of objects` };
          }
        }
      } else if (!_.isPlainObject(rawValue) || Array.isArray(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be an object` };
      }
      continue;
    }

    if (field.field_type === 'file') {
      if (rawValue == null || rawValue === '') {
        continue;
      }
      const validateFileUrl = (u) => /^https?:\/\/.+/i.test(`${u}`.trim());
      if (isMulti) {
        if (!Array.isArray(rawValue)) {
          return { valid: false, error: `${field.label || field.name} must be an array of file URLs` };
        }
        for (const u of rawValue) {
          if (!validateFileUrl(u)) {
            return {
              valid: false,
              error: `${field.label || field.name} must contain valid http(s) file URLs`,
            };
          }
        }
      } else if (!validateFileUrl(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be a valid http(s) file URL` };
      }
      continue;
    }

    if (rawValue == null || rawValue === '') {
      continue;
    }

    const validateRegex = (v) => {
      if (!field.regex_pattern) {
        return true;
      }
      const regex = new RegExp(field.regex_pattern);
      const valueAsString = typeof v === 'string' ? v : JSON.stringify(v);
      return regex.test(valueAsString);
    };

    if (isMulti && Array.isArray(rawValue)) {
      for (const item of rawValue) {
        if (!validateRegex(item)) {
          return { valid: false, error: `${field.label || field.name} does not match validation pattern` };
        }
      }
    } else if (!validateRegex(rawValue)) {
      return { valid: false, error: `${field.label || field.name} does not match validation pattern` };
    }

    const validateNumber = (v) => {
      if (v === '' || v == null) {
        return true;
      }
      const parsed = Number(v);
      return !Number.isNaN(parsed);
    };
    const validateDate = (v) => {
      if (v === '' || v == null) {
        return true;
      }
      const parsed = new Date(v);
      return !Number.isNaN(parsed.getTime());
    };

    if (field.field_type === 'number') {
      if (isMulti && Array.isArray(rawValue)) {
        if (!rawValue.every((v) => validateNumber(v))) {
          return { valid: false, error: `${field.label || field.name} must be a number` };
        }
      } else if (!validateNumber(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be a number` };
      }
    }

    if (field.field_type === 'date' || field.field_type === 'date_time') {
      if (isMulti && Array.isArray(rawValue)) {
        if (!rawValue.every((v) => validateDate(v))) {
          return { valid: false, error: `${field.label || field.name} must be a valid date` };
        }
      } else if (!validateDate(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be a valid date` };
      }
    }

    const validateUrlValue = (v) => {
      if (v === '' || v == null) {
        return true;
      }
      const s = `${v}`.trim();
      return /^https?:\/\/.+/i.test(s);
    };

    const validateJsonValue = (v) => {
      if (v === '' || v == null) {
        return true;
      }
      if (typeof v === 'object') {
        return true;
      }
      try {
        JSON.parse(`${v}`);
        return true;
      } catch (e) {
        return false;
      }
    };

    if (field.field_type === 'url') {
      if (isMulti && Array.isArray(rawValue)) {
        if (!rawValue.every((v) => validateUrlValue(v))) {
          return { valid: false, error: `${field.label || field.name} must be a valid http(s) URL` };
        }
      } else if (!validateUrlValue(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be a valid http(s) URL` };
      }
    }

    if (field.field_type === 'json') {
      if (isMulti && Array.isArray(rawValue)) {
        if (!rawValue.every((v) => validateJsonValue(v))) {
          return { valid: false, error: `${field.label || field.name} must be valid JSON` };
        }
      } else if (!validateJsonValue(rawValue)) {
        return { valid: false, error: `${field.label || field.name} must be valid JSON` };
      }
    }

    if (field.field_type === 'multiple_values' && !Array.isArray(rawValue)) {
      return { valid: false, error: `${field.label || field.name} must be an array` };
    }

    if (
      field.field_type === 'multiple_values' &&
      Array.isArray(rawValue) &&
      field.options &&
      field.options.length > 0
    ) {
      const allowed = new Set(field.options.map((o) => `${o}`));
      for (const item of rawValue) {
        if (!allowed.has(`${item}`)) {
          return {
            valid: false,
            error: `${field.label || field.name} values must be one of the configured choices`,
          };
        }
      }
    }

    if (isMulti && field.field_type !== 'multiple_values' && !Array.isArray(rawValue)) {
      return { valid: false, error: `${field.label || field.name} must be an array` };
    }
  }

  return { valid: true };
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Persist only a stable reference for product/collection fields (not full platform payloads).
 * @returns {{ uid: string, slug: string, name: string, id?: string }|null}
 */
const normalizeRelationFieldValue = (value) => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        return normalizeRelationFieldValue(JSON.parse(trimmed));
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  if (!_.isPlainObject(value)) {
    return null;
  }
  const pickFirstString = (...vals) => {
    for (const v of vals) {
      if (v == null || v === '') {
        continue;
      }
      return String(v);
    }
    return '';
  };
  /** Prefer platform uid-style ids before Mongo _id so filters match storefront / API ids users copy. */
  const uid = pickFirstString(
    value.uid,
    value.item_uid,
    value.product_uid,
    value.collection_uid,
    value.id,
    value.item_id,
    value.product_id,
    value.collection_id,
    value._id,
  );
  const slug = value.slug != null ? String(value.slug) : '';
  const name = (value.name || value.title || slug || '').trim();
  const out = { uid, slug, name };
  if (uid) {
    out.id = uid;
  }
  return out;
};

const extractRelationSlugFromValue = (value) => {
  if (value == null || value === '') {
    return '';
  }
  const ref = _.isPlainObject(value) ? value : normalizeRelationFieldValue(value);
  if (!ref || ref.slug == null || ref.slug === '') {
    return '';
  }
  return String(ref.slug).trim();
};

/**
 * Denormalize product/collection slug onto payload.slug when the definition qualifies.
 */
const applyInstanceSlugToPayload = (payload, definition) => {
  const sourceField = resolveInstanceSlugSourceField(definition);
  if (!sourceField || !payload || typeof payload !== 'object') {
    return payload;
  }
  delete payload.slug;
  const slug = extractRelationSlugFromValue(payload[sourceField]);
  if (slug) {
    payload.slug = slug;
  }
  return payload;
};

/**
 * $or conditions for filtering product/collection relation fields (single object or array of objects).
 * Matches string uid/slug/id, numeric uid when applicable, and ObjectId when value is 24-char hex.
 */
const buildProductCollectionRelationFilter = (fieldName, rawValue) => {
  const s = `${rawValue}`.trim();
  if (!s) {
    return null;
  }
  const orConditions = [
    { [`${fieldName}.uid`]: s },
    { [`${fieldName}.slug`]: s },
    { [`${fieldName}.id`]: s },
    { [`${fieldName}._id`]: s },
  ];
  const asNum = Number(s);
  if (s !== '' && !Number.isNaN(asNum) && Number.isFinite(asNum)) {
    orConditions.push({ [`${fieldName}.uid`]: asNum });
  }
  if (mongoose.isValidObjectId(s)) {
    try {
      const oid = new mongoose.Types.ObjectId(s);
      orConditions.push({ [`${fieldName}.uid`]: oid });
      orConditions.push({ [`${fieldName}._id`]: oid });
      orConditions.push({ [`${fieldName}.id`]: oid });
    } catch (e) {
      /* ignore */
    }
  }
  return { $or: orConditions };
};

/**
 * Stored reference to another CMS object instance (legacy).
 * @returns {{ _id: string, name: string, ref_slug?: string }|null}
 */
const normalizeCustomObjectInstanceRef = (value, refSlug) => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        return normalizeCustomObjectInstanceRef(JSON.parse(trimmed), refSlug);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  if (!_.isPlainObject(value)) {
    return null;
  }
  const _id = value._id != null ? String(value._id) : '';
  if (!_id) {
    return null;
  }
  const name = `${value.name || value.label || value.title || _id}`.trim();
  const out = { _id, name };
  if (refSlug) {
    out.ref_slug = String(refSlug);
  }
  return out;
};

const LEGACY_REF_KEYS = new Set(['_id', 'name', 'ref_slug', 'label', 'title']);

/**
 * Embedded custom object: full child field payload stored on the parent document.
 * Accepts plain objects (and JSON strings). Legacy link refs { _id, name } are treated as empty.
 */
const normalizeEmbeddedCustomObjectInput = (value) => {
  if (value == null || value === '') {
    return null;
  }
  let parsed = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{')) {
      return null;
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return null;
    }
  }
  if (!_.isPlainObject(parsed)) {
    return null;
  }
  const keys = Object.keys(parsed);
  const onlyLegacyLink =
    keys.length > 0 &&
    keys.length <= 5 &&
    keys.every((k) => LEGACY_REF_KEYS.has(k)) &&
    parsed._id != null &&
    parsed._id !== '';
  if (onlyLegacyLink) {
    return null;
  }
  const clone = _.cloneDeep(parsed);
  delete clone.ref_slug;
  return clone;
};

const normalizeEmbeddedCustomObjectArrayInput = (value) => {
  if (value == null || value === '') {
    return [];
  }
  let arr = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('[')) {
      return [];
    }
    try {
      arr = JSON.parse(trimmed);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.map((item) => normalizeEmbeddedCustomObjectInput(item)).filter((x) => x != null);
};

const buildFilterQuery = (queryFilters, definition) => {
  if (!queryFilters || typeof queryFilters !== 'object') {
    return {};
  }

  const query = {};
  const definitionsByName = _.keyBy(definition.fields || [], 'name');

  Object.entries(queryFilters).forEach(([fieldName, value]) => {
    const field = definitionsByName[fieldName];
    if (!field || !field.is_filterable) {
      return;
    }

    if (_.isPlainObject(value) && !Array.isArray(value)) {
      const operatorQuery = {};
      Object.entries(value).forEach(([operator, filterValue]) => {
        if (filterValue == null || filterValue === '') {
          return;
        }
        switch (operator) {
          case 'gt':
            operatorQuery.$gt = parseValue(filterValue, field);
            break;
          case 'gte':
            operatorQuery.$gte = parseValue(filterValue, field);
            break;
          case 'lt':
            operatorQuery.$lt = parseValue(filterValue, field);
            break;
          case 'lte':
            operatorQuery.$lte = parseValue(filterValue, field);
            break;
          case 'in':
            operatorQuery.$in = Array.isArray(filterValue) ? filterValue : [`${filterValue}`];
            break;
          case 'ne':
            operatorQuery.$ne = parseValue(filterValue, field);
            break;
          default:
            operatorQuery[operator] = parseValue(filterValue, field);
            break;
        }
      });

      if (Object.keys(operatorQuery).length > 0) {
        query[fieldName] = operatorQuery;
      }
      return;
    }

    if (Array.isArray(value)) {
      query[fieldName] = { $in: value.map((item) => `${item}`) };
      return;
    }

    if (
      field.field_type === 'text' ||
      field.field_type === 'long_text' ||
      field.field_type === 'url' ||
      field.field_type === 'html' ||
      field.field_type === 'json'
    ) {
      query[fieldName] = {
        $regex: escapeRegExp(`${value}`),
        $options: 'i',
      };
      return;
    }

    if (field.field_type === 'number') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        query[fieldName] = parsed;
      }
      return;
    }

    if (field.field_type === 'date' || field.field_type === 'date_time') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        query[fieldName] = parsed;
      }
      return;
    }

    if (field.field_type === 'product' || field.field_type === 'collection') {
      const clause = buildProductCollectionRelationFilter(fieldName, value);
      if (!clause) {
        return;
      }
      if (!query.$and) {
        query.$and = [];
      }
      query.$and.push(clause);
      return;
    }

    if (field.field_type === 'custom_object') {
      const s = `${value}`.trim();
      if (!s) {
        return;
      }
      query[fieldName] = {
        $regex: escapeRegExp(s),
        $options: 'i',
      };
      return;
    }

    query[fieldName] = value;
  });

  return query;
};

module.exports = {
  getDynamicModel: createDynamicModel,
  mergeTenantScope,
  validateObjectData,
  buildFilterQuery,
  normalizeRelationFieldValue,
  normalizeCustomObjectInstanceRef,
  normalizeEmbeddedCustomObjectInput,
  normalizeEmbeddedCustomObjectArrayInput,
  resolveInstanceSlugSourceField,
  applyInstanceSlugToPayload,
  isDuplicateInstanceSlugError,
};
