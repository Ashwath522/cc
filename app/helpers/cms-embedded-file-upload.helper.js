'use strict';

const _ = require('lodash');
const ObjectDefinitionModel = require('../models/objectDefinition.model');
const { getDefinitionFromCache, setDefinitionCache } = require('./schema-cache.helper');
const { uploadFileUtils } = require('../utils/uploadFile.utils');
const { validateMulterFileAgainstField } = require('./cms-file-field.helper');
const {
  normalizeEmbeddedCustomObjectInput,
  normalizeEmbeddedCustomObjectArrayInput,
} = require('./dynamic-collection.helper');

const EMBED_FILE_FIELD_PREFIX = '__cmsEmbedFile__';

const padBase64 = (b64) => {
  const rem = b64.length % 4;
  if (!rem) {
    return b64;
  }
  return b64 + '='.repeat(4 - rem);
};

const decodeEmbedFileSegments = (fieldname) => {
  if (!fieldname || !fieldname.startsWith(EMBED_FILE_FIELD_PREFIX)) {
    return null;
  }
  const raw = fieldname.slice(EMBED_FILE_FIELD_PREFIX.length);
  const b64 = padBase64(raw.replace(/-/g, '+').replace(/_/g, '/'));
  const json = Buffer.from(b64, 'base64').toString('utf8');
  const segments = JSON.parse(json);
  if (!Array.isArray(segments) || segments.length < 2) {
    const err = new Error('Invalid embedded file field name');
    err.statusCode = 400;
    throw err;
  }
  return segments;
};

const segmentsToInnerLodashPath = (segments) => {
  const rest = segments.slice(1);
  if (!rest.length) {
    return '';
  }
  let p = '';
  for (let i = 0; i < rest.length; i += 1) {
    const s = rest[i];
    if (typeof s === 'number') {
      p += `[${s}]`;
    } else if (p === '') {
      p = String(s);
    } else {
      p += `.${String(s)}`;
    }
  }
  return p;
};

const findPublishedDefinitionLean = async (companyId, applicationId, slug) => {
  if (!slug) {
    return null;
  }
  let def = await getDefinitionFromCache(companyId, applicationId, slug);
  if (def) {
    return def;
  }
  def = await ObjectDefinitionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    slug,
    status: 'PUBLISHED',
  })
    .lean()
    .exec();
  if (def) {
    await setDefinitionCache(companyId, applicationId, slug, def);
  }
  return def;
};

const parseCustomObjectPayloadFragment = (raw, coField) => {
  if (coField.multiple) {
    return normalizeEmbeddedCustomObjectArrayInput(raw);
  }
  const single = normalizeEmbeddedCustomObjectInput(raw);
  return single == null ? {} : single;
};

/**
 * Walk definition + published child definitions to resolve the file field at `segments`.
 * segments: [rootCustomObjectName, optionalArrayIndex, ...fieldNames, fileFieldName]
 */
const resolveFileFieldAtPath = async (rootDefinition, segments, loadChildDefinition) => {
  const fieldsArr = rootDefinition.fields || [];
  let fieldList = fieldsArr;
  let idx = 0;

  while (idx < segments.length) {
    const fieldName = `${segments[idx]}`;
    const field = _.keyBy(fieldList, 'name')[fieldName];
    if (!field) {
      const err = new Error(`Unknown field "${fieldName}" in embedded file path`);
      err.statusCode = 400;
      throw err;
    }
    idx += 1;
    if (idx >= segments.length) {
      if (field.field_type !== 'file') {
        const err = new Error(`Field "${fieldName}" must be a file field`);
        err.statusCode = 400;
        throw err;
      }
      return field;
    }
    if (field.field_type !== 'custom_object') {
      const err = new Error(`Field "${fieldName}" must be a custom object to continue the path`);
      err.statusCode = 400;
      throw err;
    }
    const childDef = await loadChildDefinition(field.ref_definition_slug);
    if (!childDef || !childDef.fields) {
      const err = new Error(`Linked definition not found for "${field.ref_definition_slug}"`);
      err.statusCode = 400;
      throw err;
    }
    fieldList = childDef.fields;
    const next = segments[idx];
    if (typeof next === 'number') {
      if (!field.multiple) {
        const err = new Error(`Field "${fieldName}" is not a list`);
        err.statusCode = 400;
        throw err;
      }
      idx += 1;
    }
  }
  const err = new Error('Invalid embedded file path');
  err.statusCode = 400;
  throw err;
};

/**
 * Upload multipart files whose field names are `__cmsEmbedFile__` + base64url(JSON path)
 * and merge resulting URLs into `payload` under the root custom_object field.
 */
const applyEmbeddedFileUploadsToPayload = async ({
  files,
  definition,
  payload,
  companyId,
  applicationId,
  platformAppCli,
}) => {
  if (!files || !files.length) {
    return;
  }
  const embedFiles = files.filter((f) => f.fieldname && f.fieldname.startsWith(EMBED_FILE_FIELD_PREFIX));
  if (!embedFiles.length) {
    return;
  }

  const loadChildDefinition = (slug) => findPublishedDefinitionLean(companyId, applicationId, slug);
  const byFieldname = _.groupBy(embedFiles, 'fieldname');

  for (const [fieldname, groupFiles] of Object.entries(byFieldname)) {
    const segments = decodeEmbedFileSegments(fieldname);
    if (!segments) {
      continue;
    }

    const fileField = await resolveFileFieldAtPath(definition, segments, loadChildDefinition);
    for (const file of groupFiles) {
      const check = validateMulterFileAgainstField(file, fileField);
      if (!check.ok) {
        const err = new Error(check.error);
        err.statusCode = 400;
        throw err;
      }
    }

    const urls = await Promise.all(groupFiles.map((file) => uploadFileUtils(platformAppCli, file)));
    const rootFieldName = `${segments[0]}`;
    const coRootField = (definition.fields || []).find((f) => f.name === rootFieldName && f.field_type === 'custom_object');
    if (!coRootField) {
      const err = new Error(`Invalid embedded file root "${rootFieldName}"`);
      err.statusCode = 400;
      throw err;
    }

    let parsed = parseCustomObjectPayloadFragment(payload[rootFieldName], coRootField);
    const innerPath = segmentsToInnerLodashPath(segments);
    const assigned = fileField.multiple ? urls : urls[0];
    if (innerPath) {
      const clone = _.cloneDeep(parsed);
      _.set(clone, innerPath, assigned);
      parsed = clone;
    }
    payload[rootFieldName] = parsed;
  }
};

module.exports = {
  EMBED_FILE_FIELD_PREFIX,
  applyEmbeddedFileUploadsToPayload,
};
