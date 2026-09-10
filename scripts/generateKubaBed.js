'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Pull LLM credentials
if (!process.env.LLM_API_KEY && fs.existsSync(path.join(__dirname, '..', '..', 'product-content-generator', '.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '..', 'product-content-generator', '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const { transformCatalogItemToProduct } = require('../app/helpers/ai-content/ai-attribute-transform.helper');
const { generateOne } = require('../app/helpers/ai-content/ai-orchestrator.helper');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');

async function main() {
  const productsPath = path.join(__dirname, '..', 'data', 'products.json');
  const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  // Find Kuba Bed
  const rawProduct = rawProducts.find((p) => p.product_short_name === 'Kuba') || rawProducts[5];

  console.log('----------------------------------------------------');
  console.log('SOURCE CATALOG PRODUCT (Urban Ladder / Fynd Catalog):');
  console.log(`Name: ${rawProduct.name}`);
  console.log(`Category: ${rawProduct.category} / ${rawProduct.subcategory}`);
  console.log(`Price: ₹${rawProduct.price}`);
  console.log(`Material: ${rawProduct.primary_material}`);
  console.log(`Design Details: ${rawProduct.design_details}`);
  console.log(`Dimensions: ${rawProduct.dimensions}`);
  console.log(`Warranty: ${rawProduct.warranty_months} months`);
  console.log('----------------------------------------------------\n');

  console.log('Transforming catalog item into normalized pipeline format...');
  const normalized = transformCatalogItemToProduct(rawProduct);

  console.log('Generating AI content via Gemini API...\n');
  const generated = await generateOne(normalized, null, 1, {
    company_id: 'sample_company',
    application_id: 'sample_app',
    rules: {},
  });

  console.log('====================================================');
  console.log('AI GENERATED CONTENT & SUMMARY:');
  console.log('====================================================\n');

  console.log('📌 DESCRIPTION SUMMARY:');
  console.log(generated.description?.summary);
  console.log('\n📌 KEY FEATURES (PROGRAMMATIC BULLETS):');
  (generated.description?.key_features || []).forEach((b) => console.log(`  • ${b}`));

  console.log('\n📌 SPECIFICATIONS (EXACT VERBATIM PASS-THROUGH):');
  console.log(JSON.stringify(generated.specifications, null, 2));

  console.log('\n📌 CARE & MAINTENANCE:');
  console.log('  Instructions:');
  (generated.care_and_maintenance?.instructions || []).forEach((i) => console.log(`    - ${i}`));
  console.log('  Avoid:');
  (generated.care_and_maintenance?.avoid || []).forEach((a) => console.log(`    - ${a}`));

  console.log('\n📌 WARRANTY:');
  console.log(`  Status: ${generated.warranty?.status_line}`);
  (generated.warranty?.points || []).forEach((p) => console.log(`    • ${p}`));

  console.log('\n📌 RETURNS POLICY:');
  console.log(`  Window: ${generated.returns?.window_days}`);
  (generated.returns?.condition || []).forEach((c) => console.log(`    - ${c}`));

  console.log('\n📌 QUALITY PROMISE:');
  console.log(`  Statement: ${generated.quality_promise?.statement}`);
  (generated.quality_promise?.highlights || []).forEach((h) => console.log(`    • ${h}`));

  console.log('\n====================================================');
  const validation = validateItem(generated, normalized);
  console.log(`VALIDATION RESULT: ${validation.valid ? '✅ VALID (PASSED ALL GATES)' : '❌ INVALID'}`);
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Error generating product content:', err);
  process.exit(1);
});
