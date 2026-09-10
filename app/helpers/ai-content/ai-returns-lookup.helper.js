'use strict';

const fs = require('fs');
const path = require('path');

const RETURNS_PATH = path.join(__dirname, 'reference-data', 'returns_by_category.json');

function loadReturnsData() {
  try {
    const raw = fs.readFileSync(RETURNS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {
      Default: {
        window_days: 10,
        condition: [
          'Item must be unused and in original packaging',
          'All original tags and labels must be attached',
          'Proof of purchase is required',
        ],
        policy_link: 'https://example.com/returns-policy-placeholder',
      },
    };
  }
}

/**
 * Pure lookup — never touches the LLM. Keyed on the product's category,
 * falling back to "Default" if the category has no specific entry.
 */
function getReturnsBlock(category) {
  const data = loadReturnsData();
  const entry = data[category] || data.Default;

  if (!entry) {
    throw new Error(`No returns configuration found for category "${category}" and no Default fallback.`);
  }

  const dayLabel = entry.window_days === 1 ? 'day' : 'days';

  return {
    window_days: `within **${entry.window_days} ${dayLabel}**`,
    condition: entry.condition,
    policy_link: entry.policy_link || 'https://example.com/returns-policy-placeholder',
  };
}

module.exports = { getReturnsBlock };
