const fs = require('fs');
const path = require('path');
const { generateOne, loadPriceBands } = require('../src/generate');
const { loadOpeners, OPENERS_PATH } = require('../src/openerStore');

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

async function runBatch(products, batchLabel) {
  const priceBands = loadPriceBands();
  const results = [];

  console.log(`\n======================================================`);
  console.log(`RUNNING ${batchLabel} (${products.length} products)`);
  console.log(`======================================================`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/${products.length}] Processing "${p.name}" (ID: ${p.id})...`);

    const item = await generateOne(p, priceBands);
    const history = item._meta?.attempt_history || [];
    const attempts = history.length || 1;
    const repetitionRetry = history.some(h => h.repetition_failed || (h.errors && h.errors.some(e => e.includes('REPETITION FIX'))));
    const repetitionFlagged = Boolean(item._meta?.repetition_flagged);

    const summary = item.description?.summary || '';
    const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || (summary.trim() ? [summary.trim()] : []);
    const opener = sentences[0] || '';
    const closer = sentences.length > 0 ? sentences[sentences.length - 1] : '';

    results.push({
      index: i + 1,
      id: p.id,
      name: p.name,
      attempts,
      repetitionRetry,
      repetitionFlagged,
      opener,
      closer
    });

    console.log(`  -> Attempts: ${attempts} | Repetition retry triggered: ${repetitionRetry} | Flagged: ${repetitionFlagged}`);
    console.log(`  -> Opener: "${opener}"`);
    console.log(`  -> Closer: "${closer}"`);

    // Brief delay between calls to respect rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}

async function main() {
  const products = get15RealProducts();
  console.log(`Selected ${products.length} real products for verification.`);

  // 1. Delete data/generatedOpeners.jsonl if exists
  if (fs.existsSync(OPENERS_PATH)) {
    fs.unlinkSync(OPENERS_PATH);
    console.log(`Deleted existing ${OPENERS_PATH} to start clean.`);
  }

  // 2 & 3. Run Batch 1
  const batch1Results = await runBatch(products, 'BATCH 1 (FRESH RUN)');

  // 4. Confirm data/generatedOpeners.jsonl lines
  const linesAfterBatch1 = loadOpeners();
  console.log(`\n======================================================`);
  console.log(`BATCH 1 PERSISTENCE CHECK`);
  console.log(`======================================================`);
  console.log(`data/generatedOpeners.jsonl contains ${linesAfterBatch1.length} lines.`);

  // 5. Re-run the SAME 15 products a second time
  const batch2Results = await runBatch(products, 'BATCH 2 (PERSISTED STORE RETEST)');

  // Summary Report
  console.log(`\n======================================================`);
  console.log(`FINAL VERIFICATION COMPARISON`);
  console.log(`======================================================\n`);

  console.log(`BATCH 1 RESULTS (Fresh start):`);
  console.table(batch1Results.map(r => ({
    '#': r.index,
    'ID': r.id,
    'Attempts': r.attempts,
    'Repetition Retry': r.repetitionRetry,
    'Flagged': r.repetitionFlagged,
    'Opener': r.opener.slice(0, 50) + '...',
    'Closer': r.closer.slice(0, 50) + '...'
  })));

  console.log(`\nBATCH 2 RESULTS (Re-run against persisted openers):`);
  console.table(batch2Results.map(r => ({
    '#': r.index,
    'ID': r.id,
    'Attempts': r.attempts,
    'Repetition Retry': r.repetitionRetry,
    'Flagged': r.repetitionFlagged,
    'Opener': r.opener.slice(0, 50) + '...',
    'Closer': r.closer.slice(0, 50) + '...'
  })));

  const finalLines = loadOpeners();
  console.log(`\nFinal data/generatedOpeners.jsonl count: ${finalLines.length} lines.`);
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
