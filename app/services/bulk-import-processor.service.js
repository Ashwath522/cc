'use strict';

const Sentry = require('@sentry/node');
const logger = require('../common/logger');
const BulkImportJobModel = require('../models/bulkImportJob.model');
const ObjectDefinitionModel = require('../models/objectDefinition.model');
const {
  BULK_IMPORT_JOB_STATUS,
  BULK_IMPORT_MAX_ROWS,
} = require('../constants/constant');
const { getDynamicModel } = require('../helpers/dynamic-collection.helper');
const {
  rowObjectToPayload,
  parseWorkbookToRows,
  isRowEffectivelyEmpty,
} = require('../helpers/cms-bulk-import.helper');
const { extractZipBufferAndBuildAssetMap } = require('../helpers/cms-bulk-asset-map.helper');
const { resolveFileFieldsOnPayload } = require('../helpers/cms-bulk-file-resolve.helper');
const {
  collectProductSkusFromRows,
  buildProductSkuMap,
  resolveProductFieldsOnPayload,
} = require('../helpers/cms-bulk-product-resolve.helper');
const { upsertBulkImportRow } = require('../helpers/cms-bulk-upsert.helper');
const { applyResultsToSpreadsheetBuffer } = require('../helpers/cms-bulk-report.helper');
const { getExtractDir, cleanupJobWorkspace } = require('../helpers/bulk-import-job.helper');
const {
  downloadPlatformFileToBuffer,
  uploadBufferUtils,
} = require('../utils/uploadFile.utils');
const { fdkExtension } = require('../fdk');

const SPREADSHEET_MIME = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const findPublishedDefinition = async (companyId, applicationId, slug) =>
  ObjectDefinitionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    slug,
    status: 'PUBLISHED',
  })
    .lean()
    .exec();

const buildJobLevelRowResults = (dataRows, errorMessage) =>
  (dataRows || []).map(({ rowNum }) => ({
    row_number: rowNum,
    status: 'failed',
    failure_reason: errorMessage,
    created_id: '',
  }));

const uploadReportSpreadsheet = async ({
  platformAppCli,
  jobId,
  originalBuffer,
  format,
  rowResults,
  originalFileName,
}) => {
  const ext = format === 'csv' ? 'csv' : 'xlsx';
  const reportBuffer = applyResultsToSpreadsheetBuffer(originalBuffer, format, rowResults);
  const baseName = (originalFileName || `bulk-import-${jobId}`).replace(/\.(csv|xlsx|xls)$/i, '');
  const fileName = `${baseName}-report.${ext}`;
  const completeUpload = await uploadBufferUtils(platformAppCli, {
    buffer: reportBuffer,
    originalname: fileName,
    mimetype: SPREADSHEET_MIME[ext] || SPREADSHEET_MIME.xlsx,
  });
  await BulkImportJobModel.findByIdAndUpdate(jobId, {
    spreadsheet_url: completeUpload.cdn.url,
    spreadsheet_file_id: completeUpload._id || '',
    report_ready: true,
  }).exec();
  return completeUpload.cdn.url;
};

const failJob = async (jobId, errorMessage, reportOpts = {}) => {
  const {
    companyId,
    applicationId,
    originalBuffer,
    format,
    dataRows,
    rowResults,
    platformAppCli,
    definitionSlug,
  } = reportOpts;

  const updates = {
    status: BULK_IMPORT_JOB_STATUS.FAILED,
    error_message: errorMessage,
    completed_at: new Date(),
  };

  let results = rowResults || [];
  if (!results.length && dataRows && dataRows.length) {
    results = buildJobLevelRowResults(dataRows, errorMessage);
  }

  if (originalBuffer && results.length) {
    try {
      let appCli = platformAppCli;
      if (!appCli && companyId && applicationId) {
        const platformClient = await fdkExtension.getPlatformClient(companyId);
        appCli = platformClient.application(applicationId);
      }
      if (appCli) {
        const ext = format === 'csv' ? 'csv' : 'xlsx';
        await uploadReportSpreadsheet({
          platformAppCli: appCli,
          jobId,
          originalBuffer,
          format: ext,
          rowResults: results,
          originalFileName: `bulk-import-${definitionSlug || 'job'}-${jobId}.${ext}`,
        });
        updates.report_ready = true;
        updates.total_rows = dataRows ? dataRows.length : results.length;
        updates.failed_count = results.filter((r) => r.status === 'failed').length;
        updates.processed_rows = updates.total_rows;
        updates.created_count = results.filter((r) => r.status === 'success').length;
      }
    } catch (uploadErr) {
      logger.warn(`Bulk import job ${jobId}: could not upload failure report: ${uploadErr.message}`);
    }
  }

  await BulkImportJobModel.findByIdAndUpdate(jobId, updates).exec();
  await cleanupJobWorkspace(jobId);
};

