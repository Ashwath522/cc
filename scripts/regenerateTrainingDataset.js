'use strict';

/**
 * Master Execution Script: Full Training Dataset Regeneration
 */

const { regenerateFullDataset } = require('../app/helpers/ai-content/agents/dataset-generator.service');

async function main() {
  console.log('================================================================');
  console.log('🚀 MASTER PIPELINE: REGENERATING TRAINING DATASET WITH MULTI-AGENT');
  console.log('================================================================\n');

  const startTime = Date.now();
  const res = await regenerateFullDataset();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n================================================================`);
  console.log(`🏁 REGENERATION COMPLETED IN ${duration}s`);
  console.log(`Quality Gate Passed: ${res.success ? '✔ YES (100%)' : '✖ NO'}`);
  console.log(`Total Products: ${res.totalGenerated} | Passed: ${res.totalPassed} | Failed: ${res.totalFailed}`);
  console.log(`================================================================\n`);

  console.log('Category Breakdown:');
  for (const [cat, data] of Object.entries(res.categoryResults)) {
    console.log(`  - ${cat}: ${data.total_products} items (Passed: ${data.passed}, Unique Openers: ${data.unique_openers}, Reuse: ${data.opener_reuse_rate})`);
  }

  console.log(`\nReports generated at:`);
  console.log(`  JSON: ${res.reportJsonPath}`);
  console.log(`  Markdown: ${res.reportMdPath}`);

  if (!res.success) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during regeneration:', err);
  process.exit(1);
});
