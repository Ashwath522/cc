/**
 * Single Responsibility: Orchestrates the 3-Role Loop across Bedroom Subcategories:
 * - Role 1: Fetch + Generate Agent (generates up to 50 or real ceiling, SKU dedup enforced)
 * - Role 2: Validator / Diagnostic Agent (cross-category Jaccard and phrase-frequency check, root cause analysis)
 * - Role 3: Rule-Addition Agent (additive preventive rules in data/rules.json and category avoid_list)
 */
const fs = require('fs');
const path = require('path');
const { generateOne, loadPriceBands } = require('./generate');
const { isSkuUsed, registerSku } = require('./skuRegistry');
const { loadCategoryRules, SUBCATEGORY_MAPPING } = require('./promptBuilder');
const {
  loadOpeners,
  loadPhraseFrequencies,
  extractPhrases,
  extractSignificantWords,
  buildNgrams,
  jaccardSimilarity,
  ngramOverlapCheck
} = require('./openerStore');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const PAGE_FETCH_DELAY_MS = 1500;
const TRAINING_SET_DIR = path.join(__dirname, '..', 'data', 'trainingSet');
const RULES_PATH = path.join(__dirname, '..', 'data', 'rules.json');

const SUBCATEGORY_CONFIGS = {
  Beds: {
    name: 'Beds',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/beds',
      'https://www.urbanladder.com/collection/all-beds',
      'https://www.urbanladder.com/collection/king-size-beds',
      'https://www.urbanladder.com/collection/queen-size-beds',
      'https://www.urbanladder.com/collection/single-beds',
      'https://www.urbanladder.com/collection/storage-beds',
      'https://www.urbanladder.com/collection/hydraulic-storage-beds',
      'https://www.urbanladder.com/collection/wooden-beds',
      'https://www.urbanladder.com/collection/solid-wood-beds',
      'https://www.urbanladder.com/collection/upholstered-beds'
    ],
    categoryGuard: (name, genericName) => /\bBed\b/i.test(name || '') || /\bBed\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'beds_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Beds.json')
  },
  Mattresses: {
    name: 'Mattresses',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/mattresses',
      'https://www.urbanladder.com/collection/king-size-mattress',
      'https://www.urbanladder.com/collection/queen-size-mattress',
      'https://www.urbanladder.com/collection/memory-foam-mattress',
      'https://www.urbanladder.com/collection/orthopaedic-mattress',
      'https://www.urbanladder.com/collection/spring-mattress'
    ],
    categoryGuard: (name, genericName) => /\bMattress\b/i.test(name || '') || /\bMattress\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'mattresses_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Mattresses.json')
  },
  Wardrobes: {
    name: 'Wardrobes',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/wardrobes',
      'https://www.urbanladder.com/collection/2-door-wardrobes',
      'https://www.urbanladder.com/collection/3-door-wardrobes',
      'https://www.urbanladder.com/collection/sliding-wardrobes'
    ],
    categoryGuard: (name, genericName) => /\b(Wardrobe|Almirah|Cupboard)\b/i.test(name || '') || /\b(Wardrobe|Almirah|Cupboard)\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'wardrobes_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Wardrobes.json')
  },
  'Bedroom Storage': {
    name: 'Bedroom Storage',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/collection/dressing-tables',
      'https://www.urbanladder.com/collection/bedside-tables',
      'https://www.urbanladder.com/collection/chest-of-drawers'
    ],
    categoryGuard: (name, genericName) => /\b(Dressing|Bedside|Chest|Drawer|Bench|Storage|Nightstand|Table)\b/i.test(name || '') || /\b(Dressing|Bedside|Chest|Drawer|Bench|Storage|Nightstand|Table)\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'bedroom_storage_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Bedroom Storage.json')
  },
  'Kids Room': {
    name: 'Kids Room',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/collection/kids-beds',
      'https://www.urbanladder.com/collection/bunk-beds',
      'https://www.urbanladder.com/collection/kids-tables',
      'https://www.urbanladder.com/collection/kids-chairs'
    ],
    categoryGuard: (name, genericName) => /\b(Kids|Child|Bunk|Slide|Junior|Baby|Toddler|Bed|Table|Chair|Study)\b/i.test(name || '') || /\b(Kids|Child|Bunk|Slide|Junior|Baby|Toddler|Bed|Table|Chair|Study)\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'kids_room_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Kids Room.json')
  },
  'Pet Furniture': {
    name: 'Pet Furniture',
    category: 'Bedroom',
    seedUrls: [
      'https://www.urbanladder.com/collection/pet-beds'
    ],
    categoryGuard: (name, genericName) => /\b(Pet|Dog|Cat|Animal)\b/i.test(name || '') || /\b(Pet|Dog|Cat|Animal)\b/i.test(genericName || ''),
    outputFile: path.join(TRAINING_SET_DIR, 'pet_furniture_generated.jsonl'),
    ruleFile: path.join(__dirname, '..', 'data', 'categoryPrompts', 'Bedroom', 'Pet Furniture.json')
  }
};

