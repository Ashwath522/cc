'use strict';

const Sentry = require('@sentry/node');
const logger = require('../common/logger');
const { appRedis } = require('../common/redis.init');
const AiContentJobModel = require('../models/aiContentJob.model');
const ContentReviewQueueModel = require('../models/contentReviewQueue.model');
const FieldHistoryModel = require('../models/fieldHistory.model');
const ObjectDefinitionModel = require('../models/objectDefinition.model');
const {
  AI_CONTENT_JOB_STATUS,
  AI_CONTENT_ROW_STATUS,
  AI_CONTENT_PRODUCT_BATCH_SIZE,
} = require('../constants/constant');
const { getDynamicModel } = require('../helpers/dynamic-collection.helper');
const { upsertBulkImportRow } = require('../helpers/cms-bulk-upsert.helper');
const { getProductsByCategoryPaginated, catalogItemToProductRef } = require('../routes/services/product.service');
const { transformCatalogItemToProduct } = require('../helpers/ai-content/ai-attribute-transform.helper');
const { generateOne } = require('../helpers/ai-content/ai-orchestrator.helper');
const { validateItem } = require('../helpers/ai-content/ai-validator.helper');

/**
 * Finds published definition for a slug.
 */
const findPublishedDefinition = async (companyId, applicationId, slug) =>
  ObjectDefinitionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    slug,
    status: 'PUBLISHED',
  })
    .lean()
    .exec();

/**
 * Maps generated AI content and source product into CMS instance payload.
 */
function buildCmsPayloadFromGenerated(definition, productRef, generatedContent, sourceProduct) {
  const payload = {};
  if (!definition || !Array.isArray(definition.fields)) {
    return payload;
  }

  for (const field of definition.fields) {
    const fieldName = field.name;

    // Link product reference if field is of type 'product'
    if (field.field_type === 'product' || field.relation === 'product') {
      payload[fieldName] = productRef;
      continue;
    }

    // Direct match from generated content
    if (generatedContent[fieldName] !== undefined) {
      payload[fieldName] = generatedContent[fieldName];
      continue;
    }

    // Nested match (e.g. summary or key_features)
    if (fieldName === 'summary' && generatedContent.description?.summary) {
      payload[fieldName] = generatedContent.description.summary;
      continue;
    }
    if (fieldName === 'key_features' && generatedContent.description?.key_features) {
      payload[fieldName] = generatedContent.description.key_features;
      continue;
    }

    // Specifications fallback
    if (generatedContent.specifications && generatedContent.specifications[fieldName] !== undefined) {
      payload[fieldName] = generatedContent.specifications[fieldName];
      continue;
    }

    // Source product fallback (e.g. name, price)
    if (sourceProduct && sourceProduct[fieldName] !== undefined) {
      payload[fieldName] = sourceProduct[fieldName];
    }
  }

  return payload;
}

/**
 * Pushes a single validated product to CMS, records field history, and deletes any review queue row.
 */
async function pushProductToCms({
  companyId,
  applicationId,
  definitionSlug,
  productRef,
  generatedContent,
  sourceProduct,
  changedBy = 'ai',
}) {
  if (!definitionSlug) {
    return { ok: true, skippedCms: true };
  }

  const definition = await findPublishedDefinition(companyId, applicationId, definitionSlug);
  if (!definition) {
    throw new Error(`Published definition not found for slug: ${definitionSlug}`);
  }

  const Model = getDynamicModel(definition);
  const payload = buildCmsPayloadFromGenerated(definition, productRef, generatedContent, sourceProduct);
  payload.company_id = companyId;
  payload.application_id = applicationId;

  // Query existing doc to record fieldHistory previous values
  let existingDoc = null;
  if (productRef && productRef.uid) {
    const prodField = definition.fields.find((f) => f.field_type === 'product' || f.relation === 'product');
    const query = {
      company_id: companyId,
      application_id: applicationId,
    };
    if (prodField) {
      query[`${prodField.name}.uid`] = productRef.uid;
    }
    existingDoc = await Model.findOne(query).lean().exec();
  }

  const upsertResult = await upsertBulkImportRow({
    Model,
    payload,
    definition,
    companyId,
    applicationId,
  });

  if (!upsertResult.ok) {
    throw new Error(`Failed to upsert to CMS: ${upsertResult.error || 'Unknown error'}`);
  }

  // Record field history for every generated field pushed
  const fieldsToRecord = ['description', 'care_and_maintenance', 'warranty', 'returns', 'quality_promise', 'specifications'];
  for (const fieldName of fieldsToRecord) {
    if (generatedContent[fieldName] !== undefined) {
      const prevVal = existingDoc ? existingDoc[fieldName] : null;
      const newVal = generatedContent[fieldName];

      await FieldHistoryModel.create({
        company_id: companyId,
        application_id: applicationId,
        definition_slug: definitionSlug,
        product_ref: productRef,
        field_name: fieldName,
        previous_value: prevVal,
        new_value: newVal,
        changed_by: changedBy,
        changed_at: new Date(),
      });
    }
  }

  // Explicitly remove row from ContentReviewQueue on push
  if (productRef && productRef.uid) {
    await ContentReviewQueueModel.deleteMany({
      company_id: companyId,
      application_id: applicationId,
      'product_ref.uid': productRef.uid,
    }).exec();
  }

  return { ok: true, id: upsertResult.id, updated: upsertResult.updated };
}