const processBulkImportJob = async (jobId, companyId, applicationId, definitionSlug) => {
  const job = await BulkImportJobModel.findById(jobId).exec();
  if (!job) {
    throw new Error(`Bulk import job ${jobId} not found`);
  }

  if (!job.spreadsheet_url) {
    await failJob(jobId, 'Spreadsheet file URL not found on job');
    return;
  }
  if (!job.assets_zip_url) {
    await failJob(jobId, 'Assets ZIP URL not found on job');
    return;
  }

  await BulkImportJobModel.findByIdAndUpdate(jobId, {
    status: BULK_IMPORT_JOB_STATUS.PROCESSING,
    started_at: new Date(),
  }).exec();

  let originalSpreadsheetBuffer;
  let zipBuffer;
  let dataRows = [];
  let platformAppCli;
  const ext = job.spreadsheet_format === 'csv' ? 'csv' : 'xlsx';
  const extractDir = getExtractDir(jobId);

  const reportOpts = () => ({
    companyId,
    applicationId,
    originalBuffer: originalSpreadsheetBuffer,
    format: ext,
    dataRows,
    platformAppCli,
    definitionSlug,
  });

  try {
    const definition = await findPublishedDefinition(companyId, applicationId, definitionSlug);
    if (!definition) {
      await failJob(jobId, 'Published object definition not found', reportOpts());
      return;
    }

    const platformClient = await fdkExtension.getPlatformClient(companyId);
    platformAppCli = platformClient.application(applicationId);

    try {
      [originalSpreadsheetBuffer, zipBuffer] = await Promise.all([
        downloadPlatformFileToBuffer(platformClient, job.spreadsheet_url),
        downloadPlatformFileToBuffer(platformClient, job.assets_zip_url),
      ]);
    } catch (e) {
      await failJob(
        jobId,
        `Could not download spreadsheet or assets ZIP from storage: ${e.message}`,
        reportOpts(),
      );
      return;
    }

    if (
      originalSpreadsheetBuffer.length &&
      originalSpreadsheetBuffer[0] === 0xef &&
      originalSpreadsheetBuffer[1] === 0xbb &&
      originalSpreadsheetBuffer[2] === 0xbf
    ) {
      originalSpreadsheetBuffer = originalSpreadsheetBuffer.slice(3);
    }

    let rows;
    try {
      rows = parseWorkbookToRows(
        originalSpreadsheetBuffer,
        ext === 'csv' ? 'data.csv' : 'data.xlsx',
      );
    } catch (e) {
      await failJob(jobId, `Could not parse spreadsheet: ${e.message}`, reportOpts());
      return;
    }

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!isRowEffectivelyEmpty(row)) {
        dataRows.push({ row, rowNum: i + 2 });
      }
    }

    if (dataRows.length > BULK_IMPORT_MAX_ROWS) {
      await failJob(
        jobId,
        `Too many rows (${dataRows.length}). Maximum is ${BULK_IMPORT_MAX_ROWS}.`,
        reportOpts(),
      );
      return;
    }

    let assetMap;
    let ambiguousBasenames = new Map();
    let assetCount = 0;
    try {
      const result = await extractZipBufferAndBuildAssetMap(zipBuffer, extractDir);
      assetMap = result.assetMap;
      assetCount = result.assetCount;
      ambiguousBasenames = result.ambiguousBasenames || new Map();
    } catch (e) {
      await failJob(jobId, e.message || 'Failed to extract assets ZIP', reportOpts());
      return;
    }

    await BulkImportJobModel.findByIdAndUpdate(jobId, {
      total_rows: dataRows.length,
      asset_count: assetCount,
      processed_rows: 0,
      created_count: 0,
      failed_count: 0,
    }).exec();

    const Model = getDynamicModel(definition);

    const productSkus = collectProductSkusFromRows(
      dataRows.map((d) => d.row),
      definition,
    );
    let productSkuMap = new Map();
    if (productSkus.size) {
      try {
        productSkuMap = await buildProductSkuMap({
          skus: productSkus,
          companyId,
        });
      } catch (e) {
        await failJob(jobId, e.message || 'Failed to resolve product SKUs', reportOpts());
        return;
      }
    }

    const rowResults = [];
    let successCount = 0;
    let failedCount = 0;

    for (let idx = 0; idx < dataRows.length; idx += 1) {
      const { row, rowNum } = dataRows[idx];

      try {
        const payload = rowObjectToPayload(row, definition);
        if (applicationId) {
          payload.application_id = applicationId;
        }
        if (companyId) {
          payload.company_id = companyId;
        }

        await resolveFileFieldsOnPayload({
          payload,
          definition,
          assetMap,
          ambiguousBasenames,
          platformAppCli,
        });

        resolveProductFieldsOnPayload({
          payload,
          definition,
          productSkuMap,
        });

        const upsertResult = await upsertBulkImportRow({
          Model,
          payload,
          definition,
          companyId,
          applicationId,
        });

        if (!upsertResult.ok) {
          failedCount += 1;
          rowResults.push({
            row_number: rowNum,
            status: 'failed',
            created_id: '',
            failure_reason: upsertResult.error,
          });
        } else {
          successCount += 1;
          rowResults.push({
            row_number: rowNum,
            status: 'success',
            created_id: upsertResult.id,
            failure_reason: '',
          });
        }
      } catch (err) {
        failedCount += 1;
        rowResults.push({
          row_number: rowNum,
          status: 'failed',
          created_id: '',
          failure_reason: err.message || 'Failed to import row',
        });
      }

      const processedRows = idx + 1;
      if (processedRows === dataRows.length || processedRows % 5 === 0) {
        await BulkImportJobModel.findByIdAndUpdate(jobId, {
          processed_rows: processedRows,
          created_count: successCount,
          failed_count: failedCount,
        }).exec();
      }
    }

    await uploadReportSpreadsheet({
      platformAppCli,
      jobId,
      originalBuffer: originalSpreadsheetBuffer,
      format: ext,
      rowResults,
      originalFileName: `bulk-import-${definitionSlug}-${jobId}.${ext}`,
    });

    const finalStatus =
      successCount === 0 && failedCount > 0
        ? BULK_IMPORT_JOB_STATUS.FAILED
        : BULK_IMPORT_JOB_STATUS.COMPLETED;

    await BulkImportJobModel.findByIdAndUpdate(jobId, {
      status: finalStatus,
      processed_rows: dataRows.length,
      created_count: successCount,
      failed_count: failedCount,
      error_message: finalStatus === BULK_IMPORT_JOB_STATUS.FAILED ? 'All rows failed to import' : '',
      completed_at: new Date(),
      report_ready: true,
    }).exec();

    await cleanupJobWorkspace(jobId);
    logger.info(
      `Bulk import job ${jobId} finished (${finalStatus}): ${successCount} succeeded, ${failedCount} failed`,
    );
  } catch (error) {
    logger.error(`Bulk import job ${jobId} error: ${error.message}`);
    Sentry.captureException(error);
    await failJob(jobId, error.message || 'Unexpected error during bulk import', {
      ...reportOpts(),
      rowResults: undefined,
    });
  }
};

module.exports = {
  processBulkImportJob,
  findPublishedDefinition,
};