const KNOWN_LABELS = [
  'Name',
  'Item Code',
  'Generic Name',
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
  'Mattress Size',
  'Length',
  'Width',
  'Height',
  'Net Weight',
  'Seating Capacity'
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

function extractItemCode(html, url) {
  const { labelMap } = parseLabelValues(html);
  const sku = labelMap['Item Code'];
  if (sku) return String(sku).trim().toUpperCase();
  const urlSlug = url.split('/product/')[1] || '';
  return urlSlug.replace(/[^a-z0-9]+/gi, '-').toUpperCase();
}

function extractFullSpec(html, url, subcategoryName) {
  const config = SUBCATEGORY_CONFIGS[subcategoryName];
  const { labelMap, price } = parseLabelValues(html);

  const name = labelMap['Name'];
  const sku = labelMap['Item Code'];
  const generic_name = labelMap['Generic Name'];

  if (typeof config.categoryGuard === 'function' && !config.categoryGuard(name, generic_name)) {
    return { status: 'category_guard_failed', reason: `excluded: does not match category guard for ${subcategoryName}` };
  }

  const primary_material = labelMap['Primary Material Subtype'] || labelMap['Primary Material Type'] || 'Engineered Wood';
  const secondary_material = labelMap['Secondary Material Type'] || undefined;

  const seating_capacity = labelMap['Size of the Bed'] || labelMap['Mattress Size'] || labelMap['Seating Capacity'] || undefined;
  const storage_type = labelMap['Storage Type'] || undefined;
  const finish = labelMap['Finish Name'];
  const colour = labelMap['Primary Color'];
  const color_finish = finish || colour || undefined;

  let dimensions;
  if (labelMap['Length'] && labelMap['Width'] && labelMap['Height']) {
    dimensions = `Length ${labelMap['Length']} x Width ${labelMap['Width']} x Height ${labelMap['Height']}`;
  } else if (labelMap['Dimensions']) {
    dimensions = labelMap['Dimensions'];
  }

  const weight = labelMap['Net Weight'];

  let warranty_months;
  if (labelMap['Warranty In Months']) {
    const parsed = parseInt(labelMap['Warranty In Months'], 10);
    if (!isNaN(parsed)) warranty_months = parsed;
  }
  if (warranty_months === undefined) {
    warranty_months = 12;
  }

  let mattress_recommendation;
  if (labelMap['Recommended Mattress Size']) {
    mattress_recommendation = { size: labelMap['Recommended Mattress Size'] };
  }

  const urlSlug = url.split('/product/')[1] || '';
  const cleanId = sku ? `ul-${sku.toLowerCase()}` : `ul-${urlSlug.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

  const missing = [];
  if (!name) missing.push('name');
  if (!dimensions) missing.push('dimensions');
  if (!price) missing.push('price');

  if (missing.length > 0) {
    return { status: 'structure_incomplete', missing };
  }

  const variant_axes = {
    size: seating_capacity ? [seating_capacity] : [],
    storage_type: storage_type ? [storage_type] : [],
    finish: finish ? [finish] : [],
    colour: colour ? [colour] : []
  };

  const product_short_name = name.split(' ')[0];

  const spec = {
    id: cleanId,
    item_code: sku || cleanId.replace(/^ul-/, '').toUpperCase(),
    name,
    product_short_name,
    category: config.category || 'Bedroom',
    subcategory: config.name,
    primary_material,
    ...(secondary_material ? { secondary_material } : {}),
    ...(seating_capacity ? { seating_capacity } : {}),
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

async function discoverAllUrlsForSubcategory(subcategoryName) {
  const config = SUBCATEGORY_CONFIGS[subcategoryName];
  const productUrls = new Set();

  for (const baseUrl of config.seedUrls) {
    for (let page = 1; page <= 5; page++) {
      const pageUrl = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
      try {
        const res = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) break;
        const html = await res.text();

        const matches = html.match(/href=["'](\/product\/[^"'?]+)["']/g) || [];
        let newFound = 0;
        for (const m of matches) {
          const pathStr = m.replace(/href=["']/, '').replace(/["']$/, '');
          if (pathStr.startsWith('/product/')) {
            const fullUrl = `https://www.urbanladder.com${pathStr}`;
            if (!productUrls.has(fullUrl)) {
              productUrls.add(fullUrl);
              newFound++;
            }
          }
        }
        if (newFound === 0 && page > 1) break;
      } catch (err) {
        break;
      }
      await new Promise(r => setTimeout(r, PAGE_FETCH_DELAY_MS));
    }
  }

  return Array.from(productUrls);
}

