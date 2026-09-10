'use strict';

const fs = require('fs');
const path = require('path');

const REFERENCE_PATH = path.join(__dirname, 'reference-data', 'material_care_reference.json');

function loadCareReference() {
  try {
    const raw = fs.readFileSync(REFERENCE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

/**
 * Matches a product's primary_material against material_care_reference.json
 * by keyword. Falls back to "General" with needs_review: true when nothing matches.
 */
function matchMaterial(primaryMaterial) {
  const reference = loadCareReference();

  if (!primaryMaterial) {
    const general = reference.General || { instructions: [], avoid: [] };
    return { category: 'General', instructions: general.instructions, avoid: general.avoid, needs_review: true };
  }

  const materialLower = String(primaryMaterial).toLowerCase();

  for (const [category, entry] of Object.entries(reference)) {
    if (category === 'General') continue;
    const keywords = entry.keywords || [];
    const matched = keywords.some((kw) => materialLower.includes(kw.toLowerCase()));
    if (matched) {
      return { category, instructions: entry.instructions, avoid: entry.avoid, needs_review: false };
    }
  }

  const general = reference.General || { instructions: [], avoid: [] };
  return { category: 'General', instructions: general.instructions, avoid: general.avoid, needs_review: true };
}

module.exports = { matchMaterial };
