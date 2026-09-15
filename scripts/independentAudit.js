'use strict';

/**
 * Standalone Independent Quality & Repetition Auditor
 * Performs strict, independent auditing of all active training JSONL files.
 * This script is completely decoupled from generation agents.
 */

const fs = require('fs');
const path = require('path');

const TRAINING_DIR = path.join(__dirname, '../data/trainingSet');

const BANNED_PATTERNS = [
  /\btraditional\s+joinery\b/i,
  /\bmortise[- ]and[- ]tenon\b/i,
  /\bkiln[- ]dried\b/i,
  /\bprecision[- ]milled\b/i,
  /\bgas[- ]assist\s+struts?\b/i,
  /\bgas\s+lift\s+pistons?\b/i,
  /\bcorner\s+bracing\b/i,
  /\bdrawer\s+dividers?\b/i,
  /\bspinal\s+support\b/i,
  /\bpostural\s+alignment\b/i,
  /\banti[- ]scratch\b/i,
  /\bmoisture[- ]resistant\b/i,
  /\bnon[- ]porous\b/i,
  /\bwobble[- ]free\b/i,
  /\benduring\s+density\b/i,
  /\bdependable\s+stability\b/i,
  /\b(?:effortless|smooth)\s+hydraulic\s+lift\b/i,
  /\b(?:rigid|unwavering)\s+mattress\s+support\b/i,
  /\bambient\s+dust\b/i,
  /\bwipe[- ]clean\b/i,
];

function extractSentences(text) {
  if (!text) return [];
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [text.trim()];
}

function extractNgrams(text, n = 4) {
  if (!text) return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function runIndependentAudit() {
  console.log('========================================================================');
  console.log('🔍 INDEPENDENT STANDALONE DATASET AUDIT');
  console.log('========================================================================\n');

  const files = fs.readdirSync(TRAINING_DIR).filter((f) => f.endsWith('.jsonl') && !f.includes('_enriched') && !f.includes('.bak'));

  let totalRecords = 0;
  let allSummaries = [];
  let allSentences = [];
  let allOpeners = [];
  let allClosers = [];
  let ungroundedViolations = [];
  let exactDuplicateSummaries = 0;
  let exactDuplicateSentences = 0;

  const fourGramFreq = {};
  const fiveGramFreq = {};

  for (const f of files) {
    const filePath = path.join(TRAINING_DIR, f);
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n').filter(Boolean);
    console.log(`Auditing file: ${f} (${lines.length} records)`);

    for (let i = 0; i < lines.length; i++) {
      try {
        const item = JSON.parse(lines[i]);
        totalRecords++;
        const summary = item.output?.description?.summary || '';
        const id = item.input?.id || `item_${i}`;

        // Check ungrounded claims
        for (const bp of BANNED_PATTERNS) {
          if (bp.test(summary)) {
            ungroundedViolations.push({ id, file: f, pattern: bp.toString(), summary: summary.slice(0, 80) });
          }
        }

        const sents = extractSentences(summary);
        if (sents.length > 0) {
          allOpeners.push({ id, opener: sents[0] });
          allClosers.push({ id, closer: sents[sents.length - 1] });
        }

        for (const s of sents) {
          allSentences.push({ id, sentence: s.toLowerCase() });
        }

        allSummaries.push({ id, summary: summary.toLowerCase() });

        // N-grams
        const fg = extractNgrams(summary, 4);
        for (const g of fg) {
          fourGramFreq[g] = (fourGramFreq[g] || 0) + 1;
        }

        const fiveG = extractNgrams(summary, 5);
        for (const g of fiveG) {
          fiveGramFreq[g] = (fiveGramFreq[g] || 0) + 1;
        }
      } catch (err) {
        console.error(`Error parsing line ${i} in ${f}:`, err.message);
      }
    }
  }

  // 1. Check Exact Duplicate Summaries
  const summaryMap = {};
  for (const s of allSummaries) {
    if (summaryMap[s.summary]) {
      exactDuplicateSummaries++;
    } else {
      summaryMap[s.summary] = s.id;
    }
  }

  // 2. Check Exact Duplicate Sentences across different products
  const sentenceMap = {};
  const duplicateSentenceDetails = [];
  for (const s of allSentences) {
    if (sentenceMap[s.sentence] && sentenceMap[s.sentence] !== s.id) {
      exactDuplicateSentences++;
      duplicateSentenceDetails.push({ sentence: s.sentence, productA: sentenceMap[s.sentence], productB: s.id });
    } else {
      sentenceMap[s.sentence] = s.id;
    }
  }

  // 3. Check Opener Uniqueness
  const uniqueOpeners = new Set(allOpeners.map((o) => o.opener)).size;
  const uniqueClosers = new Set(allClosers.map((c) => c.closer)).size;

  // 4. Repeated 4-grams (appearing > 3 times)
  const overused4Grams = Object.entries(fourGramFreq)
    .filter(([g, count]) => count > 3 && !/\b(available in|warranty of|care and maintenance|product short name)\b/i.test(g))
    .sort((a, b) => b[1] - a[1]);

  console.log('\n========================================================================');
  console.log('📊 AUDIT RESULTS SUMMARY:');
  console.log('========================================================================');
  console.log(`Total Records Audited:           ${totalRecords}`);
  console.log(`Exact Duplicate Summaries:       ${exactDuplicateSummaries}`);
  console.log(`Exact Duplicate Sentences:       ${exactDuplicateSentences}`);
  console.log(`Unique Openers:                  ${uniqueOpeners} / ${allOpeners.length}`);
  console.log(`Unique Closers:                  ${uniqueClosers} / ${allClosers.length}`);
  console.log(`Ungrounded Claim Violations:     ${ungroundedViolations.length}`);
  console.log(`Overused 4-Grams (>3 items):     ${overused4Grams.length}`);

  if (duplicateSentenceDetails.length > 0) {
    console.log('\nTop Duplicate Sentences Detected:');
    duplicateSentenceDetails.slice(0, 5).forEach((d) => {
      console.log(`  - "${d.sentence}" (Found in ${d.productA} & ${d.productB})`);
    });
  }

  if (ungroundedViolations.length > 0) {
    console.log('\nUngrounded Claims Detected:');
    ungroundedViolations.slice(0, 5).forEach((v) => {
      console.log(`  - [${v.file}] Product ${v.id}: Matched ${v.pattern}`);
    });
  }

  const pass = exactDuplicateSummaries === 0 &&
    exactDuplicateSentences === 0 &&
    ungroundedViolations.length === 0;

  console.log('\n========================================================================');
  console.log(`AUDIT VERDICT: ${pass ? '✔ PASS (100% CLEAN)' : '✖ FAIL (REPETITION/GROUNDING ERRORS DETECTED)'}`);
  console.log('========================================================================\n');

  return {
    pass,
    totalRecords,
    exactDuplicateSummaries,
    exactDuplicateSentences,
    uniqueOpeners,
    uniqueClosers,
    ungroundedViolations: ungroundedViolations.length,
    overused4Grams: overused4Grams.length,
  };
}

if (require.main === module) {
  const res = runIndependentAudit();
  if (!res.pass) {
    process.exit(1);
  }
}

module.exports = {
  runIndependentAudit,
};