// ROLE 1: Fetch + Generate Agent
async function runRole1(subcategoryName, targetAccepted = 50) {
  const config = SUBCATEGORY_CONFIGS[subcategoryName];
  if (!config) throw new Error(`Unknown subcategory ${subcategoryName}`);

  console.log(`\n======================================================`);
  console.log(`[ROLE 1] FETCH & GENERATE for "${subcategoryName}"`);
  console.log(`======================================================`);

  if (!fs.existsSync(TRAINING_SET_DIR)) {
    fs.mkdirSync(TRAINING_SET_DIR, { recursive: true });
  }

  const outputFile = config.outputFile;
  const existingRecords = fs.existsSync(outputFile)
    ? fs.readFileSync(outputFile, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
    : [];

  const initialCount = existingRecords.length;
  console.log(`Existing accepted records in ${path.basename(outputFile)}: ${initialCount}`);

  if (initialCount >= targetAccepted) {
    console.log(`Already reached target of ${targetAccepted} accepted records.`);
    return {
      subcategory: subcategoryName,
      initialCount,
      finalCount: initialCount,
      discoveredUrlsCount: 0,
      newGeneratedCount: 0,
      dedupSkipsCount: 0,
      ceilingReached: false
    };
  }

  const discoveredUrls = await discoverAllUrlsForSubcategory(subcategoryName);
  console.log(`Discovered ${discoveredUrls.length} total unique product URLs for ${subcategoryName}`);

  const priceBands = loadPriceBands();
  let currentAcceptedCount = initialCount;
  let newGeneratedCount = 0;
  let dedupSkipsCount = 0;

  for (let i = 0; i < discoveredUrls.length; i++) {
    if (currentAcceptedCount >= targetAccepted) {
      console.log(`Target accepted count (${targetAccepted}) reached!`);
      break;
    }

    const url = discoveredUrls[i];
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const html = await res.text();

      // 1. Extract Item Code FIRST
      const itemCode = extractItemCode(html, url);

      // 2. Uniqueness check
      const existingClaim = isSkuUsed(itemCode);
      if (existingClaim) {
        console.log(`  [DEDUP SKIP] skipped: uid ${itemCode} already claimed by ${existingClaim.subcategory}`);
        dedupSkipsCount++;
        continue;
      }

      // 3. Full spec extraction
      const extracted = extractFullSpec(html, url, subcategoryName);
      if (extracted.status !== 'complete') {
        console.log(`  [SPEC SKIP] ${extracted.status}: ${extracted.reason || JSON.stringify(extracted.missing || '')}`);
        continue;
      }

      const spec = extracted.spec;
      console.log(`\n  [GENERATING ${currentAcceptedCount + 1}/${targetAccepted}] "${spec.name}" (SKU: ${itemCode})...`);

      // 4. Generate via generateOne
      const generatedOutput = await generateOne(spec, priceBands);

      // 5. Register SKU on success
      registerSku(itemCode, {
        subcategory: subcategoryName,
        id: spec.id
      });

      const datasetRecord = {
        input: spec,
        output: generatedOutput
      };

      fs.appendFileSync(outputFile, JSON.stringify(datasetRecord) + '\n', 'utf-8');
      currentAcceptedCount++;
      newGeneratedCount++;

      console.log(`  -> Accepted [${currentAcceptedCount}/${targetAccepted}] for ${spec.id}`);

      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.error(`  [ERR] ${url}: ${err.message}`);
    }
  }

  const ceilingReached = currentAcceptedCount < targetAccepted;
  if (ceilingReached) {
    console.log(`\n[HARD STOP] All collection URLs exhausted for ${subcategoryName}. Actual ceiling: ${currentAcceptedCount}/${targetAccepted} records.`);
  }

  return {
    subcategory: subcategoryName,
    initialCount,
    finalCount: currentAcceptedCount,
    discoveredUrlsCount: discoveredUrls.length,
    newGeneratedCount,
    dedupSkipsCount,
    ceilingReached
  };
}

