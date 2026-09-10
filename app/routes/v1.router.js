"use strict";

const express = require('express');
const multer = require('multer');
const os = require('os');
const {
  getApplicationDetails,
  getCompanySalesChannels,
} = require('./controllers/company.controller');
const {
  createObjectDefinition,
  listObjectDefinitions,
  getObjectDefinition,
  getDefinitionDeletionImpact,
  updateObjectDefinition,
  deleteObjectDefinition,
} = require('./controllers/objectDefinition.controller');
const {
  publishObjectDefinition,
  listObjectDefinitionVersions,
} = require('./controllers/objectDefinitionPublish.controller');
const {
  loadDefinition,
  createObjectInstance,
  listObjectInstances,
  getObjectInstance,
  updateObjectInstance,
  deleteObjectInstance,
  getDefinitionBySlug,
  downloadBulkTemplate,
  bulkImportInstances,
} = require('./controllers/dynamicObject.controller');
const {
  getSearchProducts,
  getSearchCollections,
} = require('./controllers/search.controller');

const {
  startBulkImportAsync,
  getBulkImportJobStatus,
  listBulkImportJobs,
  downloadBulkImportReport,
} = require('./controllers/bulkImportJob.controller');
const {
  BULK_IMPORT_MAX_ZIP_MB,
  BULK_IMPORT_MAX_SPREADSHEET_MB,
} = require('../constants/constant');

const MB = 1024 * 1024;
const upload = multer({ dest: os.tmpdir() });
const bulkImportUpload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: Math.max(BULK_IMPORT_MAX_ZIP_MB, BULK_IMPORT_MAX_SPREADSHEET_MB) * MB,
  },
});
const router = express.Router();
const APP_BASE_PATH = `/company/application/:application_id`;

router.param('slug', loadDefinition);

router.get('/test-api', (req, res) => {
  res.json({ hello: 'hello' });
});

// Get applications list
router.get(`${APP_BASE_PATH}/details`, getApplicationDetails);
router.get('/applications', getCompanySalesChannels);

// CMS definition endpoints
router.post('/cms/definitions', createObjectDefinition);
router.get('/cms/definitions', listObjectDefinitions);
router.get('/cms/definitions/:definitionId/deletion-impact', getDefinitionDeletionImpact);
router.get('/cms/definitions/:definitionId', getObjectDefinition);
router.put('/cms/definitions/:definitionId', updateObjectDefinition);
router.delete('/cms/definitions/:definitionId', deleteObjectDefinition);
router.post('/cms/definitions/:definitionId/publish', publishObjectDefinition);
router.get('/cms/definitions/:definitionId/versions', listObjectDefinitionVersions);

// CMS object data endpoints via slug
router.post('/cms/:slug', upload.any(), createObjectInstance);
router.get('/cms/:slug', listObjectInstances);
router.get('/cms/:slug/definition', getDefinitionBySlug);
router.get('/cms/:slug/bulk/template', downloadBulkTemplate);
router.post('/cms/:slug/bulk/import', upload.single('file'), bulkImportInstances);
router.post(
  '/cms/:slug/bulk/import-async',
  bulkImportUpload.fields([
    { name: 'spreadsheet', maxCount: 1 },
    { name: 'assets', maxCount: 1 },
  ]),
  startBulkImportAsync,
);
router.get('/cms/:slug/bulk/jobs', listBulkImportJobs);
router.get('/cms/:slug/bulk/jobs/:jobId', getBulkImportJobStatus);
router.get('/cms/:slug/bulk/jobs/:jobId/report', downloadBulkImportReport);
router.get('/cms/:slug/:id', getObjectInstance);
router.put('/cms/:slug/:id', upload.any(), updateObjectInstance);
router.delete('/cms/:slug/:id', deleteObjectInstance);

// Fynd search integration for CMS fields
router.get(`${APP_BASE_PATH}/cms/products/search`, getSearchProducts);
router.get(`${APP_BASE_PATH}/cms/collections/search`, getSearchCollections);

// AI Content Generation endpoints
const {
  startAiContentJob,
  listAiContentJobs,
  getAiContentJobStatus,
} = require('./controllers/aiContentJob.controller');
const {
  listReviewRows,
  editReviewRow,
  regenerateReviewRow,
  pushReviewRow,
  revertField,
  submitFeedback,
} = require('./controllers/aiContentReview.controller');

router.post('/ai-content/jobs', startAiContentJob);
router.get('/ai-content/jobs', listAiContentJobs);
router.get('/ai-content/jobs/:jobId', getAiContentJobStatus);
router.get('/ai-content/jobs/:jobId/review', listReviewRows);
router.put('/ai-content/jobs/:jobId/review/:rowId', editReviewRow);
router.post('/ai-content/jobs/:jobId/review/:rowId/regenerate', regenerateReviewRow);
router.post('/ai-content/jobs/:jobId/review/:rowId/push', pushReviewRow);
router.post('/ai-content/fields/:fieldHistoryId/revert', revertField);
router.post('/ai-content/feedback', submitFeedback);

// Support application-scoped routes
router.post(`${APP_BASE_PATH}/ai-content/jobs`, startAiContentJob);
router.get(`${APP_BASE_PATH}/ai-content/jobs`, listAiContentJobs);
router.get(`${APP_BASE_PATH}/ai-content/jobs/:jobId`, getAiContentJobStatus);
router.get(`${APP_BASE_PATH}/ai-content/jobs/:jobId/review`, listReviewRows);
router.put(`${APP_BASE_PATH}/ai-content/jobs/:jobId/review/:rowId`, editReviewRow);
router.post(`${APP_BASE_PATH}/ai-content/jobs/:jobId/review/:rowId/regenerate`, regenerateReviewRow);
router.post(`${APP_BASE_PATH}/ai-content/jobs/:jobId/review/:rowId/push`, pushReviewRow);
router.post(`${APP_BASE_PATH}/ai-content/fields/:fieldHistoryId/revert`, revertField);
router.post(`${APP_BASE_PATH}/ai-content/feedback`, submitFeedback);

module.exports = router;

