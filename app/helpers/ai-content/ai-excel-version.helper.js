'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const logger = require('../../common/logger');
const AiContentExcelVersionModel = require('../../models/aiContentExcelVersion.model');
const ContentReviewQueueModel = require('../../models/contentReviewQueue.model');

/**
 * Creates and stores a versioned Excel export for a category batch.
 * Sheet 1: Raw Data
 * Sheet 2: Generated Data
 * 60-day revert window tracked in MongoDB.
 */
async function generateCategoryExcelVersion({
  companyId,
  applicationId,
  jobId,
  category,
  changeSummary = 'Initial post-generation export',
}) {
  // Query all review queue rows for this job/category
  const query = {
    company_id: companyId,
    application_id: applicationId,
  };
  if (jobId) {
    query.job_id = jobId;
  }

  const rows = await ContentReviewQueueModel.find(query)
    .sort({ created_at: 1 })
    .lean()
    .exec();

  if (!rows || rows.length === 0) {
    throw new Error(`No generated rows found for category: ${category} (jobId: ${jobId})`);
  }

  // Determine current highest version for this category
  const lastVersionDoc = await AiContentExcelVersionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    category,
  })
    .sort({ version: -1 })
    .lean()
    .exec();

  const nextVersion = lastVersionDoc ? lastVersionDoc.version + 1 : 1;

  // Build Sheet 1: Raw Data
  const rawDataSheetRows = rows.map((r, idx) => {
    const src = r.source_attributes || {};
    return {
      Index: idx + 1,
      Row_ID: String(r._id),
      Product_ID: src.id || r.product_ref?.uid || '',
      Item_Code: src.item_code || '',
      Product_Name: src.name || r.product_ref?.name || '',
      Product_Short_Name: src.product_short_name || '',
      Category: src.category || category,
      Subcategory: src.subcategory || '',
      Primary_Material: src.primary_material || '',
      Color_Finish: src.color_finish || '',
      Storage_Type: src.storage_type || '',
      Dimensions: src.dimensions || '',
      Weight: src.weight || '',
      Warranty_Months: src.warranty_months != null ? src.warranty_months : '',
      Price: src.price != null ? src.price : '',
    };
  });

  // Build Sheet 2: Generated Data
  const generatedDataSheetRows = rows.map((r, idx) => {
    const gen = r.generated_content || {};
    const desc = gen.description || {};
    const care = gen.care_and_maintenance || {};
    const warranty = gen.warranty || {};
    const returns = gen.returns || {};
    const quality = gen.quality_promise || {};

    const summary = desc.summary || '';
    const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [];
    const moodLine = desc.mood_line || sentences[0] || '';
    const intro = desc.intro || sentences[1] || '';
    const story = desc.story || (sentences.length > 3 ? sentences.slice(2, sentences.length - 1).join(' ') : sentences[2] || '');
    const close = desc.close || (sentences.length > 1 ? sentences[sentences.length - 1] : '');

    return {
      Index: idx + 1,
      Row_ID: String(r._id),
      Product_ID: r.product_ref?.uid || r.source_attributes?.id || '',
      Product_Name: r.product_ref?.name || r.source_attributes?.name || '',
      Mood_Line: moodLine,
      Intro: intro,
      Story: story,
      Close: close,
      Full_Summary: summary,
      Key_Features: Array.isArray(desc.key_features) ? desc.key_features.join(' | ') : '',
      Care_Instructions: Array.isArray(care.instructions) ? care.instructions.join(' | ') : '',
      Care_Avoid: Array.isArray(care.avoid) ? care.avoid.join(' | ') : '',
      Warranty_Status: warranty.status_line || '',
      Warranty_Points: Array.isArray(warranty.points) ? warranty.points.join(' | ') : '',
      Returns_Window: returns.window_days || '',
      Quality_Statement: typeof quality === 'string' ? quality : (quality.statement || ''),
      Row_Status: r.status || '',
      Validation_Valid: r.validation_result?.valid ? 'VALID' : 'NEEDS_REVIEW',
      Validation_Errors: (r.validation_result?.errors || []).join('; '),
    };
  });

  // Create workbook with two sheets
  const workbook = XLSX.utils.book_new();
  const rawWorksheet = XLSX.utils.json_to_sheet(rawDataSheetRows);
  const genWorksheet = XLSX.utils.json_to_sheet(generatedDataSheetRows);

  XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Raw Data');
  XLSX.utils.book_append_sheet(workbook, genWorksheet, 'Generated Data');

  // Prepare output directory
  const safeCatName = category.replace(/[^a-zA-Z0-9_-]/g, '_');
  const exportDir = path.join(process.cwd(), 'output', 'excel_versions', safeCatName);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${safeCatName}_v${nextVersion}_${timestamp}.xlsx`;
  const filePath = path.join(exportDir, fileName);

  XLSX.writeFile(workbook, filePath);
  logger.info(`[generateCategoryExcelVersion] Wrote version ${nextVersion} to: ${filePath}`);

  // Save version tracking record with 60-day revert window
  const now = new Date();
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + sixtyDaysMs);

  const versionRecord = await AiContentExcelVersionModel.create({
    company_id: companyId,
    application_id: applicationId,
    job_id: jobId,
    category,
    version: nextVersion,
    file_path: filePath,
    file_name: fileName,
    row_count: rows.length,
    rows_snapshot: rows,
    created_at: now,
    expires_at: expiresAt,
    change_summary: changeSummary,
    status: 'active',
  });

  return {
    success: true,
    version: nextVersion,
    fileName,
    filePath,
    rowCount: rows.length,
    expiresAt,
    revertWindowDays: 60,
    versionRecord,
  };
}

/**
 * Lists all stored versions for a category, showing remaining revert window.
 */
async function listCategoryExcelVersions({ companyId, applicationId, category }) {
  const versions = await AiContentExcelVersionModel.find({
    company_id: companyId,
    application_id: applicationId,
    category,
  })
    .sort({ version: 1 })
    .lean()
    .exec();

  const now = Date.now();
  return versions.map((v) => {
    const expiresMs = new Date(v.expires_at).getTime();
    const daysRemaining = Math.max(0, Math.ceil((expiresMs - now) / (1000 * 60 * 60 * 24)));
    return {
      id: String(v._id),
      category: v.category,
      version: v.version,
      fileName: v.file_name,
      filePath: v.file_path,
      rowCount: v.row_count,
      createdAt: v.created_at,
      expiresAt: v.expires_at,
      daysRemainingInRevertWindow: daysRemaining,
      changeSummary: v.change_summary,
      status: v.status,
    };
  });
}

/**
 * Reverts the database rows back to a specified Excel version snapshot.
 */
async function revertToExcelVersion({ companyId, applicationId, category, targetVersion }) {
  const versionDoc = await AiContentExcelVersionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    category,
    version: targetVersion,
  }).exec();

  if (!versionDoc) {
    throw new Error(`Version ${targetVersion} not found for category ${category}`);
  }

  const snapshot = versionDoc.rows_snapshot || [];
  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    throw new Error(`Snapshot for version ${targetVersion} is empty`);
  }

  // Restore each row in ContentReviewQueueModel
  for (const snapRow of snapshot) {
    await ContentReviewQueueModel.updateOne(
      {
        _id: snapRow._id,
        company_id: companyId,
        application_id: applicationId,
      },
      {
        $set: {
          generated_content: snapRow.generated_content,
          validation_result: snapRow.validation_result,
          status: snapRow.status,
          human_edited_fields: snapRow.human_edited_fields || [],
        },
      },
    ).exec();
  }

  logger.info(`[revertToExcelVersion] Restored ${snapshot.length} rows for category ${category} to version ${targetVersion}`);
  return {
    success: true,
    revertedToVersion: targetVersion,
    restoredRowCount: snapshot.length,
  };
}

/**
 * Compares two Excel files cell by cell across all sheets.
 * Returns an array of differences.
 */
function diffExcelFiles(filePathA, filePathB) {
  const wbA = XLSX.readFile(filePathA);
  const wbB = XLSX.readFile(filePathB);

  const sheetsA = wbA.SheetNames;
  const sheetsB = wbB.SheetNames;

  const differences = [];

  // Check sheet names
  if (JSON.stringify(sheetsA) !== JSON.stringify(sheetsB)) {
    differences.push({
      type: 'sheet_list_mismatch',
      sheetsA,
      sheetsB,
    });
  }

  for (const sheetName of sheetsA) {
    if (!wbB.Sheets[sheetName]) {
      differences.push({ type: 'missing_sheet_in_b', sheet: sheetName });
      continue;
    }

    const sheetA = wbA.Sheets[sheetName];
    const sheetB = wbB.Sheets[sheetName];

    const dataA = XLSX.utils.sheet_to_json(sheetA, { header: 1 });
    const dataB = XLSX.utils.sheet_to_json(sheetB, { header: 1 });

    const maxRows = Math.max(dataA.length, dataB.length);
    for (let r = 0; r < maxRows; r++) {
      const rowA = dataA[r] || [];
      const rowB = dataB[r] || [];
      const maxCols = Math.max(rowA.length, rowB.length);

      for (let c = 0; c < maxCols; c++) {
        const valA = rowA[c] !== undefined ? String(rowA[c]).trim() : '';
        const valB = rowB[c] !== undefined ? String(rowB[c]).trim() : '';

        if (valA !== valB) {
          const colHeader = (dataA[0] && dataA[0][c]) || `Col_${c}`;
          differences.push({
            sheet: sheetName,
            rowIndex: r,
            colIndex: c,
            colHeader,
            rowA_id: rowA[1] || rowA[0] || `Row_${r}`,
            valA,
            valB,
          });
        }
      }
    }
  }

  return {
    fileA: filePathA,
    fileB: filePathB,
    differenceCount: differences.length,
    differences,
  };
}

module.exports = {
  generateCategoryExcelVersion,
  listCategoryExcelVersions,
  revertToExcelVersion,
  diffExcelFiles,
};
