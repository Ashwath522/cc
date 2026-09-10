const fs = require('fs');
const path = require('path');
const { generateOne, loadPriceBands } = require('../src/generate');
const { isSkuUsed, registerSku } = require('../src/skuRegistry');

const COLLECTION_BASE_URLS = [
  'https://www.urbanladder.com/beds',
  'https://www.urbanladder.com/collection/all-beds',
  'https://www.urbanladder.com/collection/king-size-beds',
  'https://www.urbanladder.com/collection/queen-size-beds',
  'https://www.urbanladder.com/collection/single-beds',
  'https://www.urbanladder.com/collection/storage-beds',
  'https://www.urbanladder.com/collection/hydraulic-storage-beds',
  'https://www.urbanladder.com/collection/wooden-beds',
  'https://www.urbanladder.com/collection/solid-wood-beds',
  'https://www.urbanladder.com/collection/upholstered-beds',
  'https://www.urbanladder.com/collection/bunk-beds'
];

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const PAGE_FETCH_DELAY_MS = 1500;
const DATASET_DIR = path.join(__dirname, '..', 'data', 'trainingSet');
const DATASET_FILE = path.join(DATASET_DIR, 'beds_generated.jsonl');

const KNOWN_LABELS = [
  'Name',
  'Item Code',
  'Primary Material Type',
  'Primary Material Subtype',
  'Secondary Material Type',
  'Storage Availability',
  'Storage Type',
  'Primary Color',
  'Finish Name',
  'Warranty In Months',
  'Recommended Mattress Size',
  'Size of the Bed',
  'Length',
  'Width',
  'Height',
  'Net Weight'
];

function isSingleValue(val) {
  if (!val || val === ':') return false;
  if (val.includes('StorageDrawer') || val.includes('StorageHydraulic') || val.includes('StorageNon') || val.includes('Box StorageNon')) {
    return false;
  }
  return true;
}

function parseLabelValues(html) {
  const map = {};

  // 1. Line-pair extraction from rendered text lines
  const cleanLines = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<dt[^>]*>/gi, '\n')
    .replace(/<\/dt>/gi, '\n')
    .replace(/<dd[^>]*>/gi, '\n')
    .replace(/<\/dd>/gi, '\n')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<td[^>]*>/gi, '\n')
    .replace(/<\/td>/gi, '\n')
    .replace(/<th[^>]*>/gi, '\n')
    .replace(/<\/th>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    if (KNOWN_LABELS.includes(line)) {
      const val = cleanLines[i + 1];
      if (isSingleValue(val)) {
        map[line] = val;
      }
    }
  }

  // 2. Fallback matching for any missing label
  for (const label of KNOWN_LABELS) {
    if (!map[label] || !isSingleValue(map[label])) {
      const jsonRegex = new RegExp(`["']key["']\\s*:\\s*["']${label}["'][\\s\\S]{0,100}?["']value["']\\s*:\\s*["']([^"']+)["']`, 'i');
      const jsonMatch = html.match(jsonRegex);
      if (jsonMatch && jsonMatch[1] && isSingleValue(jsonMatch[1])) {
        map[label] = jsonMatch[1];
      } else {
        const dtRegex = new RegExp(`<dt[^>]*>\\s*${label}\\s*<\\/dt>\\s*<dd[^>]*>\\s*([\\s\\S]*?)\\s*<\\/dd>`, 'i');
        const dtMatch = html.match(dtRegex);
        if (dtMatch && dtMatch[1]) {
          const cleanVal = dtMatch[1].replace(/<[^>]+>/g, '').trim();
          if (isSingleValue(cleanVal)) {
            map[label] = cleanVal;
          }
        }
      }
    }
  }

  // 3. Name extraction if absent in label map
  if (!map['Name']) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      map['Name'] = h1Match[1].replace(/<[^>]+>/g, '').trim();
    } else {
      const jsonName = html.match(/"name"\s*:\s*"([^"]+)"/i);
      if (jsonName && jsonName[1]) {
        map['Name'] = jsonName[1].replace(/\s*-\s*Urban Ladder$/i, '').trim();
      }
    }
  }

  // 4. Price extraction
  let price;
  const priceJsonMatch = html.match(/"effective"\s*:\s*\{\s*"min"\s*:\s*(\d+)/i) || html.match(/"price"\s*:\s*(\d+)/i);
  if (priceJsonMatch) {
    price = parseInt(priceJsonMatch[1], 10);
  } else {
    const priceTextMatch = html.match(/₹\s*([\d,]+)/);
    if (priceTextMatch) {
      price = parseInt(priceTextMatch[1].replace(/,/g, ''), 10);
    }
  }

  return { labelMap: map, price };
}

