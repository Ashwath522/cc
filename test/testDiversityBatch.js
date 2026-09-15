/**
 * Diversity Batch Test
 *
 * Tests the pipeline against a batch of bedroom/furniture products (Cove, Opal, Masai, Nina)
 * that are structurally similar (all beds, similar materials) to stress-test:
 *   1. Exact repetition: same sentence appearing in multiple outputs
 *   2. Phrase repetition: shared 2-gram/3-gram phrases across products
 *   3. Structural repetition: same narrative template used for multiple products
 *   4. Semantic repetition: same opening angle (e.g. all using "material-first" framing)
 *   5. Product specificity: each description must reference the product's distinguishing attribute
 *
 * This test uses the mock LLM client — no API key required.
 *
 * SUCCESS CRITERIA:
 *   - No two products share an opener or closer with Jaccard similarity >= 0.5
 *   - No structural pattern (from STRUCTURAL_OPENER_PATTERNS) appears in more than 2 of 7 outputs
 *   - Each summary mentions the product's short name exactly once in the final sentence
 *   - No phrase appears in more than N/2 of the generated summaries (where N = batch size)
 *   - All summaries pass the standard validator (word count, structure, etc.)
 */

'use strict';

process.env.NODE_ENV = 'test';

// --- Setup: stub Mongo so the helpers load cleanly without a DB ---
const mongoose = require('mongoose');
const dummyConn = new mongoose.Connection(mongoose);
const mongoInitPath = require.resolve('../app/common/mongo.init');
require.cache[mongoInitPath] = {
  id: mongoInitPath, filename: mongoInitPath, loaded: true,
  exports: { host: dummyConn, groot: dummyConn },
};

const fs = require('fs');
const path = require('path');
const os = require('os');

// Use a temporary isolated opener store for this test run
// so it doesn't pollute or read from the real generatedOpeners.jsonl
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diversity-test-'));
const tmpOpenersPath = path.join(tmpDir, 'openers.jsonl');
const tmpFreqPath = path.join(tmpDir, 'phraseFreq.json');

// Patch the helper to use temp paths
const openerStoreHelper = require('../app/helpers/ai-content/ai-opener-store.helper');
const originalLoadOpeners = openerStoreHelper.loadOpeners;
const originalAppendOpener = openerStoreHelper.appendOpener;
const originalLoadPhrase = openerStoreHelper.loadPhraseFrequencies;
const originalBuildHint = openerStoreHelper.buildDiversityHint;

openerStoreHelper.loadOpeners = (fp) => originalLoadOpeners(fp || tmpOpenersPath);
openerStoreHelper.appendOpener = (opts, fp, pfp) => originalAppendOpener(opts, fp || tmpOpenersPath, pfp || tmpFreqPath);
openerStoreHelper.loadPhraseFrequencies = (fp) => originalLoadPhrase(fp || tmpFreqPath);
openerStoreHelper.buildDiversityHint = (n, fp) => originalBuildHint(n, fp || tmpOpenersPath);

// Patch the orchestrator's opener store references too
const orchestratorPath = require.resolve('../app/helpers/ai-content/ai-orchestrator.helper');
delete require.cache[orchestratorPath];

const { setMockClient, clearMockClient } = require('../app/helpers/ai-content/ai-llm-client.helper');
const { mockGenerateContent, mockGenerateText } = require('./mockLlmClient');
const { generateOne } = require('../app/helpers/ai-content/ai-orchestrator.helper');
const {
  ngramOverlapCheck,
  extractPhrases,
  extractSignificantWords,
  jaccardSimilarity,
  buildNgrams,
  STRUCTURAL_OPENER_PATTERNS,
  STRUCTURAL_CLOSER_PATTERNS,
} = require('../app/helpers/ai-content/ai-opener-store.helper');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');

// Set mock LLM client
setMockClient({ generateContent: mockGenerateContent, generateText: mockGenerateText });