/**
 * Main orchestration loop for processing an AI content job.
 */
async function processAiContentJob(jobId, companyId, applicationId, options = {}) {
  logger.info(`[processAiContentJob] Starting job ${jobId} (company: ${companyId}, app: ${applicationId})`);

  const job = await AiContentJobModel.findOne({
    _id: jobId,
    company_id: companyId,
    application_id: applicationId,
  }).exec();

  if (!job) {
    logger.error(`[processAiContentJob] Job ${jobId} not found`);
    return;
  }

  job.status = AI_CONTENT_JOB_STATUS.PROCESSING;
  job.started_at = new Date();
  await job.save();

  try {
    const categoryIds = job.category_ids && job.category_ids.length > 0 ? job.category_ids : (job.category ? [job.category] : []);
    const definitionSlug = job.definition_slug;
    const selectedTone = job.selected_tone || options.selected_tone || 'auto';

    let pageId = '*';
    let hasMore = true;
    let totalProcessed = 0;
    let cleanCount = 0;
    let needsReviewCount = 0;
    let pushedCount = 0;
    let failedCount = 0;

    const recentHashesInBatch = [];
    const batchHistory = [];

    while (hasMore) {
      let pageResponse;
      try {
        pageResponse = await getProductsByCategoryPaginated({
          companyId,
          categoryIds,
          pageSize: AI_CONTENT_PRODUCT_BATCH_SIZE,
          pageId,
          allowSeedFallback: options.allowSeedFallback !== undefined ? options.allowSeedFallback : true,
          catalogSource: options.catalogSource || null,
        });
      } catch (fetchErr) {
        logger.error(`[processAiContentJob] Error fetching products page: ${fetchErr.message}`);
        throw fetchErr;
      }

      const items = pageResponse.items || [];
      if (!items.length) {
        break;
      }

      const workerId = options.workerId || `worker:${process.pid}:${jobId}`;

      // Process products sequentially one by one to avoid cross-product contamination
      for (const rawItem of items) {
        const product = transformCatalogItemToProduct(rawItem);
        const productRef = catalogItemToProductRef(rawItem) || {
          uid: product.id,
          slug: product.slug || '',
          name: product.name || '',
        };
        const productId = product.id || product.uid || rawItem.uid || rawItem.id;

        // Atomic product claim pattern via Redis SETNX:
        const claimKey = `claim:product:${companyId}:${productId}`;
        const acquired = await appRedis.set(claimKey, workerId, 'NX', 'EX', 300);
        if (!acquired) {
          logger.info(`[processAiContentJob] Product ${productId} already claimed by another worker. Skipping collision-free.`);
          continue;
        }

        try {
          totalProcessed++;

          const generated = await generateOne(
            product,
            null,
            1,
            {
              company_id: companyId,
              application_id: applicationId,
              selected_tone: selectedTone,
              job_id: job._id,
              product_ref: productRef,
              recentHashesInBatch,
              batchHistory,
              options,
            },
          );

          // Re-validate immediately before push
          const prePushValidation = validateItem(generated, product, { selectedTone });
          const initialAttempts = generated._meta?.direction?.hash ? [
            {
              attempt_number: 1,
              profile_hash: generated._meta.direction.hash,
              generated_content: generated,
              timestamp: new Date(),
            },
          ] : [];

          if (prePushValidation.valid && !generated._meta?.needs_review) {
            cleanCount++;
            // Push to CMS if definition is present
            if (definitionSlug) {
              await pushProductToCms({
                companyId,
                applicationId,
                definitionSlug,
                productRef,
                generatedContent: generated,
                sourceProduct: product,
                changedBy: 'ai',
              });
              pushedCount++;
            }
            // Always persist row into ContentReviewQueue for review audit & Excel export
            await ContentReviewQueueModel.create({
              company_id: companyId,
              application_id: applicationId,
              job_id: job._id,
              definition_slug: definitionSlug,
              product_ref: productRef,
              source_attributes: product,
              generated_content: generated,
              validation_result: prePushValidation,
              status: definitionSlug ? AI_CONTENT_ROW_STATUS.PUSHED : AI_CONTENT_ROW_STATUS.CLEAN,
              human_edited_fields: [],
              generation_attempts: initialAttempts,
            });
          } else {
            // Save to ContentReviewQueue
            needsReviewCount++;
            await ContentReviewQueueModel.create({
              company_id: companyId,
              application_id: applicationId,
              job_id: job._id,
              definition_slug: definitionSlug,
              product_ref: productRef,
              source_attributes: product,
              generated_content: generated,
              validation_result: prePushValidation,
              status: AI_CONTENT_ROW_STATUS.NEEDS_REVIEW,
              human_edited_fields: [],
              generation_attempts: initialAttempts,
            });
          }
        } catch (itemErr) {
          logger.error(`[processAiContentJob] Error processing product ${product?.id}: ${itemErr.message}`);
          failedCount++;
          needsReviewCount++;
          await ContentReviewQueueModel.create({
            company_id: companyId,
            application_id: applicationId,
            job_id: job._id,
            definition_slug: definitionSlug,
            product_ref: productRef,
            source_attributes: product,
            generated_content: {},
            validation_result: { valid: false, errors: [itemErr.message] },
            status: AI_CONTENT_ROW_STATUS.FAILED,
          });
        } finally {
          // Release atomic product claim
          await appRedis.del(claimKey);
        }

        // Periodically update job progress
        if (totalProcessed % 10 === 0) {
          job.total_count = totalProcessed;
          job.clean_count = cleanCount;
          job.needs_review_count = needsReviewCount;
          job.pushed_count = pushedCount;
          job.failed_count = failedCount;
          await job.save();
        }
      }

      pageId = pageResponse.page?.next_id;
      hasMore = Boolean(pageResponse.page?.has_next && pageId);
    }

    job.status = AI_CONTENT_JOB_STATUS.COMPLETED;
    job.total_count = totalProcessed;
    job.clean_count = cleanCount;
    job.needs_review_count = needsReviewCount;
    job.pushed_count = pushedCount;
    job.failed_count = failedCount;
    job.completed_at = new Date();
    await job.save();

    logger.info(`[processAiContentJob] Completed job ${jobId} (total: ${totalProcessed}, clean: ${cleanCount}, needs_review: ${needsReviewCount}, pushed: ${pushedCount})`);
  } catch (err) {
    logger.error(`[processAiContentJob] Job ${jobId} failed: ${err.message}`);
    Sentry.captureException(err);
    job.status = AI_CONTENT_JOB_STATUS.FAILED;
    job.error_message = err.message;
    job.completed_at = new Date();
    await job.save();
  }
}

