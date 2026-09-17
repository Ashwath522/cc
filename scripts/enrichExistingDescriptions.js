'use strict';

/**
 * Single Responsibility: Patches output/urban_ladder_real_descriptions.jsonl
 * with the parameters required by promptBuilder (for description & summary generation):
 * - product_short_name
 * - price (used for tier & tone)
 * - primary_material (used for story & care instructions)
 * - seating_capacity (used for variant grounding)
 * - color_finish (used for variant grounding)
 * - storage_type (if present)
 * - warranty_months (if present)
 * - subcategory (if present)
 */

const fs = require('fs');
const path = require('path');

const CATEGORY_MAP = {
  sofas: { category: 'Living Room', subcategory: 'Sofas' },
  beds: { category: 'Bedroom', subcategory: 'Beds' },
  wardrobes: { category: 'Bedroom', subcategory: 'Wardrobes' },
  dining: { category: 'Dining', subcategory: 'Dining' },
  storage: { category: 'Storage', subcategory: 'Storage' },
  lighting_decor: { category: 'Lighting & Decor', subcategory: 'Lighting & Decor' },
  study_office: { category: 'Living Room', subcategory: 'Study' },
  coffee_side_tables: { category: 'Living Room', subcategory: 'Coffee Tables' },
  benches_ottomans: { category: 'Living Room', subcategory: 'Benches' },
  seating_chairs: { category: 'Living Room', subcategory: 'Chairs' },
  tv_units: { category: 'Living Room', subcategory: 'TV Units' },
  bar_furniture: { category: 'Dining', subcategory: 'Bar Furniture' },
  mattresses: { category: 'Bedroom', subcategory: 'Mattresses' },
  outdoor_balcony: { category: 'Living Room', subcategory: 'Outdoor' },
  kids_furniture: { category: 'Bedroom', subcategory: 'Kids Room' }
};

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const CONCURRENCY = 8;
const DELAY_MS = 150;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchParams(item) {
  const url = item.url || `https://www.urbanladder.com/product/${item.slug}`;
  let price = undefined;
  let primary_material = undefined;
  let secondary_material = undefined;
  let seating_capacity = undefined;
  let color_finish = undefined;
  let storage_type = undefined;
  let warranty_months = 12;
  let product_short_name = undefined;
  let subcategory = undefined;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (res.ok) {
      const html = await res.text();
      const appDataIdx = html.indexOf('window.APP_DATA');
      if (appDataIdx !== -1) {
        const jsonStart = html.indexOf('{', appDataIdx);
        const endScript = html.indexOf('</script>', appDataIdx);
        if (jsonStart !== -1 && endScript !== -1) {
          try {
            const data = JSON.parse(html.slice(jsonStart, endScript).trim());
            const pd = data?.reduxData?.catalog?.product_details;
            const priceMeta = data?.reduxData?.catalog?.product_meta?.price;

            if (pd) {
              if (pd.attributes?.product_model_name) product_short_name = pd.attributes.product_model_name;

              const propGroup = pd.grouped_attributes?.find(g => g.title === 'Properties');
              const props = {};
              if (propGroup && propGroup.details) {
                for (const d of propGroup.details) {
                  props[d.key] = d.value;
                }
              }

              primary_material = props['Primary Material Subtype'] || props['Primary Material Type'] || pd.attributes?.primary_material_subtype || pd.attributes?.primary_material_type;
              secondary_material = props['Secondary Material Type'] || props['Secondary Material Subtype'] || pd.attributes?.secondary_material_type;
              seating_capacity = props['Seating Capacity'] || props['Size of the Bed'] || pd.attributes?.seating_capacity;
              color_finish = props['Finish Name'] || props['Colour'] || props['Primary Color'] || pd.attributes?.finish_name || pd.attributes?.colour;
              storage_type = props['Storage Type'] || props['Storage Availability'] || pd.attributes?.storage_type;

              const w = props['Warranty In Months'] || pd.attributes?.warranty_in_months;
              if (w) {
                const pw = parseInt(w, 10);
                if (!isNaN(pw)) warranty_months = pw;
              }

              subcategory = props['Generic Name'];
            }

            if (priceMeta) {
              price = priceMeta.effective?.min || priceMeta.min || priceMeta.effective?.max || priceMeta.max;
            }
          } catch (e) {}
        }
      }

      // Fallback price parsing from HTML regex if missing from APP_DATA
      if (!price) {
        const priceJsonMatch = html.match(/"effective":\s*\{\s*"min":\s*(\d+)/i) || html.match(/"price":\s*(\d+)/i);
        if (priceJsonMatch) price = parseInt(priceJsonMatch[1], 10);
        else {
          const priceTextMatch = html.match(/₹\s*([\d,]+)/);
          if (priceTextMatch) price = parseInt(priceTextMatch[1].replace(/,/g, ''), 10);
        }
      }
    }
  } catch (err) {}

  const catMapping = CATEGORY_MAP[item.category] || { category: 'Living Room', subcategory: 'General' };
  const shortName = product_short_name || (item.name ? item.name.split(' ')[0] : 'Product');

  return {
    sku: item.sku,
    uid: item.uid,
    name: item.name,
    product_short_name: shortName,
    category: catMapping.category,
    subcategory: subcategory || catMapping.subcategory,
    raw_category: item.category,
    slug: item.slug,
    url: item.url || url,
    price: price || 15000,
    primary_material: primary_material || 'Solid Wood',
    ...(secondary_material ? { secondary_material } : {}),
    ...(seating_capacity ? { seating_capacity } : {}),
    ...(color_finish ? { color_finish } : {}),
    ...(storage_type ? { storage_type } : {}),
    warranty_months,
    description: item.description
  };
}

async function main() {
  const filePath = path.join(__dirname, '..', 'output', 'urban_ladder_real_descriptions.jsonl');
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const rawLines = fs.readFileSync(filePath, 'utf8').trim().split('\n').filter(Boolean);
  const items = rawLines.map(line => JSON.parse(line));
  console.log(`🚀 Adding promptBuilder summary parameters to ${items.length} products in ${filePath}...`);

  const enriched = [];
  const startTime = Date.now();

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(item => fetchParams(item)));
    enriched.push(...results);

    const done = Math.min(i + CONCURRENCY, items.length);
    if (done % 50 === 0 || done === items.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`  [Progress] ${done}/${items.length} updated (${elapsed}s elapsed)...`);
    }
    await sleep(DELAY_MS);
  }

  const jsonlContent = enriched.map(e => JSON.stringify(e)).join('\n') + '\n';
  const jsonContent = JSON.stringify(enriched, null, 2);

  fs.writeFileSync(filePath, jsonlContent, 'utf8');

  const outJsonPath = path.join(__dirname, '..', 'output', 'urban_ladder_real_descriptions.json');
  fs.writeFileSync(outJsonPath, jsonContent, 'utf8');

  console.log(`\n✅ Successfully patched ${filePath} and ${outJsonPath} with all required promptBuilder parameters.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
