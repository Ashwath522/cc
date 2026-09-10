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
  console.log(`RUNNING RUN 3 VERIFICATION (${products.length} products)`);
  console.log(`======================================================\n`);

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`[${i + 1}/${products.length}] Generating for "${p.name}" (ID: ${p.id})...`);

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

    console.log(`  -> Opener: "${opener}"`);
    console.log(`  -> Closer: "${closer}"\n`);

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n======================================================`);
  console.log(`RUN 3 VERIFICATION REPORT`);
  console.log(`======================================================\n`);

  // 1. Count anchor / anchor point / visual anchor in closers
  let anchorCount = 0;
  let anchorPointCount = 0;
  let visualAnchorCount = 0;

  for (const r of results) {
    const closerLower = r.closer.toLowerCase();
    if (closerLower.includes('visual anchor')) visualAnchorCount++;
    if (closerLower.includes('anchor point')) anchorPointCount++;
    if (/\banchor\b/i.test(closerLower)) anchorCount++;
  }

  console.log(`1. ANCHOR-WORD OCCURRENCE IN RUN 3 CLOSERS:`);
  console.log(`   - "anchor" (any standalone match): ${anchorCount} / 15`);
  console.log(`   - "anchor point": ${anchorPointCount} / 15`);
  console.log(`   - "visual anchor": ${visualAnchorCount} / 15`);
  console.log(`\nAll 15 Closers:`);
  results.forEach(r => {
    console.log(`   [${r.id}]: "${r.closer}"`);
  });

  // 2. Hanoi, Toledo, Cambry openers side-by-side
  console.log(`\n------------------------------------------------------`);
  console.log(`2. STRATEGY 2 OPENERS (Hanoi, Toledo, Cambry):`);
  const strat2Ids = ['ul-fnbdst12sq16417', 'ul-fnbdst12dq16437', 'ul-fnbdst62ho36225'];
  const strat2Results = results.filter(r => strat2Ids.includes(r.id));
  strat2Results.forEach(r => {
    console.log(`   - ${r.name} (${r.id}):\n     "${r.opener}"`);
  });

  // 3. Top 5 most frequent phrases in phraseFrequency.json
  console.log(`\n------------------------------------------------------`);
  console.log(`3. TOP 5 MOST FREQUENT PHRASES in data/phraseFrequency.json:`);
  const freqMap = loadPhraseFrequencies();
  const sortedPhrases = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedPhrases.slice(0, 5).forEach(([phrase, count], idx) => {
    console.log(`   ${idx + 1}. "${phrase}": ${count} occurrences`);
  });

  console.log(`\n(Next 5 for reference: ${sortedPhrases.slice(5, 10).map(([p, c]) => `"${p}" (${c})`).join(', ')})`);
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