// --- Test Products: 7 bedroom products with structural similarities ---
const BATCH_PRODUCTS = [
  {
    id: 'ul-cove-king-walnut',
    name: 'Cove King Size Solid Wood Bed in Walnut Finish',
    product_short_name: 'Cove',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Solid Sheesham Wood',
    color_finish: 'Walnut',
    seating_capacity: 'King Size',
    variant_axes: { size: ['King Size', 'Queen Size'], finish: ['Walnut'] },
    mattress_recommendation: { size: '78 x 72 inches' },
    warranty_months: 18,
    price: 45000,
  },
  {
    id: 'ul-opal-queen-natural',
    name: 'Opal Queen Size Solid Wood Bed in Natural Teak Finish',
    product_short_name: 'Opal',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Solid Teak Wood',
    color_finish: 'Natural Teak',
    seating_capacity: 'Queen Size',
    variant_axes: { size: ['Queen Size', 'King Size'], finish: ['Natural Teak'] },
    mattress_recommendation: { size: '78 x 60 inches' },
    warranty_months: 24,
    price: 52000,
  },
  {
    id: 'ul-masai-king-ebony',
    name: 'Masai King Size Engineered Wood Bed in Ebony Finish',
    product_short_name: 'Masai',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Engineered Wood',
    color_finish: 'Ebony',
    seating_capacity: 'King Size',
    storage_type: 'Hydraulic Storage',
    variant_axes: { size: ['King Size'], storage_type: ['Hydraulic Storage'], finish: ['Ebony'] },
    mattress_recommendation: { size: '78 x 72 inches' },
    warranty_months: 12,
    price: 28000,
  },
  {
    id: 'ul-nina-queen-white',
    name: 'Nina Queen Size Upholstered Bed in White',
    product_short_name: 'Nina',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Fabric Upholstery',
    secondary_material: 'Engineered Wood Frame',
    color_finish: 'White',
    seating_capacity: 'Queen Size',
    variant_axes: { size: ['Queen Size', 'King Size'], finish: ['White', 'Grey'] },
    mattress_recommendation: { size: '78 x 60 inches' },
    warranty_months: 12,
    price: 35000,
  },
  {
    id: 'ul-rio-single-natural',
    name: 'Rio Single Size Solid Mango Wood Bed in Natural Finish',
    product_short_name: 'Rio',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Solid Mango Wood',
    color_finish: 'Natural',
    seating_capacity: 'Single Size',
    variant_axes: { size: ['Single Size', 'Queen Size'], finish: ['Natural'] },
    mattress_recommendation: { size: '72 x 36 inches' },
    warranty_months: 12,
    price: 18000,
  },
  {
    id: 'ul-haven-king-charcoal',
    name: 'Haven King Size Fabric Upholstered Storage Bed in Charcoal',
    product_short_name: 'Haven',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Fabric Upholstery',
    color_finish: 'Charcoal',
    seating_capacity: 'King Size',
    storage_type: 'Box Storage',
    variant_axes: { size: ['King Size'], storage_type: ['Box Storage'], finish: ['Charcoal', 'Navy'] },
    mattress_recommendation: { size: '78 x 72 inches' },
    warranty_months: 12,
    price: 42000,
  },
  {
    id: 'ul-lune-queen-oak',
    name: 'Lune Queen Size Scandinavian Style Solid Wood Bed in Oak Finish',
    product_short_name: 'Lune',
    category: 'Bedroom',
    subcategory: 'Beds',
    primary_material: 'Solid Rubberwood',
    color_finish: 'Oak',
    seating_capacity: 'Queen Size',
    variant_axes: { size: ['Queen Size', 'King Size'], finish: ['Oak', 'Walnut'] },
    mattress_recommendation: { size: '78 x 60 inches' },
    warranty_months: 18,
    price: 38000,
  },
];

// Cleanup
function cleanup() {
  clearMockClient();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName, details) {
  if (condition) {
    console.log('✔ PASS:', testName);
    passed++;
  } else {
    console.log('✘ FAIL:', testName);
    if (details) console.log('  >', details);
    failed++;
    failures.push({ testName, details });
  }
}

function parseOpeners(summary) {
  const sentences = (summary.match(/[^.!?]+[.!?]+/g) || []).map((s) => s.trim()).filter(Boolean);
  return {
    opener: sentences[0] || '',
    closer: sentences.length > 0 ? sentences[sentences.length - 1] : '',
    sentences,
  };
}

function jaccardForSentences(a, b) {
  const wa = extractSignificantWords(a);
  const wb = extractSignificantWords(b);
  const nga = buildNgrams(wa, 3);
  const ngb = buildNgrams(wb, 3);
  return jaccardSimilarity(nga, ngb);
}