/**
 * FIX 1: Confirmed label/value Specifications table parser.
 * Absolutely NO extraction or storage of third-party marketing prose.
 */
function extractProductSpec(html, url) {
  const { labelMap, price } = parseLabelValues(html);

  const foundLabels = Object.keys(labelMap).filter(k => k !== 'Name');
  if (foundLabels.length === 0) {
    return { status: 'structure_not_found', reason: 'Zero known specification labels located on page' };
  }

  const name = labelMap['Name'];
  const sku = labelMap['Item Code'];
  const generic_name = labelMap['Generic Name'];

  // Category Guard: rejects any product whose Generic Name / name does not contain "Bed" as a standalone word
  const isBed = /\bBed\b/i.test(name || '') || /\bBed\b/i.test(generic_name || '');
  if (!isBed) {
    return { status: 'not_a_bed', reason: 'excluded: not a bed (category guard)' };
  }

  // Prefer Primary Material Subtype if present (e.g. "Sheesham Wood" vs generic "Solid Wood")
  const primary_material = labelMap['Primary Material Subtype'] || labelMap['Primary Material Type'];
  const secondary_material = labelMap['Secondary Material Type'] || undefined;

  const seating_capacity = labelMap['Size of the Bed'];
  const storage_type = labelMap['Storage Type'];
  const finish = labelMap['Finish Name'];
  const colour = labelMap['Primary Color'];

  const color_finish = finish || colour || undefined;

  // Dimensions
  let dimensions;
  if (labelMap['Length'] && labelMap['Width'] && labelMap['Height']) {
    dimensions = `Length ${labelMap['Length']} x Width ${labelMap['Width']} x Height ${labelMap['Height']}`;
  }

  // Weight
  const weight = labelMap['Net Weight'];

  // Warranty
  let warranty_months;
  if (labelMap['Warranty In Months']) {
    const parsed = parseInt(labelMap['Warranty In Months'], 10);
    if (!isNaN(parsed)) warranty_months = parsed;
  }
  if (warranty_months === undefined) {
    warranty_months = 12;
  }

  // Recommended Mattress Size (flat string, no invented thickness_range)
  let mattress_recommendation;
  if (labelMap['Recommended Mattress Size']) {
    mattress_recommendation = {
      size: labelMap['Recommended Mattress Size']
    };
  }

  const urlSlug = url.split('/product/')[1] || '';
  const cleanId = sku ? `ul-${sku.toLowerCase()}` : `ul-${urlSlug.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  // Completeness check
  const missing = [];
  if (!name) missing.push('name');
  if (!primary_material) missing.push('primary_material');
  if (!dimensions) missing.push('dimensions');
  if (!price) missing.push('price');
  if (!seating_capacity) missing.push('seating_capacity');

  if (missing.length > 0) {
    return { status: 'structure_incomplete', missing };
  }

  // variant_axes as single-item arrays containing just current variant's own value
  const variant_axes = {
    size: seating_capacity ? [seating_capacity] : [],
    storage_type: storage_type ? [storage_type] : [],
    finish: finish ? [finish] : [],
    colour: colour ? [colour] : []
  };

  const product_short_name = name.split(' ')[0];

  const spec = {
    id: cleanId,
    name,
    product_short_name,
    category: "Bedroom",
    subcategory: "Storage Bed",
    primary_material,
    ...(secondary_material ? { secondary_material } : {}),
    seating_capacity,
    ...(color_finish ? { color_finish } : {}),
    ...(storage_type ? { storage_type } : {}),
    variant_axes,
    ...(mattress_recommendation ? { mattress_recommendation } : {}),
    dimensions,
    ...(weight ? { weight } : {}),
    warranty_months,
    price
  };

  return { status: 'complete', spec };
}

/**
 * FIX 2: Paginated URL discovery across 11 collections up to page=5.
 */
async function discoverProductUrlsWithPagination() {
  console.log('=== STEP 2: Discovering Beds Product URLs with Pagination ===');
  const productUrls = new Set();
  let withoutPaginationCount = 0;

  for (const baseUrl of COLLECTION_BASE_URLS) {
    for (let page = 1; page <= 5; page++) {
      const pageUrl = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
      try {
        console.log(`Scanning: ${pageUrl}...`);
        const res = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) break;
        const html = await res.text();

        const matches = html.match(/href=[\"'](\/product\/[^\"'\?]+)[\"']/g) || [];
        let newFoundOnPage = 0;
        for (const m of matches) {
          const pathStr = m.replace(/href=[\"']/, '').replace(/[\"']$/, '');
          if (pathStr.startsWith('/product/')) {
            const fullUrl = `https://www.urbanladder.com${pathStr}`;
            if (!productUrls.has(fullUrl)) {
              productUrls.add(fullUrl);
              newFoundOnPage++;
            }
          }
        }

        if (page === 1 && baseUrl === COLLECTION_BASE_URLS[COLLECTION_BASE_URLS.length - 1]) {
          withoutPaginationCount = productUrls.size;
        }

        if (newFoundOnPage === 0 && page > 1) {
          break;
        }
      } catch (err) {
        console.error(`Error scanning ${pageUrl}: ${err.message}`);
        break;
      }
      await new Promise(r => setTimeout(r, PAGE_FETCH_DELAY_MS));
    }
  }

  const list = Array.from(productUrls);
  console.log(`Discovered ${list.length} total unique beds product URLs (Pagination Gain: +${list.length - withoutPaginationCount}).`);
  return { list, withoutPaginationCount, withPaginationCount: list.length };
}

