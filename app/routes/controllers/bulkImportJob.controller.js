'use strict';

const fsp = require('fs').promises;
const _ = require('lodash');
const Sentry = require('@sentry/node');
const { fdkExtension } = require('../../fdk');
const logger = require('../../common/logger');
const BulkImportJobModel = require('../../models/bulkImportJob.model');
const {
  BULK_IMPORT_JOB_STATUS,
  BULK_IMPORT_MAX_ZIP_MB,
  BULK_IMPORT_MAX_SPREADSHEET_MB,
} = require('../../constants/constant');
const {
  getCompanyId,
  getApplicationId,
} = require('../../helpers/request-context.helper');
const { getBulkImportableFields } = require('../../helpers/cms-bulk-import.helper');
const { detectSpreadsheetFormat } = require('../../helpers/bulk-import-job.helper');
const { enqueueBulkImportJob } = require('../../workers/bulk-import.worker');
const { findPublishedDefinition } = require('../../services/bulk-import-processor.service');
const { uploadBufferUtils, downloadPlatformFileToBuffer } = require('../../utils/uploadFile.utils');

const MB = 1024 * 1024;

const SPREADSHEET_MIME = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const ensureStandaloneDefinition = (definition, res) => {
  if (!definition || definition.usage_mode !== 'embedded_only') {
    return true;
  }
  res.status(403).json({
    message: 'This object definition is embedded-only and cannot be managed as standalone objects.',
  });
  return false;
};

const getCreatedBy = (req) =>
  _.get(req, 'fdkSession.current_user.email', '') ||
  _.get(req, 'fdkSession.current_user.id', '');

const jobToStatusResponse = (job) => ({
  job_id: String(job._id),
  status: job.status,
  total_rows: job.total_rows,
  processed_rows: job.processed_rows,
  created_count: job.created_count,
  failed_count: job.failed_count,
  asset_count: job.asset_count,
  error_message: job.error_message || '',
  spreadsheet_url: job.spreadsheet_url || '',
  can_download_report: Boolean(job.report_ready && job.spreadsheet_url),
  created_at: job.created_at,
  started_at: job.started_at,
  completed_at: job.completed_at,
});

const findJobForTenant = async (req, jobId) => {
  const companyId = getCompanyId(req);
  const applicationId = getApplicationId(req);
  const definition = req.definition;
  return BulkImportJobModel.findOne({
    _id: jobId,
    company_id: companyId,
    application_id: applicationId,
    definition_slug: definition.slug,
  }).exec();
};

const uploadMulterFile = async (platformAppCli, file) => {
  const completeUpload = await uploadBufferUtils(platformAppCli, {
    buffer: await fsp.readFile(file.path),
    originalname: file.originalname,
    mimetype: file.mimetype || 'application/octet-stream',
  });
  return completeUpload;
};

