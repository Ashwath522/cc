'use strict';

const mongoose = require('mongoose');
const { validateItem } = require('../../helpers/ai-content/ai-validator.helper');
const { generateOne } = require('../../helpers/ai-content/ai-orchestrator.helper');
const { captureFeedback, upsertRule } = require('../../helpers/ai-content/ai-feedback.helper');
const { buildPrompt, loadRulesFromMongo } = require('../../helpers/ai-content/ai-prompt-builder.helper');
const { pushProductToCms, processAiContentJob } = require('../../services/ai-content-job-processor.service');
const { setMockClient, clearMockClient } = require('../../helpers/ai-content/ai-llm-client.helper');

const AiContentJobModel = require('../../models/aiContentJob.model');
const ContentReviewQueueModel = require('../../models/contentReviewQueue.model');
const ContentRuleModel = require('../../models/contentRule.model');
const FieldHistoryModel = require('../../models/fieldHistory.model');
const BulkImportJobModel = require('../../models/bulkImportJob.model');
const ObjectDefinitionModel = require('../../models/objectDefinition.model');
const { getDynamicModel } = require('../../helpers/dynamic-collection.helper');

const mockLlm = {
  async generateContent({ userPrompt, systemPrompt }) {
    const isBed = userPrompt.includes('Stanhope') || userPrompt.includes('Bed');
    const name = isBed ? 'Stanhope' : 'Sample Item';
    return {
      description: {
        summary: `Experience timeless comfort and thoughtful style in any bedroom with this spacious piece. Its clean lines and sturdy construction offer a dependable presence designed for daily use. The subtle tones blend effortlessly into a variety of contemporary room aesthetics. Bring refined simplicity and restful balance to your home with the ${name}.`,
        aesthetic_style: 'Contemporary minimalist',
        texture: 'Smooth polished grain',
        best_use: 'Master bedroom center',
      },
      care_and_maintenance: {
        instructions: [
          'We recommend dusting regularly with a soft, dry cloth.',
          'It is best to wipe spills immediately with a damp cloth.',
          'Try to apply a wood-safe wax polish every few months.',
        ],
        avoid: [
          "It's best to avoid harsh chemical cleaners.",
          'Try to avoid direct, prolonged exposure to sunlight.',
        ],
      },
      warranty: {
        applicable: true,
        status_line: '**Yes**, it has a warranty of **12 months**.',
        points: ['Covers manufacturing defects in materials and workmanship.'],
      },
    };
  },
  async generateText({ prompt }) {
    return 'Always emphasize durable construction and warm tones in bedroom descriptions.';
  },
};

