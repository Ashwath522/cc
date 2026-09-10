const fs = require('fs');
const path = require('path');
const { generateOne, loadPriceBands } = require('../src/generate');
const { validateItem } = require('../src/validator');

function getProducts() {
  const categories = [
    { name: 'Beds', file: 'beds_generated.jsonl' },
    { name: 'Mattresses', file: 'mattresses_generated.jsonl' },
    { name: 'Bedroom Storage', file: 'bedroom_storage_generated.jsonl' }
  ];

  const selected = [];

  for (const cat of categories) {
    const filePath = path.join(__dirname, '..', 'data', 'trainingSet', cat.file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n').filter(Boolean);
    const catProducts = [];
    for (const line of lines) {
      if (catProducts.length >= 10) break;
      const parsed = JSON.parse(line);
      const spec = parsed.input;
      catProducts.push(spec);
    }
    selected.push({ category: cat.name, products: catProducts });
  }

  return selected;
}

async function main() {
  const priceBands = loadPriceBands();
  const groups = getProducts();
  const allResults = [];

  console.log('======================================================');
  console.log('STARTING VERIFICATION RUN: 30 PRODUCTS (10 Beds, 10 Mattresses, 10 Bedroom Storage)');
  console.log('======================================================\n');

  for (const group of groups) {
    console.log(`\n>>> Processing Subcategory: ${group.category} (${group.products.length} products) <<<`);
    for (let i = 0; i < group.products.length; i++) {
      const p = group.products[i];
      console.log(`[${group.category} ${i + 1}/${group.products.length}] Generating for "${p.name}" (ID: ${p.id})...`);

      const item = await generateOne(p, priceBands);
      const summary = item.description?.summary || '';
      const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || (summary.trim() ? [summary.trim()] : []);
      const opener = sentences[0] || '';
      const closer = sentences.length > 0 ? sentences[sentences.length - 1] : '';

      // Check name position
      const shortName = p.product_short_name || p.name.split(' ')[0];
      const escapedShortName = shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const closingRegex = new RegExp(`\\b${escapedShortName}\\b`, 'i');
      const nameInCloser = closingRegex.test(closer);

      // Check forbidden phrases in summary
      const lowerSummary = summary.toLowerCase();
      const hasServesAs = lowerSummary.includes('serves as');
      const hasTuckedAway = lowerSummary.includes('tucked away') || lowerSummary.includes('tuck away');

      // Check material leakage in opener
      const rawMaterialLeakage = /^(engineered wood|sheesham wood|particle board|solid wood|latex|coir|mdf|foam|bonnell spring|pocket spring)/i.test(opener);

      // Check validation
      const valResult = validateItem(item, p);

      const res = {
        category: group.category,
        id: p.id,
        name: p.name,
        shortName,
        primaryMaterial: p.primary_material,
        opener,
        closer,
        summary,
        nameInCloser,
        hasServesAs,
        hasTuckedAway,
        rawMaterialLeakage,
        valid: valResult.valid,
        errors: valResult.errors,
        attempts: item._meta?.attempt_history?.length || 1
      };

      allResults.push(res);
      console.log(`  -> Opener: "${opener}"`);
      console.log(`  -> Closer: "${closer}"`);
      console.log(`  -> Name in closer: ${nameInCloser} | Serves as: ${hasServesAs} | Tucked away: ${hasTuckedAway} | Material leakage: ${rawMaterialLeakage}`);
      console.log(`  -> Valid: ${valResult.valid} (Attempts: ${res.attempts})\n`);

      // Gentle delay between API calls
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n======================================================');
  console.log('FINAL VERIFICATION RESULTS SUMMARY (30 PRODUCTS)');
  console.log('======================================================\n');

  const total = allResults.length;
  const namePassCount = allResults.filter(r => r.nameInCloser).length;
  const servesAsCount = allResults.filter(r => r.hasServesAs).length;
  const tuckedAwayCount = allResults.filter(r => r.hasTuckedAway).length;
  const leakageCount = allResults.filter(r => r.rawMaterialLeakage).length;
  const validCount = allResults.filter(r => r.valid).length;

  console.log(`1. NAME-IN-CLOSING-SENTENCE PASS RATE: ${namePassCount}/${total} (${((namePassCount/total)*100).toFixed(1)}%)`);
  console.log(`2. 'SERVES AS' OCCURRENCES: ${servesAsCount} (Target: 0)`);
  console.log(`3. 'TUCKED AWAY' OCCURRENCES: ${tuckedAwayCount} (Target: 0)`);
  console.log(`4. MOOD-LINE MATERIAL LEAKAGE: ${leakageCount} (Target: 0)`);
  console.log(`5. OVERALL VALIDATION PASS RATE: ${validCount}/${total} (${((validCount/total)*100).toFixed(1)}%)`);

  console.log('\n--- ALL 30 OPENERS & CLOSERS ---');
  allResults.forEach((r, idx) => {
    console.log(`\n[${idx + 1}/30] [${r.category}] ${r.name}`);
    console.log(`   Short Name: "${r.shortName}"`);
    console.log(`   OPENER: "${r.opener}"`);
    console.log(`   CLOSER: "${r.closer}"`);
  });

  fs.writeFileSync(path.join(__dirname, '..', 'output', 'verification_results_30.json'), JSON.stringify(allResults, null, 2));
  console.log('\nSaved detailed output to output/verification_results_30.json');
}

main().catch(err => {
  console.error('Fatal error in verification:', err);
  process.exit(1);
});
