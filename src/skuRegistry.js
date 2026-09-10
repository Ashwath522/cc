/**
 * Single Responsibility: Tracks and persists registered SKUs across subcategories
 * to prevent duplicate generation across overlapping collections.
 */
const fs = require('fs');
const path = require('path');

const USED_SKUS_PATH = path.join(__dirname, '..', 'data', 'usedSkus.json');

function normalizeSku(sku) {
  if (!sku) return '';
  return String(sku).trim().toUpperCase();
}

function loadUsedSkus(filePath = USED_SKUS_PATH) {
  if (!fs.existsSync(filePath)) {
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf-8');
    return {};
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) || {};
  } catch (err) {
    console.warn(`[skuRegistry] Failed to parse ${filePath}: ${err.message}. Returning empty registry.`);
    return {};
  }
}

function isSkuUsed(skuOrItemCode, filePath = USED_SKUS_PATH) {
  const normKey = normalizeSku(skuOrItemCode);
  if (!normKey) return null;

  const usedSkus = loadUsedSkus(filePath);
  return usedSkus[normKey] || null;
}

function registerSku(skuOrItemCode, { subcategory, id }, filePath = USED_SKUS_PATH) {
  const normKey = normalizeSku(skuOrItemCode);
  if (!normKey) {
    throw new Error('[skuRegistry] Cannot register empty SKU / item code');
  }

  const usedSkus = loadUsedSkus(filePath);
  const existing = usedSkus[normKey];
  if (existing) {
    return existing;
  }

  const entry = {
    subcategory: subcategory || 'Unknown',
    id: id || normKey,
    firstSeenAt: new Date().toISOString()
  };

  usedSkus[normKey] = entry;

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(usedSkus, null, 2), 'utf-8');
  return entry;
}

function backfillFromBedsDataset(
  bedsJsonlPath = path.join(__dirname, '..', 'data', 'trainingSet', 'beds_generated.jsonl'),
  usedSkusPath = USED_SKUS_PATH
) {
  if (!fs.existsSync(bedsJsonlPath)) {
    return { registeredCount: 0, totalLines: 0 };
  }

  const lines = fs.readFileSync(bedsJsonlPath, 'utf-8').trim().split('\n').filter(Boolean);
  let registeredCount = 0;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      const input = parsed.input || parsed;
      // Extract SKU from item_code if present, or strip 'ul-' prefix from ID
      const itemCode = input.item_code || (input.id ? input.id.replace(/^ul-/i, '') : null) || input.id;
      if (itemCode) {
        registerSku(itemCode, {
          subcategory: 'Beds',
          id: input.id || `ul-${itemCode.toLowerCase()}`
        }, usedSkusPath);
        registeredCount++;
      }
    } catch (err) {
      console.warn(`[skuRegistry] Failed to backfill line: ${err.message}`);
    }
  }

  return { registeredCount, totalLines: lines.length };
}

module.exports = {
  USED_SKUS_PATH,
  normalizeSku,
  loadUsedSkus,
  isSkuUsed,
  registerSku,
  backfillFromBedsDataset
};