async function verifyKnownProducts() {
  console.log('========================================');
  console.log('VERIFICATION: Known Good Product Extraction (Fidora & Madhvi)');
  console.log('========================================');

  const fidoraUrl = 'https://www.urbanladder.com/product/fidora-solid-wood-queen-size-drawer-storage-bed-in-teak-finish-8315068';
  const madhviUrl = 'https://www.urbanladder.com/product/madhvi-solid-wood-size-bed-in-box-storage-bed-in-provincial-walnut-finish-9002702';

  const resF = await fetch(fidoraUrl, { headers: { 'User-Agent': USER_AGENT } });
  const htmlF = await resF.text();
  const specF = extractProductSpec(htmlF, fidoraUrl);

  const resM = await fetch(madhviUrl, { headers: { 'User-Agent': USER_AGENT } });
  const htmlM = await resM.text();
  const specM = extractProductSpec(htmlM, madhviUrl);

  console.log('\n--- FIDORA KNOWN EXTRACTED SPEC ---');
  console.log(JSON.stringify(specF, null, 2));

  console.log('\n--- MADHVI KNOWN EXTRACTED SPEC ---');
  console.log(JSON.stringify(specM, null, 2));
  console.log('========================================\n');
}

async function main() {
  // Verification step first
  await verifyKnownProducts();

  const { list: allUrls, withoutPaginationCount, withPaginationCount } = await discoverProductUrlsWithPagination();

  // Target cap raised to 100
  const targetCap = 100;
  const targetUrls = allUrls.slice(0, targetCap);

  if (allUrls.length < targetCap) {
    console.log(`NOTICE: ${allUrls.length} unique products found; target of 100 not reached.`);
  }

  console.log(`\n=== STEP 1b & 2: Fetching & Extracting Specs for ${targetUrls.length} Products ===`);
  console.log(`Respecting a ${PAGE_FETCH_DELAY_MS}ms delay between page fetches.`);

  const completeSpecs = [];
  let structureNotFoundCount = 0;
  let structureIncompleteCount = 0;
  let notABedCount = 0;

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    console.log(`[${i + 1}/${targetUrls.length}] Fetching ${url}...`);

    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) {
        console.log(`  Skipped: HTTP ${res.status}`);
        structureNotFoundCount++;
      } else {
        const html = await res.text();
        const extracted = extractProductSpec(html, url);
        if (extracted.status === 'complete') {
          console.log(`  Extracted spec: "${extracted.spec.name}" (ID: ${extracted.spec.id})`);
          completeSpecs.push(extracted.spec);
        } else if (extracted.status === 'not_a_bed') {
          console.log(`  Skipped: excluded: not a bed (category guard)`);
          notABedCount++;
        } else if (extracted.status === 'structure_not_found') {
          console.log(`  Skipped: structure not found`);
          structureNotFoundCount++;
        } else {
          console.log(`  Skipped: structure found but incomplete: missing ${extracted.missing.join(', ')}`);
          structureIncompleteCount++;
        }
      }
    } catch (err) {
      console.log(`  Skipped: Error fetching (${err.message})`);
      structureNotFoundCount++;
    }

    if (i < targetUrls.length - 1) {
      await new Promise(r => setTimeout(r, PAGE_FETCH_DELAY_MS));
    }
  }

  console.log(`\nExtracted ${completeSpecs.length} complete spec objects (${notABedCount} excluded by category guard, ${structureNotFoundCount} structure not found, ${structureIncompleteCount} incomplete).`);

  console.log('\n=== STEP 3: Generating Original AI Content via generateOne() ===');

  const priceBands = loadPriceBands();

  if (!fs.existsSync(DATASET_DIR)) {
    fs.mkdirSync(DATASET_DIR, { recursive: true });
  }

  const retriedProducts = new Set();
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args.join(' ');
    const retryMatch = msg.match(/\[retry(?:\s+\d+\/\d+)?\] product ([\w-]+)/);
    if (retryMatch) {
      retriedProducts.add(retryMatch[1]);
    }
    originalWarn.apply(console, args);
  };

  let passedAttempt1 = 0;
  let passedRetry = 0;
  let endedNeedsReview = 0;
  let writtenCount = 0;

  if (fs.existsSync(DATASET_FILE)) {
    fs.unlinkSync(DATASET_FILE);
  }

  const generateDelayStr = process.env.GENERATE_DELAY_MS;
  const generateDelayMs = generateDelayStr !== undefined ? parseInt(generateDelayStr, 10) : (process.env.MODE === 'test' ? 0 : 15000);

  for (let i = 0; i < completeSpecs.length; i++) {
    const spec = completeSpecs[i];
    const itemCode = spec.item_code || (spec.id ? spec.id.replace(/^ul-/i, '') : null) || spec.id;

    // SKU Dedup check
    const existingClaim = isSkuUsed(itemCode);
    if (existingClaim && existingClaim.subcategory !== 'Beds') {
      console.log(`  skipped: already claimed by ${existingClaim.subcategory} (SKU: ${itemCode})`);
      continue;
    }

    console.log(`[${i + 1}/${completeSpecs.length}] Generating content for: "${spec.name}" (${spec.id})...`);

    try {
      const generatedOutput = await generateOne(spec, priceBands);

      // Register SKU immediately after successful generation
      registerSku(itemCode, {
        subcategory: 'Beds',
        id: spec.id
      });

      const hadRetry = retriedProducts.has(spec.id);
      const isNeedsReview = Boolean(generatedOutput._meta?.needs_review);

      if (isNeedsReview) {
        endedNeedsReview++;
        console.log(`  Result: NEEDS_REVIEW (${generatedOutput._meta?.validation_errors?.join('; ') || 'care/validation check'})`);
      } else if (hadRetry) {
        passedRetry++;
        console.log(`  Result: PASSED (attempt 2 retry)`);
      } else {
        passedAttempt1++;
        console.log(`  Result: PASSED (attempt 1)`);
      }

      const datasetRecord = {
        input: spec,
        output: generatedOutput
      };

      fs.appendFileSync(DATASET_FILE, JSON.stringify(datasetRecord) + '\n');
      writtenCount++;

    } catch (err) {
      console.error(`  Generation error for ${spec.id}: ${err.message}`);
    }

    if (i < completeSpecs.length - 1 && generateDelayMs > 0) {
      console.log(`Waiting ${generateDelayMs}ms between LLM calls...`);
      await new Promise(r => setTimeout(r, generateDelayMs));
    }
  }

  console.warn = originalWarn;

  console.log('\n========================================');
  console.log('STEP 4 — FINAL REPORT');
  console.log('========================================');
  console.log(`1. Total unique product URLs found: ${withPaginationCount}`);
  console.log(`   - Without pagination (Page 1 only): ${withoutPaginationCount}`);
  console.log(`   - With pagination (up to Page 5): ${withPaginationCount}`);
  console.log(`   - Pagination gain: +${withPaginationCount - withoutPaginationCount} unique URLs`);
  if (withPaginationCount < targetCap) {
    console.log(`   - Target status: ${withPaginationCount} unique products found; target of ${targetCap} not reached.`);
  } else {
    console.log(`   - Target status: Target of ${targetCap} unique products reached.`);
  }
  console.log(`2. Products attempted: ${targetUrls.length}`);
  console.log(`3. Spec Extraction Breakdown:`);
  console.log(`   - Complete spec extracted: ${completeSpecs.length}`);
  console.log(`   - Excluded by category guard (not a bed): ${notABedCount}`);
  console.log(`   - Structure not found: ${structureNotFoundCount}`);
  console.log(`   - Structure found but incomplete: ${structureIncompleteCount}`);
  console.log(`4. Validation Breakdown:`);
  console.log(`   - Passed on Attempt 1: ${passedAttempt1}`);
  console.log(`   - Passed on Attempt 2 (retry): ${passedRetry}`);
  console.log(`   - Ended as needs_review: ${endedNeedsReview}`);
  console.log(`5. Final records written to dataset: ${writtenCount}`);
  console.log(`   Output file path: ${DATASET_FILE}`);
  console.log('========================================\n');
}

main().catch(err => {
  console.error('Build dataset script failed:', err);
  process.exit(1);
});

module.exports = { extractProductSpec };
