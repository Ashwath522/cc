'use strict';

const { lookupAssetFile } = require('./cms-bulk-asset-map.helper');
const { validateMulterFileAgainstField } = require('./cms-file-field.helper');
const { uploadFileUtils } = require('../utils/uploadFile.utils');

const isHttpUrl = (value) => /^https?:\/\/.+/i.test(`${value}`.trim());

/**
 * Parse a file field cell into a list of reference tokens (URLs or filename keys).
 */
const parseFileCellTokens = (cellValue, field) => {
  if (cellValue === undefined || cellValue === null) {
    return [];
  }
  let str =
    typeof cellValue === 'string'
      ? cellValue.trim()
      : cellValue != null && typeof cellValue.toString === 'function'
        ? cellValue.toString().trim()
        : `${cellValue}`.trim();
  if (!str) {
    return [];
  }

  if (field.multiple) {
    if (str.startsWith('[')) {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) {
          throw new Error(`File field "${field.name}" expects a JSON array`);
        }
        return parsed.map((u) => `${u}`.trim()).filter(Boolean);
      } catch (e) {
        throw new Error(e.message || `Invalid JSON for file field "${field.name}"`);
      }
    }
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return [str];
};

/**
 * Resolve file field tokens to CDN URL(s) using asset map and platform upload.
 * @param {object} params
 * @param {object} params.field - definition file field
 * @param {string|string[]} params.rawValue - cell value(s)
 * @param {Map<string, object>} params.assetMap - filename / basename → multer-like file
 * @param {Map<string, string[]>} [params.ambiguousBasenames]
 * @param {object} params.platformAppCli
 * @returns {Promise<string|string[]>}
 */
const resolveFileFieldToCdnUrls = async ({
  field,
  rawValue,
  assetMap,
  ambiguousBasenames,
  platformAppCli,
}) => {
  const tokens = Array.isArray(rawValue) ? rawValue : parseFileCellTokens(rawValue, field);
  if (!tokens.length) {
    return field.multiple ? [] : undefined;
  }

  const urls = [];
  for (const token of tokens) {
    if (isHttpUrl(token)) {
      urls.push(token.trim());
      continue;
    }

    const file = lookupAssetFile(token, assetMap, ambiguousBasenames);
    if (!file) {
      throw new Error(`Asset '${token}' not found in uploaded bundle`);
    }

    const check = validateMulterFileAgainstField(file, field);
    if (!check.ok) {
      throw new Error(check.error);
    }

    const url = await uploadFileUtils(platformAppCli, file);
    urls.push(url);
  }

  return field.multiple ? urls : urls[0];
};

/**
 * Resolve all root-level file fields on a payload before validation.
 */
const resolveFileFieldsOnPayload = async ({
  payload,
  definition,
  assetMap,
  ambiguousBasenames,
  platformAppCli,
}) => {
  const fileFields = (definition.fields || []).filter((f) => f.field_type === 'file');
  for (const field of fileFields) {
    if (payload[field.name] === undefined || payload[field.name] === null || payload[field.name] === '') {
      continue;
    }
    payload[field.name] = await resolveFileFieldToCdnUrls({
      field,
      rawValue: payload[field.name],
      assetMap,
      ambiguousBasenames,
      platformAppCli,
    });
  }
  return payload;
};

module.exports = {
  isHttpUrl,
  parseFileCellTokens,
  resolveFileFieldToCdnUrls,
  resolveFileFieldsOnPayload,
};
