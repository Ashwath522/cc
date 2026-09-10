/**
 * Runner script to execute Role 1 -> Role 2 -> Role 3 for a specific subcategory.
 */
const { runRole1, runRole2, runRole3, SUBCATEGORY_CONFIGS } = require('../src/loopOrchestrator');

async function main() {
  const args = process.argv.slice(2);
  const subcategory = args[0] || 'Beds';
  const targetAccepted = parseInt(args[1] || '50', 10);

  console.log(`================================================================`);
  console.log(`STARTING 3-ROLE LOOP FOR: "${subcategory}" (Target: ${targetAccepted})`);
  console.log(`================================================================`);

  // Step 1: Role 1 (Fetch + Generate)
  const role1Report = await runRole1(subcategory, targetAccepted);

  // Step 2: Role 2 (Validator / Diagnostic)
  const role2Report = runRole2(subcategory);

  // Step 3: Role 3 (Rule Addition)
  const role3Report = runRole3(role2Report);

  console.log(`\n================================================================`);
  console.log(`SUMMARY REPORT FOR: "${subcategory}"`);
  console.log(`================================================================`);
  console.log(`- Subcategory: ${subcategory}`);
  console.log(`- Discovered URLs: ${role1Report.discoveredUrlsCount}`);
  console.log(`- Initial Accepted Records: ${role1Report.initialCount}`);
  console.log(`- Newly Generated: ${role1Report.newGeneratedCount}`);
  console.log(`- Total Accepted Count: ${role1Report.finalCount} / ${targetAccepted} ${role1Report.ceilingReached ? '(Ceiling reached: collection exhausted)' : ''}`);
  console.log(`- Dedup Skips: ${role1Report.dedupSkipsCount}`);
  console.log(`- Repetition Retries: ${role2Report.repetitionRetriesCount}`);
  console.log(`- Phrase Overuse Retries: ${role2Report.phraseOveruseRetriesCount}`);
  console.log(`- Repetition Flagged on Attempt 3: ${role2Report.repetitionFlaggedCount}`);
  console.log(`- Phrase Overuse Flagged on Attempt 3: ${role2Report.phraseOveruseFlaggedCount}`);
  console.log(`- Rules Added in Role 3: ${role3Report.length}`);
  role3Report.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.target}] ${r.rule || r.avoidItem}`);
  });
  console.log(`================================================================\n`);
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
