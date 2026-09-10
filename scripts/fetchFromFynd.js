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

const config = require('../app/common/config');
const { getProductsByCategoryPaginated } = require('../app/routes/services/product.service');
const { transformCatalogItemToProduct } = require('../app/helpers/ai-content/ai-attribute-transform.helper');
const { generateOne } = require('../app/helpers/ai-content/ai-orchestrator.helper');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');

async function main() {
  const companyId = config.SALES_CHANNEL?.company_id || '95';
  console.log(`Connecting to Fynd Platform for company_id: ${companyId}...`);

  try {
    const response = await getProductsByCategoryPaginated({
      companyId,
      pageSize: 5,
      pageId: '*',
    });

    console.log(`Fetched ${response.items?.length || 0} products from Fynd catalog API.`);
    if (!response.items || !response.items.length) {
      console.log('No products returned from live Fynd catalog for this company ID.');
      return;
    }

    const liveProductRaw = response.items[0];
    console.log('\n--- LIVE FYND PRODUCT ---');
    console.log('Name:', liveProductRaw.name || liveProductRaw.title);
    console.log('Item Code / UID:', liveProductRaw.item_code || liveProductRaw.uid);
    console.log('Category:', liveProductRaw.category_slug || liveProductRaw.category);
    console.log('Price:', liveProductRaw.price);

    console.log('\nTransforming raw Fynd catalog item...');
    const product = transformCatalogItemToProduct(liveProductRaw);

    console.log('Generating AI Content & Summary...\n');
    const generated = await generateOne(product, null, 1, {
      company_id: companyId,
      application_id: config.SALES_CHANNEL?.application_id || 'sample_app',
      rules: {},
    });

    console.log('====================================================');
    console.log('GENERATED SUMMARY FOR LIVE PRODUCT:');
    console.log('====================================================');
    console.log('📌 SUMMARY:');
    console.log(generated.description?.summary);
    console.log('\n📌 KEY FEATURES:');
    (generated.description?.key_features || []).forEach((b) => console.log(`  • ${b}`));
    console.log('\n📌 CARE & MAINTENANCE:');
    (generated.care_and_maintenance?.instructions || []).forEach((i) => console.log(`  - ${i}`));

    const validation = validateItem(generated, product);
    console.log(`\nVALIDATION: ${validation.valid ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (err) {
    console.error('Fynd fetch failed:', err.message);
  }
}

main();
