'use strict';

const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ContentReviewQueueModel = require('../../models/contentReviewQueue.model');
const FieldHistoryModel = require('../../models/fieldHistory.model');
const ObjectDefinitionModel = require('../../models/objectDefinition.model');
const { AI_CONTENT_ROW_STATUS } = require('../../constants/constant');
const { getDynamicModel } = require('../../helpers/dynamic-collection.helper');
const { validateItem } = require('../../helpers/ai-content/ai-validator.helper');
const { generateOne } = require('../../helpers/ai-content/ai-orchestrator.helper');
const { pushProductToCms, findPublishedDefinition } = require('../../services/ai-content-job-processor.service');
const { captureFeedback } = require('../../helpers/ai-content/ai-feedback.helper');

const listReviewRows = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const { jobId } = req.params;
  const { status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const query = { company_id: companyId, application_id: applicationId };
    if (jobId) {
      query.job_id = jobId;
    }
    if (status) {
      query.status = status;
    }

    const [rows, total] = await Promise.all([
      ContentReviewQueueModel.find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      ContentReviewQueueModel.countDocuments(query).exec(),
    ]);

    return res.json({
      rows,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error(`[listReviewRows] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const editReviewRow = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id || req.body.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.body.application_id;
  const { rowId } = req.params;
  const { generated_content } = req.body;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const row = await ContentReviewQueueModel.findOne({
      _id: rowId,
      company_id: companyId,
      application_id: applicationId,
    }).exec();

    if (!row) {
      return res.status(404).json({ error: 'Review item not found' });
    }

    const oldContent = row.generated_content || {};
    const newContent = { ...oldContent, ...(generated_content || {}) };

    // Track which top-level or nested fields were human edited
    const humanEdited = new Set(row.human_edited_fields || []);
    for (const key of Object.keys(generated_content || {})) {
      if (JSON.stringify(oldContent[key]) !== JSON.stringify(generated_content[key])) {
        humanEdited.add(key);
      }
    }

    // Run validator on updated content
    const validation = validateItem(newContent, row.source_attributes);

    row.generated_content = newContent;
    row.validation_result = validation;
    row.human_edited_fields = Array.from(humanEdited);
    row.status = validation.valid ? AI_CONTENT_ROW_STATUS.APPROVED : AI_CONTENT_ROW_STATUS.NEEDS_REVIEW;

    await row.save();

    return res.json({
      success: true,
      row,
      validation,
    });
  } catch (error) {
    logger.error(`[editReviewRow] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const regenerateReviewRow = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const { rowId } = req.params;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const row = await ContentReviewQueueModel.findOne({
      _id: rowId,
      company_id: companyId,
      application_id: applicationId,
    }).exec();

    if (!row) {
      return res.status(404).json({ error: 'Review item not found' });
    }

    const generated = await generateOne(
      row.source_attributes,
      null,
      1,
      { company_id: companyId, application_id: applicationId },
    );

    const validation = validateItem(generated, row.source_attributes);

    row.generated_content = generated;
    row.validation_result = validation;
    row.human_edited_fields = [];
    row.status = validation.valid && !generated._meta?.needs_review
      ? AI_CONTENT_ROW_STATUS.CLEAN
      : AI_CONTENT_ROW_STATUS.NEEDS_REVIEW;

    await row.save();

    return res.json({
      success: true,
      row,
      validation,
    });
  } catch (error) {
    logger.error(`[regenerateReviewRow] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const pushReviewRow = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.query.application_id;
  const { rowId } = req.params;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const row = await ContentReviewQueueModel.findOne({
      _id: rowId,
      company_id: companyId,
      application_id: applicationId,
    }).exec();

    if (!row) {
      return res.status(404).json({ error: 'Review item not found' });
    }

    // Must re-run validator immediately before push
    const prePushValidation = validateItem(row.generated_content, row.source_attributes);
    if (!prePushValidation.valid) {
      return res.status(400).json({
        error: 'Cannot push invalid content. Please resolve validation errors first.',
        validation: prePushValidation,
      });
    }

    const result = await pushProductToCms({
      companyId,
      applicationId,
      definitionSlug: row.definition_slug,
      productRef: row.product_ref,
      generatedContent: row.generated_content,
      sourceProduct: row.source_attributes,
      changedBy: req.body.changed_by || 'human_review',
    });

    // Explicitly delete review queue row upon successful push
    await ContentReviewQueueModel.deleteOne({ _id: row._id }).exec();

    return res.json({
      success: true,
      message: 'Product pushed to CMS successfully and removed from review queue',
      result,
    });
  } catch (error) {
    logger.error(`[pushReviewRow] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const revertField = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id || req.body.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.body.application_id;
  const { fieldHistoryId } = req.params;

  try {
    if (!companyId || !applicationId) {
      return res.status(400).json({ error: 'company_id and application_id are required' });
    }

    const history = await FieldHistoryModel.findOne({
      _id: fieldHistoryId,
      company_id: companyId,
      application_id: applicationId,
    }).exec();

    if (!history) {
      return res.status(404).json({ error: 'Field history record not found' });
    }

    const definitionSlug = history.definition_slug;
    if (!definitionSlug) {
      return res.status(400).json({ error: 'No definition slug attached to history record' });
    }

    const definition = await findPublishedDefinition(companyId, applicationId, definitionSlug);
    if (!definition) {
      return res.status(404).json({ error: 'Published definition not found' });
    }

    const Model = getDynamicModel(definition);
    const prodField = definition.fields.find((f) => f.field_type === 'product' || f.relation === 'product');

    const query = {
      company_id: companyId,
      application_id: applicationId,
    };
    if (prodField && history.product_ref?.uid) {
      query[`${prodField.name}.uid`] = history.product_ref.uid;
    } else {
      return res.status(400).json({ error: 'Product reference UID missing from history record' });
    }

    const existingDoc = await Model.findOne(query).exec();
    if (!existingDoc) {
      return res.status(404).json({ error: 'Target CMS document not found' });
    }

    const currentValue = existingDoc[history.field_name];
    const targetRevertedValue = history.previous_value;

    // Single-document atomic update for just that one field
    existingDoc[history.field_name] = targetRevertedValue;
    await existingDoc.save();

    // Write a new FieldHistory record recording the rollback
    const rollbackHistory = await FieldHistoryModel.create({
      company_id: companyId,
      application_id: applicationId,
      definition_slug: definitionSlug,
      product_ref: history.product_ref,
      field_name: history.field_name,
      previous_value: currentValue,
      new_value: targetRevertedValue,
      changed_by: req.body.changed_by || 'human_revert',
      changed_at: new Date(),
    });

    return res.json({
      success: true,
      message: `Successfully reverted field ${history.field_name}`,
      field_name: history.field_name,
      reverted_to: targetRevertedValue,
      history_entry: rollbackHistory,
    });
  } catch (error) {
    logger.error(`[revertField] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  const companyId = req.headers['x-company-id'] || req.query.company_id || req.body.company_id;
  const applicationId = req.params.application_id || req.headers['x-application-id'] || req.body.application_id;
  const { product_id, category, field, original_output, feedback_text, variant } = req.body;

  try {
    if (!companyId || !applicationId || !category || !field || !feedback_text) {
      return res.status(400).json({ error: 'company_id, application_id, category, field, and feedback_text are required' });
    }

    const result = await captureFeedback({
      company_id: companyId,
      application_id: applicationId,
      product_id: product_id || '',
      category,
      field,
      original_output: original_output || '',
      feedback_text,
      variant,
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback captured and rule stored',
      rule: result.rule,
    });
  } catch (error) {
    logger.error(`[submitFeedback] Error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  listReviewRows,
  editReviewRow,
  regenerateReviewRow,
  pushReviewRow,
  revertField,
  submitFeedback,
};