const startBulkImportAsync = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }

  const spreadsheetFile = req.files && req.files.spreadsheet && req.files.spreadsheet[0];
  const assetsFile = req.files && req.files.assets && req.files.assets[0];

  if (!spreadsheetFile || !spreadsheetFile.path) {
    return res.status(400).json({ message: 'Upload a spreadsheet using field name "spreadsheet"' });
  }
  if (!assetsFile || !assetsFile.path) {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    return res.status(400).json({ message: 'Upload assets ZIP using field name "assets"' });
  }

  const importable = getBulkImportableFields(definition);
  if (!importable.length) {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    await fsp.unlink(assetsFile.path).catch(() => {});
    return res.status(400).json({ message: 'No bulk-importable fields on this definition.' });
  }

  if (spreadsheetFile.size > BULK_IMPORT_MAX_SPREADSHEET_MB * MB) {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    await fsp.unlink(assetsFile.path).catch(() => {});
    return res.status(400).json({
      message: `Spreadsheet exceeds maximum size of ${BULK_IMPORT_MAX_SPREADSHEET_MB} MB`,
    });
  }
  if (assetsFile.size > BULK_IMPORT_MAX_ZIP_MB * MB) {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    await fsp.unlink(assetsFile.path).catch(() => {});
    return res.status(400).json({
      message: `Assets ZIP exceeds maximum size of ${BULK_IMPORT_MAX_ZIP_MB} MB`,
    });
  }

  const companyId = getCompanyId(req);
  const applicationId = getApplicationId(req);
  if (!applicationId) {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    await fsp.unlink(assetsFile.path).catch(() => {});
    return res.status(400).json({ message: 'application_id is required' });
  }

  const spreadsheetFormat = detectSpreadsheetFormat(spreadsheetFile.originalname);
  let jobDoc;

  try {
    const platformClient = await fdkExtension.getPlatformClient(companyId);
    const platformAppCli = platformClient.application(applicationId);

    const [spreadsheetUpload, assetsUpload] = await Promise.all([
      uploadMulterFile(platformAppCli, spreadsheetFile),
      uploadMulterFile(platformAppCli, assetsFile),
    ]);

    jobDoc = await BulkImportJobModel.create({
      company_id: companyId,
      application_id: applicationId,
      definition_slug: definition.slug,
      status: BULK_IMPORT_JOB_STATUS.PENDING,
      spreadsheet_format: spreadsheetFormat,
      spreadsheet_url: spreadsheetUpload.cdn.url,
      spreadsheet_file_id: spreadsheetUpload._id || '',
      assets_zip_url: assetsUpload.cdn.url,
      assets_zip_file_id: assetsUpload._id || '',
      created_by: getCreatedBy(req),
    });

    await enqueueBulkImportJob({
      jobId: String(jobDoc._id),
      companyId,
      applicationId,
      definitionSlug: definition.slug,
    });

    return res.status(202).json({
      job_id: String(jobDoc._id),
      status: BULK_IMPORT_JOB_STATUS.PENDING,
    });
  } catch (error) {
    if (jobDoc && jobDoc._id) {
      await BulkImportJobModel.findByIdAndDelete(jobDoc._id).catch(() => {});
    }
    logger.error(`startBulkImportAsync error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  } finally {
    await fsp.unlink(spreadsheetFile.path).catch(() => {});
    await fsp.unlink(assetsFile.path).catch(() => {});
  }
};

const getBulkImportJobStatus = async (req, res, next) => {
  try {
    const job = await findJobForTenant(req, req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Bulk import job not found' });
    }
    return res.json(jobToStatusResponse(job));
  } catch (error) {
    logger.error(`getBulkImportJobStatus error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const listBulkImportJobs = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }

  try {
    const companyId = getCompanyId(req);
    const applicationId = getApplicationId(req);
    const jobs = await BulkImportJobModel.find({
      company_id: companyId,
      application_id: applicationId,
      definition_slug: definition.slug,
    })
      .sort({ created_at: -1 })
      .limit(20)
      .lean()
      .exec();

    return res.json({
      jobs: jobs.map(jobToStatusResponse),
    });
  } catch (error) {
    logger.error(`listBulkImportJobs error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const downloadBulkImportReport = async (req, res, next) => {
  try {
    const job = await findJobForTenant(req, req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Bulk import job not found' });
    }

    if (
      job.status !== BULK_IMPORT_JOB_STATUS.COMPLETED &&
      job.status !== BULK_IMPORT_JOB_STATUS.FAILED
    ) {
      return res.status(400).json({ message: 'Report is not available until the job finishes' });
    }

    if (!job.report_ready || !job.spreadsheet_url) {
      return res.status(400).json({ message: 'Report file is not available for this job' });
    }

    const slug = req.definition.slug || 'import';
    const ext = job.spreadsheet_format === 'csv' ? 'csv' : 'xlsx';
    const contentType =
      ext === 'csv'
        ? 'text/csv; charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const companyId = getCompanyId(req);
    const applicationId = getApplicationId(req);
    const platformClient = await fdkExtension.getPlatformClient(companyId);
    const buffer = await downloadPlatformFileToBuffer(platformClient, job.spreadsheet_url);

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="bulk-import-report-${slug}-${job._id}.${ext}"`,
    );
    return res.send(buffer);
  } catch (error) {
    logger.error(`downloadBulkImportReport error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  startBulkImportAsync,
  getBulkImportJobStatus,
  listBulkImportJobs,
  downloadBulkImportReport,
};
