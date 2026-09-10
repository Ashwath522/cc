const fs = require('fs');
const path = require('path');
const { generateOne, loadPriceBands } = require('../src/generate');
const { loadOpeners, loadPhraseFrequencies, PHRASE_FREQ_PATH } = require('../src/openerStore');

// Load 15 real products from products.json and trainingSet/beds_generated.jsonl
function get15RealProducts() {
  const products = [];
  const p1Path = path.join(__dirname, '..', 'data', 'products.json');
  if (fs.existsSync(p1Path)) {
    const list1 = JSON.parse(fs.readFileSync(p1Path, 'utf-8'));
    products.push(...list1);
  }

  const bedsPath = path.join(__dirname, '..', 'data', 'trainingSet', 'beds_generated.jsonl');
  if (fs.existsSync(bedsPath)) {
    const bedLines = fs.readFileSync(bedsPath, 'utf-8').trim().split('\n').filter(Boolean);
    for (const line of bedLines) {
      if (products.length >= 15) break;
      const parsed = JSON.parse(line);
      const spec = parsed.input;
      if (!products.some(p => p.id === spec.id)) {
        products.push(spec);
      }
    }
  }

  return products.slice(0, 15);
}

async function main() {
  const products = get15RealProducts();
  const priceBands = loadPriceBands();
  const results = [];

  console.log(`======================================================`);
  console.log(`RUNNING RUN 4 VERIFICATION (${products.length} products)`);
  console.log(`======================================================\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] Generating for "${p.name}" (ID: ${p.id})...`);

    const item = await generateOne(p, priceBands);
    const history = item._meta?.attempt_history || [];
    const attempts = history.length || 1;
    const repetitionRetry = history.some(h => h.repetition_failed || (h.errors && h.errors.some(e => e.includes('REPETITION FIX'))));
    const phraseRetry = history.some(h => h.phrase_overuse_failed || (h.errors && h.errors.some(e => e.includes('OVERUSED PHRASE'))));
    const repetitionFlagged = Boolean(item._meta?.repetition_flagged);
    const phraseOveruseFlagged = Boolean(item._meta?.phrase_overuse_flagged);

    const summary = item.description?.summary || '';
    const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || (summary.trim() ? [summary.trim()] : []);
    const opener = sentences[0] || '';
    const closer = sentences.length > 0 ? sentences[sentences.length - 1] : '';

    results.push({
      index: i + 1,
      id: p.id,
      name: p.name,
      attempts,
      history,
      repetitionRetry,
      phraseRetry,
      repetitionFlagged,
      phraseOveruseFlagged,
      overusedPhrases: item._meta?.overused_phrases || [],
      opener,
      closer
    });

    console.log(`  -> Final Attempts: ${attempts}`);
    console.log(`  -> Opener: "${opener}"`);
    console.log(`  -> Closer: "${closer}"\n`);

    await new Promise(r => setTimeout(r, 2500));
  }

  console.log(`\n======================================================`);
  console.log(`RUN 4 VERIFICATION REPORT`);
  console.log(`======================================================\n`);

  // 1. Any retry triggered by phrase frequency specifically
  console.log(`1. RETRIES TRIGGERED BY PHRASE-FREQUENCY CHECK:`);
  let phraseRetryCount = 0;
  for (const r of results) {
    const phraseRetries = r.history.filter(h => h.phrase_overuse_failed || (h.errors && h.errors.some(e => e.includes('OVERUSED PHRASE'))));
    if (phraseRetries.length > 0) {
      phraseRetryCount++;
      console.log(`   - Product: "${r.name}" (${r.id})`);
      phraseRetries.forEach(h => {
        const overusedErrors = (h.errors || []).filter(e => e.includes('OVERUSED PHRASE'));
        console.log(`     Attempt ${h.attempt} triggered retry with errors:\n       * ${overusedErrors.join('\n       * ')}`);
      });
      console.log(`     Corrected on Attempt: ${r.attempts} (${r.phraseOveruseFlagged ? 'FLAGGED on attempt 3' : 'SUCCESSFULLY RESOLVED'})\n`);
    }
  }
  if (phraseRetryCount === 0) {
    console.log(`   No retries were triggered by phrase-frequency (or model avoided overused phrases on attempt 1).`);
  }

  // 2. Target phrases check
  console.log(`\n------------------------------------------------------`);
  console.log(`2. TARGET PHRASES AUDIT IN NEW OPENERS/CLOSERS:`);
  const targetPhrases = ['tuck away', 'floor space', 'your nightly routine', 'walnut finish'];
  for (const target of targetPhrases) {
    const matches = [];
    for (const r of results) {
      const openerLower = r.opener.toLowerCase();
      const closerLower = r.closer.toLowerCase();
      if (openerLower.includes(target) || closerLower.includes(target)) {
        matches.push({ id: r.id, name: r.name, opener: r.opener, closer: r.closer });
      }
    }
    console.log(`   - "${target}": ${matches.length} matches across all 15 openers/closers`);
    if (matches.length > 0) {
      matches.forEach(m => {
        console.log(`     * Found in [${m.id}] ${m.name}`);
      });
    }
  }

  // 3. Jaccard similarity check audit
  console.log(`\n------------------------------------------------------`);
  console.log(`3. JACCARD SIMILARITY CHECK AUDIT:`);
  let jaccardRetryCount = 0;
  for (const r of results) {
    const jaccardRetries = r.history.filter(h => h.repetition_failed || (h.errors && h.errors.some(e => e.includes('REPETITION FIX'))));
    if (jaccardRetries.length > 0) {
      jaccardRetryCount++;
      console.log(`   - Product: "${r.name}" (${r.id}) triggered Jaccard retry on attempt(s): ${jaccardRetries.map(j => j.attempt).join(', ')}`);
    }
  }
  console.log(`   Total Jaccard retries triggered in Run 4: ${jaccardRetryCount}`);

  // 4. Complete list of all 15 openers and closers
  console.log(`\n------------------------------------------------------`);
  console.log(`4. ALL 15 OPENERS AND CLOSERS (RUN 4):`);
  results.forEach(r => {
    console.log(`\n[${r.index}/15] ${r.name} (${r.id}) - ${r.attempts} attempt(s)`);
    console.log(`   OPENER: "${r.opener}"`);
    console.log(`   CLOSER: "${r.closer}"`);
    if (r.repetitionFlagged) console.log(`   [FLAGGED: repetition]`);
    if (r.phraseOveruseFlagged) console.log(`   [FLAGGED: phrase overuse: ${JSON.stringify(r.overusedPhrases)}]`);
  });

  // 5. Full retry log
  console.log(`\n------------------------------------------------------`);
  console.log(`5. COMPLETE RETRY LOG:`);
  let anyRetries = false;
  results.forEach(r => {
    if (r.history.length > 1) {
      anyRetries = true;
      console.log(`\nProduct: ${r.name} (${r.id}) - Total attempts: ${r.attempts}`);
      r.history.forEach((h, idx) => {
        console.log(`  Attempt ${h.attempt}: ${h.valid ? 'Valid JSON' : 'Invalid JSON'}, Repetition Failed: ${!!h.repetition_failed}, Phrase Overuse Failed: ${!!h.phrase_overuse_failed}`);
        if (h.errors && h.errors.length > 0) {
          console.log(`  Errors:`);
          h.errors.forEach(e => console.log(`    - ${e}`));
        }
      });
    }
  });
  if (!anyRetries) {
    console.log(`   No retries across any product in Run 4.`);
  }

  // Save results to scratch
  fs.writeFileSync(path.join(__dirname, '..', 'run4_results.json'), JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
