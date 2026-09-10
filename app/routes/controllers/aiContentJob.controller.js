'use strict';

const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const AiContentJobModel = require('../../models/aiContentJob.model');
const { AI_CONTENT_JOB_STATUS } = require('../../constants/constant');
const { enqueueAiContentJob } = require('../../workers/ai-content.worker');

const startAiContentJob = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id || req.body.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.body.application_id;
  const { category, category_ids, definition_slug, created_by } = req.body;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const cats = category_ids && Array.isArray(category_ids) && category_ids.length > 0
      ? category_ids
      : (category ? [category] : []);

    if (!cats.length) {
      return res.status(400).json({ error: 'At least one category or category_id must be selected' });
    }

    const job = await AiContentJobModel.create({
      company_id: companyId,
      application_id: applicationId,
      category: cats[0] || '',
      category_ids: cats,
      definition_slug: definition_slug || '',
      status: AI_CONTENT_JOB_STATUS.PENDING,
      created_by: created_by || '',
    });

    await enqueueAiContentJob({
      jobId: job._id,
      companyId,
      applicationId,
      options: req.body.options || {},
    });

    return res.status(201).json({
      success: true,
      message: 'AI Content Generation job started',
      job,
    });
  } catch (error) {
    logger.error(`[startAiContentJob] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const listAiContentJobs = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const query = { company_id: companyId, application_id: applicationId };
    const [jobs, total] = await Promise.all([
      AiContentJobModel.find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      AiContentJobModel.countDocuments(query).exec(),
    ]);

    return res.json({
      jobs,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error(`[listAiContentJobs] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getAiContentJobStatus = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const { jobId } = req.params;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const job = await AiContentJobModel.findOne({
      _id: jobId,
      company_id: companyId,
      application_id: applicationId,
    })
      .lean()
      .exec();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json({ job });
  } catch (error) {
    logger.error(`[getAiContentJobStatus] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  startAiContentJob,
  listAiContentJobs,
  getAiContentJobStatus,
};