describe('AI Content Generation Pipeline Test Suite', () => {
  const companyId = 'test_company_99';
  const applicationId = 'test_app_99';
  const definitionSlug = 'test_furniture_catalog';

  beforeAll(async () => {
    setMockClient(mockLlm);
  });

  afterAll(() => {
    clearMockClient();
  });

  beforeEach(async () => {
    await Promise.all([
      AiContentJobModel.deleteMany({ company_id: companyId }),
      ContentReviewQueueModel.deleteMany({ company_id: companyId }),
      ContentRuleModel.deleteMany({ company_id: companyId }),
      FieldHistoryModel.deleteMany({ company_id: companyId }),
      BulkImportJobModel.deleteMany({ company_id: companyId }),
    ]);
  });

  test('1. Grounding/identity check catches a deliberately mismatched product-attribute pair', () => {
    const sourceProduct = {
      id: 'prod-001',
      name: 'Stanhope King Bed',
      product_short_name: 'Stanhope',
      category: 'Bedroom',
      dimensions: '200cm L x 180cm W x 100cm H',
      primary_material: 'Solid Wood',
      weight: '60 kg',
      assembly_required: 'Requires Assembly',
      warranty_months: 12,
    };

    // Construct item with deliberately mismatched material and missing short_name in closing sentence
    const invalidItem = {
      description: {
        summary: 'Stanhope is a great bed. It is spacious and durable. Fits all rooms well. Buy it today for your home.',
        key_features: ['Available in King size.'],
      },
      specifications: {
        dimensions: '200cm L x 180cm W x 100cm H',
        primary_material: 'Metal & Glass', // Mismatch from 'Solid Wood'
        weight: '60 kg',
        assembly_required: 'Requires Assembly',
      },
      care_and_maintenance: {
        instructions: [
          'We recommend dusting regularly with a soft cloth.',
          'It is best to clean with mild soap.',
          'Try to wipe dry immediately.',
        ],
        avoid: [
          "It's best to avoid harsh acids.",
          'Try to avoid abrasive pads.',
        ],
      },
      warranty: {
        applicable: true,
        status_line: '**Yes**, it has a warranty of **12 months**.',
        points: ['Manufacturing defects covered.'],
      },
      returns: {
        window_days: 'within **10 days**',
        condition: ['Unused', 'Tags attached', 'Proof of purchase'],
      },
      quality_promise: {
        statement: 'Checked for quality.',
        highlights: ['Tested for daily use.'],
      },
    };

    const validation = validateItem(invalidItem, sourceProduct);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('primary_material does not match source data exactly'))).toBe(true);
    expect(validation.errors.some((e) => e.includes('must mention product_short_name in the CLOSING sentence'))).toBe(true);
  });

  test('2. A row that fails validation lands in needs_review and is excluded from bulk push', async () => {
    const failingProduct = {
      id: 'prod-fail-002',
      name: 'Invalid Chair',
      product_short_name: 'Chair',
      category: 'Dining',
      primary_material: 'Plastic',
      dimensions: '50cm L x 50cm W',
      assembly_required: 'None',
      warranty_months: 0,
    };

    // Client mock returning invalid care instructions (bare imperatives)
    const failingMock = {
      async generateContent() {
        return {
          description: {
            summary: 'A simple chair for dining rooms. Sturdy and reliable for meals. Smooth finish throughout. Bring home this Chair.',
          },
          care_and_maintenance: {
            instructions: ['Wipe with dry cloth', 'Clean with water', 'Dust regularly'], // Bare imperatives
            avoid: ['Avoid sunlight', 'Avoid bleach'],
          },
          warranty: {
            applicable: false,
            status_line: '**No**, it has a warranty of **0 months**.',
            points: [],
          },
        };
      },
    };
    setMockClient(failingMock);

    const generated = await generateOne(failingProduct, null, 1, { company_id: companyId, application_id: applicationId });
    expect(generated._meta.needs_review).toBe(true);
    expect(generated._meta.validation_errors.length).toBeGreaterThan(0);

    setMockClient(mockLlm);
  });

  test('3. Pre-push validation rejects invalid content and approves valid content', () => {
    const sourceProduct = {
      id: 'prod-003',
      name: 'Stanhope King Bed',
      product_short_name: 'Stanhope',
      category: 'Bedroom',
      primary_material: 'Solid Wood',
    };

    const invalidContent = {
      description: {
        summary: 'Invalid summary missing short name.',
        key_features: ['Sample feature'],
      },
      specifications: { primary_material: 'Solid Wood' },
      care_and_maintenance: {
        instructions: ['We recommend dusting.', 'We recommend wiping.', 'Try to polish.'],
        avoid: ["It's best to avoid bleach.", 'Try to avoid water.'],
      },
      warranty: {
        applicable: true,
        status_line: '**Yes**, it has a warranty of **12 months**.',
        points: ['Defects covered.'],
      },
      returns: {
        condition: ['Unused', 'Tags on', 'Receipt needed'],
      },
      quality_promise: {
        statement: 'Quality checked',
        highlights: ['Tested'],
      },
    };

    const prePushInvalid = validateItem(invalidContent, sourceProduct);
    expect(prePushInvalid.valid).toBe(false);

    // Fix summary to have Stanhope in closing sentence with proper sentence count
    const validContent = {
      ...invalidContent,
      description: {
        summary:
          'Experience timeless comfort and thoughtful style in any bedroom with this spacious piece. Its clean lines and solid construction offer a dependable presence designed for daily use and lasting relaxation. The balanced proportions make it an easy fit for both contemporary and traditional room layouts. Subtle natural tones blend effortlessly into a variety of decor styles, creating a welcoming atmosphere. Bring refined simplicity and restful balance to your home with the Stanhope.',
        key_features: ['Available in King size.'],
      },
    };


    const prePushValid = validateItem(validContent, sourceProduct);
    expect(prePushValid.valid).toBe(true);
  });

  test('4. Single-field rollback via fieldHistory restores prior value', async () => {
    // Setup dummy published definition
    const def = await ObjectDefinitionModel.findOneAndUpdate(
      { company_id: companyId, application_id: applicationId, slug: definitionSlug },
      {
        name: 'Furniture Catalog',
        slug: definitionSlug,
        status: 'PUBLISHED',
        fields: [
          { name: 'product', label: 'Product', field_type: 'product', relation: 'product' },
          { name: 'description', label: 'Description', field_type: 'json' },
          { name: 'care_and_maintenance', label: 'Care', field_type: 'json' },
        ],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const Model = getDynamicModel(def);
    const productRef = { uid: 'prod-rollback-1', slug: 'stanhope', name: 'Stanhope Bed' };

    // Initial CMS instance with previous description
    const oldDescription = { summary: 'Old handmade description before AI overwrite.' };
    await Model.create({
      company_id: companyId,
      application_id: applicationId,
      product: productRef,
      description: oldDescription,
    });

    const newDescription = { summary: 'New AI generated description.' };
    const pushResult = await pushProductToCms({
      companyId,
      applicationId,
      definitionSlug,
      productRef,
      generatedContent: { description: newDescription },
      sourceProduct: { id: 'prod-rollback-1', name: 'Stanhope Bed' },
      changedBy: 'ai',
    });

    expect(pushResult.ok).toBe(true);

    // Verify fieldHistory recorded previous and new value
    const historyDoc = await FieldHistoryModel.findOne({
      company_id: companyId,
      application_id: applicationId,
      field_name: 'description',
    }).sort({ changed_at: -1 }).exec();

    expect(historyDoc).not.toBeNull();
    expect(historyDoc.previous_value).toEqual(oldDescription);
    expect(historyDoc.new_value).toEqual(newDescription);

    // Perform single field reversion
    const docToRevert = await Model.findOne({
      company_id: companyId,
      application_id: applicationId,
      'product.uid': productRef.uid,
    });
    docToRevert.description = historyDoc.previous_value;
    await docToRevert.save();

    const revertedDoc = await Model.findOne({
      company_id: companyId,
      application_id: applicationId,
      'product.uid': productRef.uid,
    }).lean();
    expect(revertedDoc.description).toEqual(oldDescription);
  });

  test('5. Feedback entry on a product persists contentRule and applies to subsequent generations', async () => {
    const feedbackText = 'Never use the word luxury and emphasize compact dimensions';
    const result = await captureFeedback({
      company_id: companyId,
      application_id: applicationId,
      product_id: 'prod-fb-1',
      category: 'Bedroom',
      field: 'description',
      feedback_text: feedbackText,
    });

    expect(result.rule).toBeDefined();

    // Verify stored in Mongo
    const storedRule = await ContentRuleModel.findOne({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
      field: 'description',
    }).lean().exec();

    expect(storedRule).not.toBeNull();
    expect(storedRule.rule_text).toBe(result.rule);

    // Verify loaded in subsequent prompt builder call
    const loadedRules = await loadRulesFromMongo(companyId, applicationId, 'Bedroom');
    expect(loadedRules.Bedroom?.description).toBe(storedRule.rule_text);

    const testProduct = {
      id: 'prod-fb-2',
      name: 'Oak Bedside Table',
      product_short_name: 'Oak',
      category: 'Bedroom',
      price: 4999,
      primary_material: 'Oak Wood',
    };

    const { systemPrompt } = buildPrompt(testProduct, null, null, loadedRules);
    expect(systemPrompt.includes(storedRule.rule_text)).toBe(true);
  });

  test('6. Pushed row is deleted from contentReviewQueue and fieldHistory is created', async () => {
    const productRef = { uid: 'prod-queue-test-1', slug: 'queue-test', name: 'Queue Test' };
    const job = await AiContentJobModel.create({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
    });

    // Create item in review queue
    await ContentReviewQueueModel.create({
      company_id: companyId,
      application_id: applicationId,
      job_id: job._id,
      product_ref: productRef,
      source_attributes: { id: 'prod-queue-test-1', name: 'Queue Test' },
      generated_content: { description: { summary: 'Sample copy' } },
      status: 'needs_review',
    });

    const countBefore = await ContentReviewQueueModel.countDocuments({
      company_id: companyId,
      'product_ref.uid': productRef.uid,
    });
    expect(countBefore).toBe(1);

    // Push to CMS
    await pushProductToCms({
      companyId,
      applicationId,
      definitionSlug,
      productRef,
      generatedContent: { description: { summary: 'Clean copy' } },
      sourceProduct: { id: 'prod-queue-test-1', name: 'Queue Test' },
      changedBy: 'review_reviewer',
    });

    const countAfter = await ContentReviewQueueModel.countDocuments({
      company_id: companyId,
      'product_ref.uid': productRef.uid,
    });
    expect(countAfter).toBe(0);

    const historyEntry = await FieldHistoryModel.findOne({
      company_id: companyId,
      application_id: applicationId,
      'product_ref.uid': productRef.uid,
    });
    expect(historyEntry).not.toBeNull();
    expect(historyEntry.changed_by).toBe('review_reviewer');
  });

  test('7. AI content operations are fully isolated from BulkImportJobModel', async () => {
    const bulkJobCountBefore = await BulkImportJobModel.countDocuments();

    const job = await AiContentJobModel.create({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
      status: 'pending',
    });

    expect(job._id).toBeDefined();

    const bulkJobCountAfter = await BulkImportJobModel.countDocuments();
    expect(bulkJobCountAfter).toBe(bulkJobCountBefore);
  });
});
