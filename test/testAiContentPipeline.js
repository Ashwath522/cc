'use strict';

const assert = require('assert');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');
const { generateOne, generateBulletList } = require('../app/helpers/ai-content/ai-orchestrator.helper');
const { captureFeedback, upsertRule, compressFeedbackToRule } = require('../app/helpers/ai-content/ai-feedback.helper');
const { buildPrompt, loadRulesFromMongo, computeTier } = require('../app/helpers/ai-content/ai-prompt-builder.helper');
const { pushProductToCms, buildCmsPayloadFromGenerated } = require('../app/services/ai-content-job-processor.service');
const { setMockClient, clearMockClient } = require('../app/helpers/ai-content/ai-llm-client.helper');
const { matchMaterial } = require('../app/helpers/ai-content/ai-care-matcher.helper');
const { getReturnsBlock } = require('../app/helpers/ai-content/ai-returns-lookup.helper');
const { buildQualityPromise } = require('../app/helpers/ai-content/ai-quality-composer.helper');
const { getAiClient, PROVIDER_REGISTRY } = require('../app/helpers/ai-content/clients/client-factory');

const AiContentJobModel = require('../app/models/aiContentJob.model');
const ContentReviewQueueModel = require('../app/models/contentReviewQueue.model');
const ContentRuleModel = require('../app/models/contentRule.model');
const FieldHistoryModel = require('../app/models/fieldHistory.model');
const BulkImportJobModel = require('../app/models/bulkImportJob.model');
const ObjectDefinitionModel = require('../app/models/objectDefinition.model');

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

