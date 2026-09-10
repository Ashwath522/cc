'use strict';

const {
  getProductsBySKUsInBatches,
  catalogItemToProductRef,
} = require('../routes/services/product.service');

const isJsonProductCell = (str) => {
  const t = `${str}`.trim();
  return t.startsWith('{') || t.startsWith('[');
};

/**
 * Parse a product field cell into SKU token(s) or parsed JSON value.
 * @returns {string|string[]|object|object[]|undefined}
 */
const parseProductCellTokens = (cellValue, field) => {
  if (cellValue === undefined || cellValue === null) {
    return undefined;
  }

  if (typeof cellValue === 'object') {
    return cellValue;
  }

  let str =
    typeof cellValue === 'string'
      ? cellValue.trim()
      : cellValue != null && typeof cellValue.toString === 'function'
        ? cellValue.toString().trim()
        : `${cellValue}`.trim();
  if (!str) {
    return undefined;
  }

  if (isJsonProductCell(str)) {
    try {
      const parsed = JSON.parse(str);
      if (field.multiple) {
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return parsed;
    } catch (e) {
      throw new Error(`Invalid JSON for field "${field.name}"`);
    }
  }

  if (field.multiple) {
    return str.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return str;
};

const skuKey = (sku) => `${sku}`.trim().toLowerCase();

/**
 * Collect unique SKU codes from product columns across import rows.
 */
const collectProductSkusFromRows = (rows, definition) => {
  const skus = new Set();
  const productFields = (definition.fields || []).filter(
    (f) => f && f.name && f.field_type === 'product',
  );
  if (!productFields.length) {
    return skus;
  }

  for (const row of rows || []) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    for (const field of productFields) {
      const raw = row[field.name];
      if (raw === undefined || raw === null || raw === '') {
        continue;
      }
      let tokens;
      try {
        tokens = parseProductCellTokens(raw, field);
      } catch (e) {
        continue;
      }
      if (tokens === undefined) {
        continue;
      }
      if (typeof tokens === 'object' && !Array.isArray(tokens)) {
        continue;
      }
      const list = Array.isArray(tokens) ? tokens : [tokens];
      for (const token of list) {
        if (typeof token === 'string' && token.trim()) {
          skus.add(token.trim());
        }
      }
    }
  }
  return skus;
};

const buildProductSkuMap = async ({ skus, companyId, batchSize }) => {
  const skuList = [...(skus instanceof Set ? skus : skus || [])];
  return getProductsBySKUsInBatches({ skus: skuList, companyId, batchSize });
};

const resolveProductToken = (token, field, productSkuMap) => {
  if (token == null || token === '') {
    throw new Error(`Empty product SKU in field "${field.label || field.name}"`);
  }
  if (typeof token === 'object') {
    const ref = catalogItemToProductRef(token);
    if (!ref || !ref.uid) {
      throw new Error(`Invalid product reference in field "${field.label || field.name}"`);
    }
    return ref;
  }

  const sku = `${token}`.trim();
  if (!sku) {
    throw new Error(`Empty product SKU in field "${field.label || field.name}"`);
  }
  if (isJsonProductCell(sku)) {
    try {
      return resolveProductToken(JSON.parse(sku), field, productSkuMap);
    } catch (e) {
      throw new Error(`Invalid JSON for field "${field.name}"`);
    }
  }

  const item = productSkuMap.get(skuKey(sku));
  if (!item) {
    throw new Error(`Product SKU '${sku}' not found`);
  }
  const ref = catalogItemToProductRef(item);
  if (!ref || !ref.uid) {
    throw new Error(`Product SKU '${sku}' could not be resolved`);
  }
  return ref;
};

/**
 * Resolve root-level product fields on a payload (SKU → {uid, slug, name}).
 */
const resolveProductFieldsOnPayload = ({ payload, definition, productSkuMap }) => {
  const productFields = (definition.fields || []).filter((f) => f.field_type === 'product');
  for (const field of productFields) {
    if (payload[field.name] === undefined || payload[field.name] === null || payload[field.name] === '') {
      continue;
    }

    const raw = payload[field.name];
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const ref = resolveProductToken(raw, field, productSkuMap);
      payload[field.name] = ref;
      continue;
    }

    const tokens = Array.isArray(raw) ? raw : [raw];
    const isSkuList = tokens.every((t) => typeof t === 'string' && !isJsonProductCell(t));
    if (!isSkuList && tokens.some((t) => typeof t === 'object')) {
      const refs = tokens.map((t) => resolveProductToken(t, field, productSkuMap));
      payload[field.name] = field.multiple ? refs : refs[0];
      continue;
    }

    const refs = tokens.map((t) => resolveProductToken(t, field, productSkuMap));
    payload[field.name] = field.multiple ? refs : refs[0];
  }
  return payload;
};

module.exports = {
  isJsonProductCell,
  parseProductCellTokens,
  collectProductSkusFromRows,
  buildProductSkuMap,
  resolveProductFieldsOnPayload,
};