// ROLE 2: Validator / Diagnostic Agent (Read-Only)
function runRole2(subcategoryName) {
  const config = SUBCATEGORY_CONFIGS[subcategoryName];
  console.log(`\n======================================================`);
  console.log(`[ROLE 2] VALIDATION & DIAGNOSTIC for "${subcategoryName}"`);
  console.log(`======================================================`);

  const outputFile = config.outputFile;
  if (!fs.existsSync(outputFile)) {
    return { subcategory: subcategoryName, totalRecords: 0, flaggedItems: [], diagnoses: [] };
  }

  const lines = fs.readFileSync(outputFile, 'utf-8').trim().split('\n').filter(Boolean);
  const records = lines.map(l => JSON.parse(l));

  // Load all accepted openers/closers across all subcategories
  const allJsonlFiles = fs.readdirSync(TRAINING_SET_DIR).filter(f => f.endsWith('.jsonl'));
  const allCorpusRecords = [];
  for (const f of allJsonlFiles) {
    const fLines = fs.readFileSync(path.join(TRAINING_SET_DIR, f), 'utf-8').trim().split('\n').filter(Boolean);
    for (const fl of fLines) {
      const d = JSON.parse(fl);
      const summary = d.output?.description?.summary || '';
      const sents = summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || [summary];
      allCorpusRecords.push({
        id: d.input?.id,
        subcategory: d.input?.subcategory,
        file: f,
        opener: sents[0] || '',
        closer: sents[sents.length - 1] || '',
        fullRecord: d
      });
    }
  }

  const freqMap = loadPhraseFrequencies();

  let repetitionRetriesCount = 0;
  let phraseOveruseRetriesCount = 0;
  let phraseOveruseFlaggedCount = 0;
  let repetitionFlaggedCount = 0;

  const flaggedItems = [];
  const distinctOverusedPhrases = new Map();

  for (const r of records) {
    const history = r.output?._meta?.attempt_history || [];
    const repRetry = history.some(h => h.repetition_failed || (h.errors && h.errors.some(e => e.includes('REPETITION FIX'))));
    const phraseRetry = history.some(h => h.phrase_overuse_failed || (h.errors && h.errors.some(e => e.includes('OVERUSED PHRASE'))));

    if (repRetry) repetitionRetriesCount++;
    if (phraseRetry) phraseOveruseRetriesCount++;

    const isRepFlagged = Boolean(r.output?._meta?.repetition_flagged);
    const isPhraseFlagged = Boolean(r.output?._meta?.phrase_overuse_flagged);

    if (isRepFlagged) repetitionFlaggedCount++;
    if (isPhraseFlagged) phraseOveruseFlaggedCount++;

    if (isRepFlagged || isPhraseFlagged) {
      const overused = r.output?._meta?.overused_phrases || [];
      flaggedItems.push({
        id: r.input?.id,
        name: r.input?.name,
        attempts: history.length,
        isRepFlagged,
        isPhraseFlagged,
        overusedPhrases: overused
      });

      overused.forEach(p => {
        distinctOverusedPhrases.set(p.phrase, (distinctOverusedPhrases.get(p.phrase) || 0) + 1);
      });
    }
  }

  // Root Cause Diagnosis for each distinct overused phrase
  const ruleFileContent = fs.existsSync(config.ruleFile) ? fs.readFileSync(config.ruleFile, 'utf-8') : '';
  const diagnoses = [];

  for (const [phrase, flagCount] of distinctOverusedPhrases.entries()) {
    let causeType = 'GENERIC_LLM_TIC';
    let details = '';

    // Check 1: Category rule file wording
    if (ruleFileContent.toLowerCase().includes(phrase.toLowerCase())) {
      causeType = 'CATEGORY_RULE_WORDING';
      details = `Traced to wording in ${path.basename(config.ruleFile)}`;
    } else if (
      phrase.includes('morning') ||
      phrase.includes('evening') ||
      phrase.includes('after long') ||
      phrase.includes('settling after') ||
      phrase.includes('long day') ||
      phrase.includes('weekend routine') ||
      phrase.includes('hosting guest')
    ) {
      causeType = 'STRATEGY_BUCKET';
      details = `Originates from Strategy 2 sub-case / moment rotation phrases`;
    } else {
      causeType = 'GENERIC_LLM_TIC';
      details = `General LLM default connector/filler phrase independent of rule files`;
    }

    diagnoses.push({
      phrase,
      category: subcategoryName,
      occurrencesInFlagged: flagCount,
      totalCorpusFrequency: freqMap[phrase] || 0,
      causeType,
      details
    });
  }

  console.log(`\n--- ROLE 2 DIAGNOSTIC REPORT FOR ${subcategoryName} ---`);
  console.log(`Total Accepted Records: ${records.length}`);
  console.log(`Repetition Retries Triggered: ${repetitionRetriesCount}`);
  console.log(`Phrase Overuse Retries Triggered: ${phraseOveruseRetriesCount}`);
  console.log(`Repetition Soft-Flagged (Attempt 3): ${repetitionFlaggedCount}`);
  console.log(`Phrase Overuse Soft-Flagged (Attempt 3): ${phraseOveruseFlaggedCount}`);
  console.log(`Diagnoses Identified: ${diagnoses.length}`);
  diagnoses.forEach(d => {
    console.log(`  - [${d.causeType}] "${d.phrase}" (${d.totalCorpusFrequency}x in corpus) -> ${d.details}`);
  });

  return {
    subcategory: subcategoryName,
    totalRecords: records.length,
    repetitionRetriesCount,
    phraseOveruseRetriesCount,
    repetitionFlaggedCount,
    phraseOveruseFlaggedCount,
    flaggedItems,
    diagnoses
  };
}

