'use strict';

const logger = require('../../common/logger');
const { generateText } = require('./ai-llm-client.helper');
const ContentRule = require('../../models/contentRule.model');

const MAX_VARIANTS_BEFORE_CONSOLIDATION = 5;

/**
 * Step 1: Logs feedback event into the logging pipeline.
 */
function logFeedback({ company_id, application_id, product_id, category, field, original_output, feedback_text }) {
  const entry = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    company_id,
    application_id,
    product_id,
    category,
    field,
    original_output,
    feedback_text,
    timestamp: new Date().toISOString(),
  };
  logger.info(`[AIFeedback] Feedback recorded: ${JSON.stringify(entry)}`);
  return entry;
}

/**
 * Step 2: Separate LLM call to compress raw feedback into a concise rule.
 */
async function compressFeedbackToRule(feedbackText, category, field, options = {}) {
  const prompt = `Summarize this feedback into one short, reusable instruction for
future content generation in this category. Be specific and actionable.
Return ONLY the instruction sentence, nothing else.

Category: ${category}
Field: ${field}
Feedback: ${feedbackText}`;

  const text = await generateText({ prompt, options });
  return text.trim();
}

/**
 * Step 3: Upserts the rule in Mongo scoped to company_id + application_id + category + field.
 */
async function upsertRule({ company_id, application_id, category, field, rule_text, variant }) {
  const targetKey = variant ? `${field}__${variant}` : field;

  const result = await ContentRule.findOneAndUpdate(
    { company_id, application_id, category, field: targetKey },
    { rule_text, updated_at: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  return result;
}

/**
 * Step 4: Consolidate variants if variant count exceeds MAX_VARIANTS_BEFORE_CONSOLIDATION.
 */
async function consolidateIfNeeded({ company_id, application_id, category, field, options = {} }) {
  const query = {
    company_id,
    application_id,
    category,
    $or: [
      { field },
      { field: new RegExp(`^${field}__`) },
    ],
  };

  const existingRules = await ContentRule.find(query).exec();
  if (existingRules.length <= MAX_VARIANTS_BEFORE_CONSOLIDATION) {
    return existingRules;
  }

  const combinedText = existingRules.map((r) => `- ${r.rule_text}`).join('\n');
  const prompt = `Merge these ${existingRules.length} rules into 2-3 combined,
non-redundant instructions for "${field}" content in the "${category}" category.
Return them as a single short paragraph.

Rules:
${combinedText}`;

  const merged = await generateText({ prompt, options });

  // Delete existing variant entries
  await ContentRule.deleteMany(query).exec();

  // Insert single consolidated base rule
  const consolidated = await ContentRule.create({
    company_id,
    application_id,
    category,
    field,
    rule_text: merged.trim(),
  });

  return [consolidated];
}

/**
 * End-to-end convenience wrapper: log -> compress -> upsert -> consolidate.
 */
async function captureFeedback({
  company_id,
  application_id,
  product_id,
  category,
  field,
  original_output,
  feedback_text,
  variant,
  options = {},
}) {
  const entry = logFeedback({ company_id, application_id, product_id, category, field, original_output, feedback_text });
  const compressedRule = await compressFeedbackToRule(feedback_text, category, field, options);
  await upsertRule({ company_id, application_id, category, field, rule_text: compressedRule, variant });
  await consolidateIfNeeded({ company_id, application_id, category, field, options });
  return { entry, rule: compressedRule };
}

module.exports = {
  logFeedback,
  compressFeedbackToRule,
  upsertRule,
  consolidateIfNeeded,
  captureFeedback,
};
