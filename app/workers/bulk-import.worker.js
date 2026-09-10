'use strict';

const { Queue, Worker } = require('bullmq');
const config = require('../common/config');
const logger = require('../common/logger');
const { BULK_IMPORT_QUEUE_NAME } = require('../constants/constant');
const { processBulkImportJob } = require('../services/bulk-import-processor.service');

let bulkImportQueue = null;
let bulkImportWorker = null;

const getRedisConnection = () => {
  const url = new URL(config.redis.host);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    db: url.pathname ? Number(url.pathname.replace('/', '')) || 0 : 0,
    maxRetriesPerRequest: null,
  };
};

const getBulkImportQueue = () => {
  if (!bulkImportQueue) {
    bulkImportQueue = new Queue(BULK_IMPORT_QUEUE_NAME, {
      connection: getRedisConnection(),
    });
  }
  return bulkImportQueue;
};

const enqueueBulkImportJob = async ({ jobId, companyId, applicationId, definitionSlug }) => {
  const queue = getBulkImportQueue();
  await queue.add(
    'process',
    { jobId: String(jobId), companyId, applicationId, definitionSlug },
    {
      jobId: String(jobId),
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  );
};

const startBulkImportWorker = () => {
  if (bulkImportWorker) {
    return bulkImportWorker;
  }

  bulkImportWorker = new Worker(
    BULK_IMPORT_QUEUE_NAME,
    async (job) => {
      const { jobId, companyId, applicationId, definitionSlug } = job.data;
      await processBulkImportJob(jobId, companyId, applicationId, definitionSlug);
    },
    {
      connection: getRedisConnection(),
      concurrency: 1,
    },
  );

  bulkImportWorker.on('failed', (job, err) => {
    logger.error(`Bulk import worker job ${job && job.id} failed: ${err.message}`);
  });

  bulkImportWorker.on('completed', (job) => {
    logger.info(`Bulk import worker job ${job.id} completed`);
  });

  logger.info('Bulk import worker started');
  return bulkImportWorker;
};

module.exports = {
  getBulkImportQueue,
  enqueueBulkImportJob,
  startBulkImportWorker,
};
