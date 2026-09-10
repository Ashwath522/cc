'use strict';

const _ = require('lodash');

/**
 * FDK / Mongo / multipart can expose ids as objects (e.g. BSON, nested).
 * PlatformClient.application() requires a string.
 */
const normalizeIdParam = (value) => {
  if (value == null || value === '') {
    return null;
  }
  if (Array.isArray(value)) {
    return normalizeIdParam(value[0]);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    return t || null;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'object') {
    if (value.$oid != null) {
      return String(value.$oid);
    }
    if (typeof value.toHexString === 'function') {
      return value.toHexString();
    }
    if (value._id != null) {
      return normalizeIdParam(value._id);
    }
    if (value.id != null) {
      return normalizeIdParam(value.id);
    }
    return null;
  }
  return String(value);
};

const getCompanyId = (req) => {
  const raw =
    _.get(req, 'fdkSession.company_id') ||
    req.headers['x-company-id'] ||
    req.body.company_id ||
    req.query.company_id ||
    _.get(req, 'params.company_id') ||
    null;
  return normalizeIdParam(raw);
};

const getApplicationId = (req) => {
  const raw =
    _.get(req, 'fdkSession.application_id') ||
    req.body.application_id ||
    req.query.application_id ||
    _.get(req, 'params.application_id') ||
    null;
  return normalizeIdParam(raw);
};

module.exports = {
  getCompanyId,
  getApplicationId,
};