/**
 * Generates 2-3 preview products for on-screen tone evaluation without running full run or CMS push.
 */
async function generatePreviewProducts({
  companyId,
  applicationId,
  category,
  categoryIds,
  tone = 'auto',
  count = 3,
  options = {},
}) {
  const cats = categoryIds && categoryIds.length > 0 ? categoryIds : (category ? [category] : []);
  const pageResponse = await getProductsByCategoryPaginated({
    companyId,
    categoryIds: cats,
    pageSize: Math.max(1, count),
    pageId: '*',
    allowSeedFallback: options.allowSeedFallback !== undefined ? options.allowSeedFallback : true,
    catalogSource: options.catalogSource || null,
  });

  const rawItems = (pageResponse?.items || []).slice(0, count);
  const previewResults = [];

  for (const rawItem of rawItems) {
    const product = transformCatalogItemToProduct(rawItem);
    const productRef = catalogItemToProductRef(rawItem) || {
      uid: product.id,
      slug: product.slug || '',
      name: product.name || '',
    };

    const generated = await generateOne(
      product,
      null,
      1,
      { company_id: companyId, application_id: applicationId, selected_tone: tone },
    );

    const validation = validateItem(generated, product, { selectedTone: tone });

    previewResults.push({
      product_ref: productRef,
      source_product: product,
      generated_content: generated,
      validation,
      tone,
    });
  }

  return {
    preview_products: previewResults,
    product_refs: previewResults.map((r) => r.product_ref),
  };
}

module.exports = {
  processAiContentJob,
  generatePreviewProducts,
  pushProductToCms,
  buildCmsPayloadFromGenerated,
  findPublishedDefinition,
};