// ROLE 3: Rule-Addition Agent (Additive Only)
function runRole3(diagnosisReport) {
  const { subcategory, diagnoses } = diagnosisReport;
  console.log(`\n======================================================`);
  console.log(`[ROLE 3] PREVENTIVE RULE ADDITION for "${subcategory}"`);
  console.log(`======================================================`);

  const addedRules = [];
  const config = SUBCATEGORY_CONFIGS[subcategory];

  // Load rules.json
  let rulesJson = {};
  try {
    rulesJson = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  } catch (e) {
    rulesJson = {};
  }
  if (!rulesJson.Bedroom) rulesJson.Bedroom = {};

  // For generic tics or strategy overuses, add to data/rules.json
  const genericPhrasesToAvoid = diagnoses
    .filter(d => (d.causeType === 'GENERIC_LLM_TIC' || d.causeType === 'STRATEGY_BUCKET') && d.totalCorpusFrequency >= 3)
    .map(d => d.phrase);

  if (genericPhrasesToAvoid.length > 0) {
    const existingRule = rulesJson.Bedroom.summary_phrasing || '';
    const newPhrases = genericPhrasesToAvoid.filter(p => !existingRule.includes(`'${p}'`));

    if (newPhrases.length > 0) {
      const addition = `Avoid overused stock phrases: ${newPhrases.map(p => `'${p}'`).join(', ')}. Use varied, product-specific vocabulary and diverse sentence structures instead.`;
      const combined = existingRule ? `${existingRule} ${addition}` : addition;
      rulesJson.Bedroom.summary_phrasing = combined;
      fs.writeFileSync(RULES_PATH, JSON.stringify(rulesJson, null, 2), 'utf-8');

      addedRules.push({
        target: 'data/rules.json',
        key: 'Bedroom.summary_phrasing',
        rule: addition
      });
      console.log(`  [ADDED RULE TO rules.json]: ${addition}`);
    }
  }

  // For category-specific phrasing, additively append to avoid_list in category JSON
  const categorySpecificPhrases = diagnoses.filter(d => d.causeType === 'CATEGORY_RULE_WORDING');
  if (categorySpecificPhrases.length > 0 && fs.existsSync(config.ruleFile)) {
    try {
      const catRules = JSON.parse(fs.readFileSync(config.ruleFile, 'utf-8'));
      if (Array.isArray(catRules.avoid_list)) {
        categorySpecificPhrases.forEach(d => {
          const avoidItem = `Do not use '${d.phrase}' or close variants — describe concrete product attributes instead.`;
          if (!catRules.avoid_list.includes(avoidItem)) {
            catRules.avoid_list.push(avoidItem);
            addedRules.push({
              target: path.basename(config.ruleFile),
              avoidItem
            });
            console.log(`  [APPENDED TO avoid_list in ${path.basename(config.ruleFile)}]: ${avoidItem}`);
          }
        });
        fs.writeFileSync(config.ruleFile, JSON.stringify(catRules, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn(`  [WARN] Failed to update category avoid_list: ${e.message}`);
    }
  }

  if (addedRules.length === 0) {
    console.log(`  No new rule additions required for ${subcategory}.`);
  }

  return addedRules;
}

module.exports = {
  SUBCATEGORY_CONFIGS,
  runRole1,
  runRole2,
  runRole3
};
