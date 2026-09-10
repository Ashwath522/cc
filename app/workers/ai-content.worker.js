'use strict';

const { Queue, Worker } = require('bullmq');
const config = require('../common/config');
const logger = require('../common/logger');
const { AI_CONTENT_QUEUE_NAME } = require('../constants/constant');
const { processAiContentJob } = require('../services/ai-content-job-processor.service');

let aiContentQueue = null;
let aiContentWorker = null;

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

const getAiContentQueue = () => {
  if (!aiContentQueue) {
    aiContentQueue = new Queue(AI_CONTENT_QUEUE_NAME, {
      connection: getRedisConnection(),
    });
  }
  return aiContentQueue;
};

const enqueueAiContentJob = async ({ jobId, companyId, applicationId, options = {} }) => {
  try {
    const queue = getAiContentQueue();
    await queue.add(
      'process',
      { jobId: String(jobId), companyId, applicationId, options },
      {
        jobId: String(jobId),
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  } catch (err) {
    logger.warn(`[enqueueAiContentJob] Could not enqueue to Redis (${err.message}). Running in background tick.`);
    setImmediate(() => {
      processAiContentJob(jobId, companyId, applicationId, options).catch((e) => {
        logger.error(`[processAiContentJob] Error in background task: ${e.message}`);
      });
    });
  }
};

const startAiContentWorker = () => {
  if (aiContentWorker) {
    return aiContentWorker;
  }

  try {
    aiContentWorker = new Worker(
      AI_CONTENT_QUEUE_NAME,
      async (job) => {
        const { jobId, companyId, applicationId, options } = job.data;
        await processAiContentJob(jobId, companyId, applicationId, options);
      },
      {
        connection: getRedisConnection(),
        concurrency: 1,
      },
    );

    aiContentWorker.on('failed', (job, err) => {
      logger.error(`AI content worker job ${job && job.id} failed: ${err.message}`);
    });

    aiContentWorker.on('completed', (job) => {
      logger.info(`AI content worker job ${job && job.id} completed`);
    });

    logger.info('AI content worker started');
    return aiContentWorker;
  } catch (err) {
    logger.warn(`[startAiContentWorker] Could not connect worker to Redis: ${err.message}`);
    return null;
  }
};

module.exports = {
  getAiContentQueue,
  enqueueAiContentJob,
  startAiContentWorker,
};