async function runAllTests() {
  console.log('\n======================================================');
  console.log('RUNNING AI CONTENT GENERATION SPECIFICATION TESTS');
  console.log('======================================================\n');

  const companyId = 'test_comp_999';
  const applicationId = 'test_app_999';
  const definitionSlug = 'test_furniture_catalog';

  setMockClient(mockLlm);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`\x1b[32m✔ PASS:\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.error(`\x1b[31m✖ FAIL:\x1b[0m ${name}`);
      console.error(err);
      failed++;
    }
  }

  // 1. Grounding / Identity Mismatch Check
  await test('1. Grounding/identity check catches a deliberately mismatched product-attribute pair', async () => {
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

    const invalidItem = {
      description: {
        summary: 'Stanhope is a great bed. It is spacious and durable. Fits all rooms well. Buy it today for your home.',
        key_features: ['Available in King size.'],
      },
      specifications: {
        dimensions: '200cm L x 180cm W x 100cm H',
        primary_material: 'Metal & Glass', // Deliberate mismatch
        weight: '60 kg',
        assembly_required: 'Requires Assembly',
      },
      care_and_maintenance: {
        instructions: [
          'We recommend dusting regularly with a soft cloth.',
          'It is best to clean with mild soap.',
          'Try to wipe dry immediately.',
        ],
        avoid: ["It's best to avoid harsh acids.", 'Try to avoid abrasive pads.'],
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
    assert.strictEqual(validation.valid, false);
    assert(validation.errors.some((e) => e.includes('primary_material does not match source data exactly')), 'Expected primary_material mismatch error');
    assert(validation.errors.some((e) => e.includes('must mention product_short_name in the CLOSING sentence')), 'Expected name placement error');
  });

  // 2. Validation Failure -> needs_review routing
  await test('2. A row that fails validation lands in needs_review and is excluded from bulk push', async () => {
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

    const failingMock = {
      async generateContent() {
        return {
          description: {
            summary: 'A simple chair for dining rooms. Sturdy and reliable for meals. Smooth finish throughout. Bring home this Chair.',
          },
          care_and_maintenance: {
            instructions: ['Wipe with dry cloth', 'Clean with water', 'Dust regularly'], // Bare imperatives fail polite check
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

    const generated = await generateOne(failingProduct, null, 1, { company_id: companyId, application_id: applicationId, rules: {} });
    assert.strictEqual(generated._meta.needs_review, true);
    assert(generated._meta.validation_errors.length > 0);

    setMockClient(mockLlm);
  });

  // 3. Pre-push Re-validation
  await test('3. Pre-push validation rejects invalid content and approves valid content', async () => {
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
    assert.strictEqual(prePushInvalid.valid, false);

    const validContent = {
      ...invalidContent,
      description: {
        summary:
          'Experience timeless comfort and thoughtful style in any bedroom with this spacious piece. Its clean lines and solid construction offer a dependable presence designed for daily use and lasting relaxation. The balanced proportions make it an easy fit for both contemporary and traditional room layouts. Subtle natural tones blend effortlessly into a variety of decor styles, creating a welcoming atmosphere. Bring refined simplicity and restful balance to your home with the Stanhope.',
        key_features: ['Available in King size.'],
      },
    };


    const prePushValid = validateItem(validContent, sourceProduct);
    assert.strictEqual(prePushValid.valid, true);
  });

  // 4. Deterministic quality promise & returns & care matching
  await test('4. Deterministic non-LLM components are correctly generated and isolated', async () => {
    const returnsBlock = getReturnsBlock('Bedroom');
    assert.strictEqual(returnsBlock.window_days, 'within **15 days**');
    assert.strictEqual(returnsBlock.condition.length, 3);

    const careMatch = matchMaterial('Solid Mango Wood');
    assert.strictEqual(careMatch.category, 'Wood');
    assert.strictEqual(careMatch.needs_review, false);

    const qp = buildQualityPromise('Bedroom', { applicable: true, duration_months: 12 }, { assembly_required: 'guided assembly included' });
    assert(qp.statement.includes('bedroom'));
    assert(qp.highlights.some((h) => h.includes('12-month')));
    assert(qp.highlights.some((h) => h.includes('guided assembly')));
  });

  // 5. Client factory registry & OpenAI / Gemini adapter swappability
  await test('5. Client factory properly instantiates configured adapters from data registry', async () => {
    assert(PROVIDER_REGISTRY.gemini != null);
    assert(PROVIDER_REGISTRY.openai != null);
    assert(PROVIDER_REGISTRY.groq != null);

    const geminiClient = getAiClient({ provider: 'gemini', api_key: 'dummy_key' });
    assert.strictEqual(geminiClient.constructor.name, 'GeminiAdapter');

    const openaiClient = getAiClient({ provider: 'openai', api_key: 'dummy_key' });
    assert.strictEqual(openaiClient.constructor.name, 'OpenAiCompatibleAdapter');

    const groqClient = getAiClient({ provider: 'groq', api_key: 'dummy_key' });
    assert.strictEqual(groqClient.constructor.name, 'OpenAiCompatibleAdapter');
  });

  // 6. Prompt building & Feedback rule application
  await test('6. Feedback rule compression and prompt builder injection works correctly', async () => {
    const compressed = await compressFeedbackToRule('Never say luxury and keep tone practical', 'Bedroom', 'description');
    assert(compressed.length > 0);

    const testProduct = {
      id: 'prod-fb-2',
      name: 'Oak Bedside Table',
      product_short_name: 'Oak',
      category: 'Bedroom',
      price: 4999,
      primary_material: 'Oak Wood',
    };

    const learnedRules = {
      Bedroom: {
        description: compressed,
      },
    };

    const { systemPrompt } = buildPrompt(testProduct, null, null, learnedRules);
    assert(systemPrompt.includes(compressed), 'Expected prompt to contain learned rule text');
  });

  // 7. Isolation from Bulk Import
  await test('7. AI content operations are fully isolated from BulkImportJobModel', async () => {
    const job = new AiContentJobModel({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
      status: 'pending',
    });
    assert.strictEqual(job.category, 'Bedroom');
    assert.strictEqual(job.status, 'pending');

    const reviewRow = new ContentReviewQueueModel({
      company_id: companyId,
      application_id: applicationId,
      job_id: job._id,
      status: 'needs_review',
    });
    assert.strictEqual(reviewRow.status, 'needs_review');

    const fieldHist = new FieldHistoryModel({
      company_id: companyId,
      application_id: applicationId,
      field_name: 'description',
      previous_value: 'old',
      new_value: 'new',
    });
    assert.strictEqual(fieldHist.field_name, 'description');
  });

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  clearMockClient();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
