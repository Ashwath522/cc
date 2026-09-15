'use strict';

const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const AiContentExcelVersionModel = require('../app/models/aiContentExcelVersion.model');
const ContentReviewQueueModel = require('../app/models/contentReviewQueue.model');
const { diffExcelFiles } = require('../app/helpers/ai-content/ai-excel-version.helper');

const BASE_URL = 'http://localhost:8082/api/v1';
const MONGO_URI = 'mongodb://127.0.0.1:27017/content-x';

const COMPANY_ID = '95';
const APPLICATION_ID = '65eb1972926345654bc9c1a8';
const HEADERS = {
  'x-company-id': COMPANY_ID,
  'x-application-id': APPLICATION_ID,
  'Content-Type': 'application/json',
};

const CATEGORIES = [
  'Beds',
  'Bedroom Storage',
  'Mattresses',
  'Wardrobes',
  'Kids Room',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJobCompletion(jobId, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(`${BASE_URL}/ai-content/jobs/${jobId}`, { headers: HEADERS });
    const job = res.data?.job;
    const status = job?.status;
    console.log(`  [Job ${jobId}] Status: ${status}, Progress: ${job?.progress_percent || 0}%, Processed: ${job?.total_count || 0}`);
    if (status === 'completed' || status === 'review') {
      return job;
    }
    if (status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${job.error_message || 'Unknown error'}`);
    }
    await sleep(2000);
  }
  throw new Error(`Job ${jobId} timed out after ${maxWaitMs}ms`);
}

function extractDescriptionParts(row) {
  const desc = row.generated_content?.description || {};
  const summary = desc.summary || '';
  const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [];
  return {
    mood_line: desc.mood_line || sentences[0] || '',
    intro: desc.intro || sentences[1] || '',
    story: desc.story || (sentences.length > 3 ? sentences.slice(2, sentences.length - 1).join(' ') : sentences[2] || ''),
    close: desc.close || (sentences.length > 1 ? sentences[sentences.length - 1] : ''),
    summary,
  };
}

async function runMultiCategoryRegeneration() {
  console.log('========================================================================');
  console.log('  STARTING MULTI-CATEGORY REGENERATION, EXCEL VERSIONING & VERIFICATION');
  console.log('========================================================================\n');

  const categoryJobs = {};
  const categoryReviewRows = {};

  // -------------------------------------------------------------------------
  // LOOP 2: Multi-Category Job Processing
  // -------------------------------------------------------------------------
  console.log('\n--- LOOP 2: Multi-Category Regeneration across 5 Categories ---');
  for (const category of CATEGORIES) {
    console.log(`\n>>> Starting Job for Category: [${category}]`);
    const createRes = await axios.post(
      `${BASE_URL}/ai-content/jobs`,
      {
        category,
        category_ids: [category],
        selected_tone: 'auto',
        allowSeedFallback: false,
        catalogSource: 'raw_catalog',
      },
      { headers: HEADERS }
    );

    const jobId = createRes.data?.job?._id;
    console.log(`  Created Job ID: ${jobId}`);

    // Confirm job to kick off BullMQ worker processing
    const confirmRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/confirm`,
      {
        allowSeedFallback: false,
        catalogSource: 'raw_catalog',
      },
      { headers: HEADERS }
    );
    console.log(`  Confirmed Job ID: ${jobId}, Initial status: ${confirmRes.data?.job?.status}`);

    const completedJob = await waitForJobCompletion(jobId);
    categoryJobs[category] = completedJob;

    // Fetch review rows
    const reviewRes = await axios.get(
      `${BASE_URL}/ai-content/jobs/${jobId}/review?limit=60`,
      { headers: HEADERS }
    );
    const rows = reviewRes.data?.rows || [];
    categoryReviewRows[category] = rows;
    console.log(`  Retrieved ${rows.length} generated items for category [${category}]`);
  }

  // -------------------------------------------------------------------------
  // LOOP 3: Cross-Category Distinctness Check
  // -------------------------------------------------------------------------
  console.log('\n--- LOOP 3: Cross-Category Distinctness Verification ---');
  const moodLinesByCategory = {};
  const closeLinesByCategory = {};

  for (const category of CATEGORIES) {
    const rows = categoryReviewRows[category] || [];
    moodLinesByCategory[category] = [];
    closeLinesByCategory[category] = [];

    for (const r of rows) {
      const parts = extractDescriptionParts(r);
      if (parts.mood_line) moodLinesByCategory[category].push(parts.mood_line);
      if (parts.close) closeLinesByCategory[category].push(parts.close);
    }
  }

  // Cross-compare mood lines pairwise
  let crossCategoryMoodCollisions = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    for (let j = i + 1; j < CATEGORIES.length; j++) {
      const catA = CATEGORIES[i];
      const catB = CATEGORIES[j];
      const setA = new Set(moodLinesByCategory[catA]);
      for (const line of moodLinesByCategory[catB]) {
        if (setA.has(line)) {
          console.error(`  [COLLISION] Mood line shared between ${catA} and ${catB}: "${line}"`);
          crossCategoryMoodCollisions++;
        }
      }
    }
  }

  console.log(`  Cross-Category Mood Line Collisions: ${crossCategoryMoodCollisions}`);
  if (crossCategoryMoodCollisions > 0) {
    throw new Error(`Distinctness failure: Found ${crossCategoryMoodCollisions} identical mood lines across categories!`);
  } else {
    console.log('  [PASS] 100% distinct mood lines across all 5 categories.');
  }

  // Display a sample from each category
  console.log('\n  --- Sample Generated Descriptions per Category ---');
  for (const category of CATEGORIES) {
    const sample = categoryReviewRows[category]?.[0];
    if (sample) {
      const parts = extractDescriptionParts(sample);
      const name = sample.source_attributes?.name || sample.product_ref?.name;
      const careList = sample.generated_content?.material_care || [];
      console.log(`\n  Category: [${category}] - Product: ${name}`);
      console.log(`    Mood:  "${parts.mood_line}"`);
      console.log(`    Intro: "${parts.intro}"`);
      console.log(`    Story: "${parts.story}"`);
      console.log(`    Close: "${parts.close}"`);
      console.log(`    Words: ${parts.summary.split(/\s+/).filter(Boolean).length} words`);
      if (careList.length) {
        console.log(`    Care:  ${careList.map(m => m.material + ': ' + m.instructions).join(' | ')}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // LOOP 4: Excel Export & Versioning Pass (Version 1 for all categories)
  // -------------------------------------------------------------------------
  console.log('\n--- LOOP 4: Dual-Tab Excel Export & 60-Day Versioning ---');
  const categoryVersion1 = {};

  for (const category of CATEGORIES) {
    const job = categoryJobs[category];
    const jobId = job._id;

    const exportRes = await axios.post(
      `${BASE_URL}/ai-content/jobs/${jobId}/excel-export`,
      {},
      { headers: HEADERS }
    );

    const { version, filePath, expiresAt } = exportRes.data;
    console.log(`  Category [${category}] Exported Excel Version ${version}:`);
    console.log(`    File: ${filePath}`);
    console.log(`    Expires At: ${expiresAt}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Exported Excel file does not exist at ${filePath}`);
    }

    // Verify 60-day expiry in Mongo via Model
    const vDoc = await AiContentExcelVersionModel.findOne({
      company_id: COMPANY_ID,
      application_id: APPLICATION_ID,
      category,
      version,
    }).lean();

    if (!vDoc) {
      throw new Error(`Version document not found in MongoDB for ${category} v${version}`);
    }

    const expiryDays = Math.round((new Date(vDoc.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    console.log(`    Mongo verified: Version ${vDoc.version}, Category: ${vDoc.category}, Expiry: ~${expiryDays} days, Total items: ${vDoc.row_count}`);
    categoryVersion1[category] = { versionDoc: vDoc, filePath };
  }

  // -------------------------------------------------------------------------
  // LOOP 5: Single-Field Review Edit, Version 2 Diff & Revert Pass
  // -------------------------------------------------------------------------
  console.log('\n--- LOOP 5: Single-Field Review Edit, Cell-by-Cell Diff & Revert ---');
  const targetCategory = 'Beds';
  const targetJob = categoryJobs[targetCategory];
  const targetRows = categoryReviewRows[targetCategory];
  const targetRow = targetRows[0];
  const targetProductName = targetRow.source_attributes?.name || targetRow.product_ref?.name;

  console.log(`  Selected Product for Single-Field Edit: [${targetProductName}] (ID: ${targetRow._id})`);
  const originalParts = extractDescriptionParts(targetRow);
  console.log(`  Original Mood Line: "${originalParts.mood_line}"`);

  // Step 5a: Edit single field (mood_line)
  const modifiedMoodLine = 'Tailored for timeless elegance, this centerpiece commands the sanctuary with unmistakable warmth and grace.';
  const editPayload = {
    generated_content: {
      description: {
        mood_line: modifiedMoodLine,
      },
    },
    change_reason: 'Antigravity Loop 5 Single-Field Verification Test',
  };

  const editRes = await axios.put(
    `${BASE_URL}/ai-content/jobs/${targetJob._id}/review/${targetRow._id}`,
    editPayload,
    { headers: HEADERS }
  );

  const updatedRow = editRes.data?.row;
  const updatedParts = extractDescriptionParts(updatedRow);
  console.log(`  Updated Mood Line: "${updatedParts.mood_line}"`);
  console.log(`  Updated Summary:   "${updatedParts.summary}"`);

  // Step 5b: Export Version 2 for target category
  console.log('\n  Exporting Version 2 Excel...');
  const exportV2Res = await axios.post(
    `${BASE_URL}/ai-content/jobs/${targetJob._id}/excel-export`,
    {},
    { headers: HEADERS }
  );
  const v2Version = exportV2Res.data.version;
  const v2FilePath = exportV2Res.data.filePath;
  console.log(`  Exported Version ${v2Version} at: ${v2FilePath}`);

  // Step 5c: Fetch Version List
  const listRes = await axios.get(
    `${BASE_URL}/ai-content/jobs/${targetJob._id}/excel-versions`,
    { headers: HEADERS }
  );
  const versions = listRes.data?.versions || [];
  console.log(`  Total Versions available for [${targetCategory}]: ${versions.length}`);
  if (versions.length < 2) {
    throw new Error(`Expected at least 2 versions, found ${versions.length}`);
  }

  // Step 5d: Diff Version 1 vs Version 2
  const v1FilePath = categoryVersion1[targetCategory].filePath;
  console.log(`\n  Running Cell-by-Cell Diff between V1 and V2:`);
  console.log(`    V1: ${v1FilePath}`);
  console.log(`    V2: ${v2FilePath}`);

  const diffResult = diffExcelFiles(v1FilePath, v2FilePath);
  console.log(`  Total Diffs Found: ${diffResult.differenceCount}`);
  console.log('  Diff details:');
  for (const d of diffResult.differences) {
    console.log(`    Sheet: ${d.sheet}, Row Index: ${d.rowIndex}, Column: ${d.colHeader}`);
    console.log(`      V1: "${d.valA}"`);
    console.log(`      V2: "${d.valB}"`);
  }

  // We edited mood_line, which affects "Mood_Line" and "Full_Summary" in the Generated Data sheet
  // Assert no unrelated products changed
  const modifiedProductRows = new Set(diffResult.differences.map(d => d.rowIndex));
  if (modifiedProductRows.size !== 1) {
    throw new Error(`Diff violation! Expected exactly 1 modified row, but found ${modifiedProductRows.size} modified rows.`);
  }
  console.log('  [PASS] Cell-by-cell diff confirmed ONLY the target product row was modified!');

  // Step 5e: Revert to Version 1 (or pre-edit version)
  const targetVersionNumber = categoryVersion1[targetCategory].versionDoc.version;
  console.log(`\n  Reverting Category [${targetCategory}] back to Version ${targetVersionNumber}...`);
  const revertRes = await axios.post(
    `${BASE_URL}/ai-content/jobs/${targetJob._id}/excel-versions/${targetVersionNumber}/revert`,
    {},
    { headers: HEADERS }
  );
  console.log(`  Revert response:`, revertRes.data?.message);

  // Step 5f: Verify Review Row is restored in DB
  const checkRowRes = await axios.get(
    `${BASE_URL}/ai-content/jobs/${targetJob._id}/review?limit=60`,
    { headers: HEADERS }
  );
  const restoredRow = (checkRowRes.data?.rows || []).find(r => String(r._id) === String(targetRow._id));
  const restoredParts = extractDescriptionParts(restoredRow);
  console.log(`  Restored Mood Line: "${restoredParts.mood_line}"`);

  if (restoredParts.mood_line !== originalParts.mood_line) {
    throw new Error(`Revert failed! Expected "${originalParts.mood_line}", but got "${restoredParts.mood_line}"`);
  }
  console.log('  [PASS] Revert successfully restored original mood line!');

  console.log('\n========================================================================');
  console.log('  ALL MULTI-CATEGORY REGENERATION & EXCEL VERIFICATION CHECKS PASSED!');
  console.log('========================================================================\n');

  process.exit(0);
}

runMultiCategoryRegeneration().catch((err) => {
  console.error('\n[FATAL ERROR in Multi-Category Regeneration]', err);
  process.exit(1);
});
