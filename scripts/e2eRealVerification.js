'use strict';

const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:8080/api/v1';
const MONGO_URI = 'mongodb://127.0.0.1:27017/content-x';

const COMPANY_ID = '95';
const APPLICATION_ID = '65eb1972926345654bc9c1a8';
const HEADERS = {
  'x-company-id': COMPANY_ID,
  'x-application-id': APPLICATION_ID,
  'Content-Type': 'application/json',
};

function decomposeSummary(summary = '') {
  const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [summary.trim()];
  return {
    mood: sentences[0] || '',
    intro: sentences[1] || '',
    story: sentences.length > 3 ? sentences.slice(2, -1).join(' ') : (sentences[2] || ''),
    close: sentences.length > 2 ? sentences[sentences.length - 1] : '',
  };
}

async function runRealVerification() {
  console.log('================================================================');
  console.log('  STARTING REAL END-TO-END VERIFICATION (Live Server, Mongo & Redis)');
  console.log('================================================================\n');

  const results = [];

  // Connect directly to Mongo to inspect underlying documents
  const mongoConn = await mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).asPromise();
  const db = mongoConn.db;

  let jobId = null;
  let previewItemsStep1 = [];
  let previewItemsStep2 = [];

  // -------------------------------------------------------------------------
  // STEP 1: Start a job and preview
  // -------------------------------------------------------------------------
  console.log('--- STEP 1: Start a job and preview ---');
  try {
    const jobCreateRes = await axios.post(
      `${BASE_URL}/ai-content/jobs`,
      {
        category: 'Beds',
        category_ids: ['Beds'],
        selected_tone: 'auto',
      },
      { headers: HEADERS },
    );
    jobId = jobCreateRes.data?.job?._id;
    console.log(`[Step 1] Created Job ID: ${jobId}, HTTP Status: ${jobCreateRes.status}`);

    const previewRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/preview`,
      { tone: 'auto', count: 3 },
      { headers: HEADERS },
    );
    console.log(`[Step 1] Preview Response Status: ${previewRes.status}`);

    previewItemsStep1 = previewRes.data?.preview_items || [];
    const jobInDb = await db.collection('aicontentjobs').findOne({ _id: new mongoose.Types.ObjectId(jobId) });

    const step1Pass =
      jobCreateRes.status === 201 &&
      previewRes.status === 200 &&
      jobInDb &&
      jobInDb.status?.toLowerCase() === 'preview' &&
      previewItemsStep1.length === 3 &&
      previewItemsStep1.every((item) => {
        const d = decomposeSummary(item.generated_content?.description?.summary);
        const bullets = item.generated_content?.description?.key_features || [];
        return d.mood && d.intro && d.story && d.close && bullets.length > 0;
      });

    console.log(`[Step 1] Configured preview count: 3 items.`);
    console.log(`[Step 1] Mongo status: ${jobInDb?.status}`);
    console.log(`[Step 1] First Product Name: ${previewItemsStep1[0]?.source_product?.name}`);
    console.log(`[Step 1] 5 Parts on Item 1:`);
    const parts1 = decomposeSummary(previewItemsStep1[0]?.generated_content?.description?.summary);
    console.log(`   1. Mood Line: "${parts1.mood}"`);
    console.log(`   2. Intro:     "${parts1.intro}"`);
    console.log(`   3. Story:     "${parts1.story}"`);
    console.log(`   4. Close:     "${parts1.close}"`);
    console.log(`   5. Bullets:   ${previewItemsStep1[0]?.generated_content?.description?.key_features?.length} items`);

    results.push({
      step: 1,
      name: 'Start a job and preview',
      pass: step1Pass,
      details: {
        request: { method: 'POST', path: `/ai-content/jobs/${jobId}/preview`, body: { tone: 'auto', count: 3 } },
        response: { status: previewRes.status, count: previewItemsStep1.length },
        dbStatus: jobInDb?.status,
      },
    });
  } catch (err) {
    console.error(`[Step 1] FAILED:`, err.message);
    results.push({ step: 1, name: 'Start a job and preview', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 2: Tone button and selection
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 2: Tone button and selection ---');
  try {
    const tonesRes = await axios.get(`${BASE_URL}/ai-content/tones`, { headers: HEADERS });
    console.log(`[Step 2] GET /ai-content/tones returned ${tonesRes.data?.tones?.length} presets.`);
    const toneIds = (tonesRes.data?.tones || []).map((t) => t.id);
    console.log(`[Step 2] Preset IDs: ${toneIds.join(', ')}`);

    const rePreviewRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/preview`,
      { tone: 'playful_casual', count: 3 },
      { headers: HEADERS },
    );
    previewItemsStep2 = rePreviewRes.data?.preview_items || [];

    // Verify SAME 3 preview products regenerate
    const sameProducts =
      previewItemsStep1.length === previewItemsStep2.length &&
      previewItemsStep1.every((item, i) => item.source_product?.id === previewItemsStep2[i]?.source_product?.id);

    // Verify register visibly changes
    const text1 = previewItemsStep1[0]?.generated_content?.description?.summary || '';
    const text2 = previewItemsStep2[0]?.generated_content?.description?.summary || '';
    const registerChanged = text1 !== text2 && (text2.toLowerCase().includes('breezy') || text2.toLowerCase().includes('playful') || text2.toLowerCase().includes('sunny'));

    console.log(`[Step 2] Same 3 products: ${sameProducts}`);
    console.log(`[Step 2] Auto Summary: "${text1}"`);
    console.log(`[Step 2] Playful Summary: "${text2}"`);
    console.log(`[Step 2] Register visibly changed: ${registerChanged}`);

    const step2Pass = tonesRes.data?.tones?.length === 5 && sameProducts && registerChanged;
    results.push({
      step: 2,
      name: 'Tone button and selection',
      pass: step2Pass,
      details: {
        presetCount: tonesRes.data?.tones?.length,
        sameProducts,
        registerChanged,
        playfulSummary: text2,
      },
    });
  } catch (err) {
    console.error(`[Step 2] FAILED:`, err.message);
    results.push({ step: 2, name: 'Tone button and selection', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 3: View and edit the tone's rule text
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 3: View and edit the tone\'s rule text ---');
  try {
    const toneGetRes = await axios.get(`${BASE_URL}/ai-content/tones/playful_casual`, { headers: HEADERS });
    const originalRuleText = toneGetRes.data?.tone?.rule_text;
    console.log(`[Step 3] Original rule_text: "${originalRuleText}"`);

    const editedRuleText = `${originalRuleText} Always mention the word 'sanctuary' at least once.`;
    const tonePutRes = await axios.put(
      `${BASE_URL}/ai-content/tones/playful_casual`,
      { rule_text: editedRuleText },
      { headers: HEADERS },
    );
    console.log(`[Step 3] PUT Status: ${tonePutRes.status}`);

    const storedDoc = await db.collection('toneoverrides').findOne({
      company_id: COMPANY_ID,
      application_id: APPLICATION_ID,
      tone_id: 'playful_casual',
    });

    const byteMatch = storedDoc && storedDoc.rule_text === editedRuleText;
    console.log(`[Step 3] Stored in Mongo rule_text byte-for-byte match: ${byteMatch}`);

    const step3Pass = tonePutRes.status === 200 && byteMatch;
    results.push({
      step: 3,
      name: 'View and edit the tone\'s rule text',
      pass: step3Pass,
      details: {
        putStatus: tonePutRes.status,
        byteMatch,
        editedRuleText,
      },
    });
  } catch (err) {
    console.error(`[Step 3] FAILED:`, err.message);
    results.push({ step: 3, name: 'View and edit the tone\'s rule text', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 4: Regenerate and confirm the edit took effect
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 4: Regenerate and confirm the edit took effect ---');
  try {
    const editedPreviewRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/preview`,
      { tone: 'playful_casual', count: 3 },
      { headers: HEADERS },
    );
    const editedItems = editedPreviewRes.data?.preview_items || [];
    const summary = editedItems[0]?.generated_content?.description?.summary || '';
    const containsSanctuary = summary.toLowerCase().includes('sanctuary');

    console.log(`[Step 4] Summary with edited tone: "${summary}"`);
    console.log(`[Step 4] Contains 'sanctuary': ${containsSanctuary}`);

    const step4Pass = containsSanctuary;
    results.push({
      step: 4,
      name: 'Regenerate and confirm the edit took effect',
      pass: step4Pass,
      details: {
        containsSanctuary,
        summary,
      },
    });
  } catch (err) {
    console.error(`[Step 4] FAILED:`, err.message);
    results.push({ step: 4, name: 'Regenerate and confirm the edit took effect', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 5: Confirm boundaries still hold under a real edit
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 5: Confirm boundaries still hold under a real edit ---');
  try {
    const previewRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/preview`,
      { tone: 'playful_casual', count: 3 },
      { headers: HEADERS },
    );
    const item = previewRes.data?.preview_items?.[0];
    const summary = item?.generated_content?.description?.summary || '';
    const bullets = item?.generated_content?.description?.key_features || [];

    const parts = decomposeSummary(summary);
    const has5Parts = Boolean(parts.mood && parts.intro && parts.story && parts.close && bullets.length > 0);
    const deterministicBullets = bullets.every((b) => typeof b === 'string' && b.length > 5);

    console.log(`[Step 5] 5 Parts Breakdown:`);
    console.log(`   Mood:  "${parts.mood}"`);
    console.log(`   Intro: "${parts.intro}"`);
    console.log(`   Story: "${parts.story}"`);
    console.log(`   Close: "${parts.close}"`);
    console.log(`   Bullets count: ${bullets.length} (deterministic specification list)`);
    console.log(`   Bullets:`, bullets);

    const step5Pass = has5Parts && deterministicBullets;
    results.push({
      step: 5,
      name: 'Confirm boundaries still hold under a real edit',
      pass: step5Pass,
      details: {
        has5Parts,
        deterministicBullets,
        bulletsCount: bullets.length,
      },
    });
  } catch (err) {
    console.error(`[Step 5] FAILED:`, err.message);
    results.push({ step: 5, name: 'Confirm boundaries still hold under a real edit', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 6: Reset and confirm reversion
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 6: Reset and confirm reversion ---');
  try {
    const resetRes = await axios.post(
      `${BASE_URL}/ai-content/tones/playful_casual/reset`,
      {},
      { headers: HEADERS },
    );
    console.log(`[Step 6] Reset Status: ${resetRes.status}`);

    const storedDocAfterReset = await db.collection('toneoverrides').findOne({
      company_id: COMPANY_ID,
      application_id: APPLICATION_ID,
      tone_id: 'playful_casual',
    });
    console.log(`[Step 6] ToneOverride document in Mongo after reset: ${storedDocAfterReset}`);

    const revertedPreviewRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/preview`,
      { tone: 'playful_casual', count: 3 },
      { headers: HEADERS },
    );
    const revertedSummary = revertedPreviewRes.data?.preview_items?.[0]?.generated_content?.description?.summary || '';
    const containsSanctuary = revertedSummary.toLowerCase().includes('sanctuary');

    console.log(`[Step 6] Summary after reset: "${revertedSummary}"`);
    console.log(`[Step 6] Still contains 'sanctuary': ${containsSanctuary}`);

    const step6Pass = storedDocAfterReset === null && !containsSanctuary;
    results.push({
      step: 6,
      name: 'Reset and confirm reversion',
      pass: step6Pass,
      details: {
        docDeleted: storedDocAfterReset === null,
        revertedCleanly: !containsSanctuary,
        revertedSummary,
      },
    });
  } catch (err) {
    console.error(`[Step 6] FAILED:`, err.message);
    results.push({ step: 6, name: 'Reset and confirm reversion', pass: false, error: err.message });
  }

  // -------------------------------------------------------------------------
  // STEP 7: Confirm and full run
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 7: Confirm and full run ---');
  try {
    const confirmRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/confirm`,
      { tone: 'playful_casual' },
      { headers: HEADERS },
    );
    console.log(`[Step 7] Confirm Status: ${confirmRes.status}`);

    // Poll Mongo to observe status transitions: PREVIEW -> PENDING -> PROCESSING -> COMPLETED
    let finalJob = null;
    let attempts = 0;
    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 1000));
      finalJob = await db.collection('aicontentjobs').findOne({ _id: new mongoose.Types.ObjectId(jobId) });
      console.log(`[Step 7 Poll ${attempts + 1}s] Status: ${finalJob?.status}, Total: ${finalJob?.total_count}, Clean: ${finalJob?.clean_count}`);
      if (finalJob?.status?.toLowerCase() === 'completed' || finalJob?.status?.toLowerCase() === 'failed') {
        break;
      }
      attempts++;
    }

    const step7Pass = finalJob?.status?.toLowerCase() === 'completed' && finalJob?.selected_tone === 'playful_casual';
    results.push({
      step: 7,
      name: 'Confirm and full run',
      pass: step7Pass,
      details: {
        finalStatus: finalJob?.status,
        selectedTone: finalJob?.selected_tone,
        totalCount: finalJob?.total_count,
        cleanCount: finalJob?.clean_count,
      },
    });
  } catch (err) {
    console.error(`[Step 7] FAILED:`, err.message);
    results.push({ step: 7, name: 'Confirm and full run', pass: false, error: err.message });
  }

  await mongoConn.close();

  console.log('\n================================================================');
  console.log('  VERIFICATION SUMMARY');
  console.log('================================================================');
  results.forEach((r) => {
    console.log(`Step ${r.step}: ${r.name} -> ${r.pass ? 'PASS' : 'FAIL'}`);
  });
  console.log('================================================================\n');

  return results;
}

runRealVerification().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