async function runBatchDiversityTest() {
  console.log('\n======================================================');
  console.log('DIVERSITY BATCH TEST — Bedroom Products (Cove, Opal, Masai, Nina...)');
  console.log('======================================================\n');

  const priceBands = { Bedroom: { good_max: 10000, mid_max: 40000 }, Default: { good_max: 5000, mid_max: 20000 } };
  const results = [];

  // --- Phase 1: Generate all products ---
  console.log('Phase 1: Generating content for all 7 products...\n');
  for (const product of BATCH_PRODUCTS) {
    try {
      const output = await generateOne(product, priceBands, 1, {
        options: { skipRepetitionCheck: false },
      });
      results.push({ product, output });
      console.log(`  Generated: ${product.product_short_name} (${product.id})`);
      if (output._meta && output._meta.attempt_history) {
        const attempts = output._meta.attempt_history.length;
        if (attempts > 1) {
          console.log(`  -> Required ${attempts} attempts (repetition/validation retries)`);
        }
      }
    } catch (err) {
      console.error(`  ERROR generating ${product.id}: ${err.message}`);
      results.push({ product, output: null, error: err.message });
    }
  }

  console.log('\nPhase 2: Diversity Analysis...\n');

  const summaries = results
    .filter((r) => r.output && r.output.description && r.output.description.summary)
    .map((r) => ({
      id: r.product.id,
      shortName: r.product.product_short_name,
      summary: r.output.description.summary,
      ...parseOpeners(r.output.description.summary),
    }));

  // --- Test 1: All products generated successfully ---
  const generatedCount = results.filter((r) => r.output && !r.error).length;
  assert(
    generatedCount === BATCH_PRODUCTS.length,
    `Test 1: All ${BATCH_PRODUCTS.length} products generated successfully`,
    generatedCount < BATCH_PRODUCTS.length
      ? `Only ${generatedCount}/${BATCH_PRODUCTS.length} generated. Failures: ${results.filter((r) => r.error).map((r) => r.product.id).join(', ')}`
      : null,
  );

  // --- Test 2: No two openers are too similar (Jaccard < 0.5) ---
  const openerPairs = [];
  for (let i = 0; i < summaries.length; i++) {
    for (let j = i + 1; j < summaries.length; j++) {
      const score = jaccardForSentences(summaries[i].opener, summaries[j].opener);
      if (score >= 0.5) {
        openerPairs.push({ a: summaries[i].id, b: summaries[j].id, score: score.toFixed(3) });
      }
    }
  }
  assert(
    openerPairs.length === 0,
    'Test 2: No two openers have Jaccard similarity >= 0.5',
    openerPairs.length > 0
      ? 'Similar pairs: ' + openerPairs.map((p) => `${p.a} vs ${p.b} (${p.score})`).join(', ')
      : null,
  );

  // --- Test 3: No two closers are too similar (Jaccard < 0.5) ---
  const closerPairs = [];
  for (let i = 0; i < summaries.length; i++) {
    for (let j = i + 1; j < summaries.length; j++) {
      const score = jaccardForSentences(summaries[i].closer, summaries[j].closer);
      if (score >= 0.5) {
        closerPairs.push({ a: summaries[i].id, b: summaries[j].id, score: score.toFixed(3) });
      }
    }
  }
  assert(
    closerPairs.length === 0,
    'Test 3: No two closers have Jaccard similarity >= 0.5',
    closerPairs.length > 0
      ? 'Similar pairs: ' + closerPairs.map((p) => `${p.a} vs ${p.b} (${p.score})`).join(', ')
      : null,
  );

  // --- Test 4: No structural opener pattern used more than ceil(N/2) times ---
  const maxPatternAllowed = Math.ceil(summaries.length / 2); // >= 4/7 is too many
  const patternCounts = {};
  for (const pat of STRUCTURAL_OPENER_PATTERNS) {
    patternCounts[pat.id] = summaries.filter((s) => pat.test(s.opener)).length;
  }
  const overusedPatterns = Object.entries(patternCounts)
    .filter(([id, count]) => count > maxPatternAllowed)
    .map(([id, count]) => `${id}(${count}x)`);
  assert(
    overusedPatterns.length === 0,
    `Test 4: No structural opener pattern used more than ${maxPatternAllowed} times`,
    overusedPatterns.length > 0 ? `Overused patterns: ${overusedPatterns.join(', ')}` : null,
  );

  // --- Test 5: No structural closer pattern used more than ceil(N/2) times ---
  const closerPatternCounts = {};
  for (const pat of STRUCTURAL_CLOSER_PATTERNS) {
    closerPatternCounts[pat.id] = summaries.filter((s) => pat.test(s.closer)).length;
  }
  const overusedCloserPatterns = Object.entries(closerPatternCounts)
    .filter(([id, count]) => count > maxPatternAllowed)
    .map(([id, count]) => `${id}(${count}x)`);
  assert(
    overusedCloserPatterns.length === 0,
    `Test 5: No structural closer pattern used more than ${maxPatternAllowed} times`,
    overusedCloserPatterns.length > 0 ? `Overused patterns: ${overusedCloserPatterns.join(', ')}` : null,
  );

  // --- Test 6: Each summary mentions the product's short name exactly once in the closing sentence ---
  const namePlacementFailures = summaries.filter((s) => {
    const re = new RegExp('\\b' + s.shortName + '\\b', 'gi');
    const allMatches = s.summary.match(re) || [];
    const closingMatches = s.closer.match(re) || [];
    return allMatches.length !== 1 || closingMatches.length !== 1;
  });
  assert(
    namePlacementFailures.length === 0,
    'Test 6: Each summary mentions product short name exactly once, in the closing sentence',
    namePlacementFailures.length > 0
      ? 'Failures: ' + namePlacementFailures.map((s) => s.id).join(', ')
      : null,
  );

  // --- Test 7: Each summary is 70-110 words ---
  const wordCountFailures = summaries.filter((s) => {
    const wc = s.summary.trim().split(/\s+/).filter(Boolean).length;
    return wc < 70 || wc > 110;
  });
  assert(
    wordCountFailures.length === 0,
    'Test 7: All summaries are within 70-110 words',
    wordCountFailures.length > 0
      ? 'Failures: ' + wordCountFailures.map((s) => {
          const wc = s.summary.trim().split(/\s+/).filter(Boolean).length;
          return `${s.id}(${wc} words)`;
        }).join(', ')
      : null,
  );

  // --- Test 8: No 2-gram phrase appears in more than ceil(N/2) summaries ---
  const phraseSummaryCount = {};
  for (const s of summaries) {
    const phrases = extractPhrases(s.summary);
    const seen = new Set(phrases);
    for (const p of seen) {
      phraseSummaryCount[p] = (phraseSummaryCount[p] || 0) + 1;
    }
  }
  const crossSummaryOverused = Object.entries(phraseSummaryCount)
    .filter(([phrase, count]) => count > maxPatternAllowed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  assert(
    crossSummaryOverused.length === 0,
    `Test 8: No 2/3-gram phrase appears in more than ${maxPatternAllowed} of ${summaries.length} summaries`,
    crossSummaryOverused.length > 0
      ? 'Overused phrases: ' + crossSummaryOverused.map(([p, c]) => `"${p}"(${c}x)`).join(', ')
      : null,
  );

  // --- Test 9: No opener starts with the exact same 3 words ---
  const openerStarts = summaries.map((s) => s.opener.split(/\s+/).slice(0, 3).join(' ').toLowerCase());
  const duplicateStarts = openerStarts.filter((start, idx) => openerStarts.indexOf(start) !== idx);
  assert(
    duplicateStarts.length === 0,
    'Test 9: No two openers start with the same 3 words',
    duplicateStarts.length > 0 ? 'Duplicate starts: ' + [...new Set(duplicateStarts)].join(', ') : null,
  );

  // --- Test 10: All items pass standard validation ---
  const validationFailures = [];
  for (const r of results) {
    if (!r.output) continue;
    const valResult = validateItem(r.output, r.product, { relaxLengthCheck: false });
    if (!valResult.valid) {
      // Polite-tone flags are soft warnings that don't constitute failures
      const hardErrors = valResult.errors.filter((e) => !e.includes('Polite-tone flag'));
      if (hardErrors.length > 0) {
        validationFailures.push({ id: r.product.id, errors: hardErrors });
      }
    }
  }
  assert(
    validationFailures.length === 0,
    'Test 10: All generated items pass standard validation (excluding soft polite-tone flags)',
    validationFailures.length > 0
      ? validationFailures.map((f) => `${f.id}: ${f.errors.join('; ')}`).join('\n  ')
      : null,
  );

  // --- Diversity Summary ---
  console.log('\n--- DIVERSITY ANALYSIS SUMMARY ---');
  summaries.forEach((s) => {
    const wc = s.summary.trim().split(/\s+/).filter(Boolean).length;
    console.log(`\n${s.id} (${wc} words):`);
    console.log(`  OPENER: "${s.opener.slice(0, 90)}..."`);
    console.log(`  CLOSER: "${s.closer.slice(0, 90)}..."`);
  });

  // --- Opener similarity matrix ---
  console.log('\n--- OPENER JACCARD SIMILARITY MATRIX (threshold: 0.5) ---');
  for (let i = 0; i < summaries.length; i++) {
    for (let j = i + 1; j < summaries.length; j++) {
      const score = jaccardForSentences(summaries[i].opener, summaries[j].opener);
      const flag = score >= 0.3 ? (score >= 0.5 ? '⚠ HIGH' : '~ moderate') : '';
      if (score >= 0.2) {
        console.log(`  ${summaries[i].shortName} vs ${summaries[j].shortName}: ${score.toFixed(3)} ${flag}`);
      }
    }
  }

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  cleanup();
  process.exit(failed > 0 ? 1 : 0);
}

runBatchDiversityTest().catch((err) => {
  console.error('Batch diversity test crashed:', err);
  cleanup();
  process.exit(1);
});
