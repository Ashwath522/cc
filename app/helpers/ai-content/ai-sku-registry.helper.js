'use strict';

let inMemoryUsedSkus = {};

function normalizeSku(sku) {
  if (!sku) return '';
  return String(sku).trim().toUpperCase();
}

function loadUsedSkus() {
  return inMemoryUsedSkus;
}

function isSkuUsed(skuOrItemCode) {
  const normKey = normalizeSku(skuOrItemCode);
  if (!normKey) return null;
  return inMemoryUsedSkus[normKey] || null;
}

function registerSku(skuOrItemCode, { subcategory, id }) {
  const normKey = normalizeSku(skuOrItemCode);
  if (!normKey) {
    throw new Error('[skuRegistry] Cannot register empty SKU / item code');
  }

  const existing = inMemoryUsedSkus[normKey];
  if (existing) {
    return existing;
  }

  const entry = {
    subcategory: subcategory || 'Unknown',
    id: id || normKey,
    firstSeenAt: new Date().toISOString(),
  };

  inMemoryUsedSkus[normKey] = entry;
  return entry;
}

function resetSkuRegistry() {
  inMemoryUsedSkus = {};
}

module.exports = {
  normalizeSku,
  loadUsedSkus,
  isSkuUsed,
  registerSku,
  resetSkuRegistry,
};
