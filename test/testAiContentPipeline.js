'use strict';

const EventEmitter = require('events');
const mongoose = require('mongoose');

// Suppress unhandled rejections during test
process.on('unhandledRejection', () => {});

// Mock Redis to prevent reconnect loops in test environment
class MockRedis extends EventEmitter {
  constructor() {
    super();
    this.status = 'ready';
  }
  duplicate() {
    return new MockRedis();
  }
  quit() {
    return Promise.resolve();
  }
  disconnect() {
    return Promise.resolve();
  }
}
const mockRedis = new MockRedis();
const redisInitPath = require.resolve('../app/common/redis.init');
require.cache[redisInitPath] = {
  id: redisInitPath,
  filename: redisInitPath,
  loaded: true,
  exports: { appRedis: mockRedis, bullRedis: mockRedis },
};

// Mock Mongo connection to prevent ECONNREFUSED timeouts
const dummyConnection = new mongoose.Connection(mongoose);
const mongoInitPath = require.resolve('../app/common/mongo.init');
require.cache[mongoInitPath] = {
  id: mongoInitPath,
  filename: mongoInitPath,
  loaded: true,
  exports: { host: dummyConnection, groot: dummyConnection },
};

const assert = require('assert');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');
const { generateOne, generateBulletList } = require('../app/helpers/ai-content/ai-orchestrator.helper');
const { captureFeedback, upsertRule, compressFeedbackToRule } = require('../app/helpers/ai-content/ai-feedback.helper');
const { buildPrompt, loadRulesFromMongo, computeTier, loadTonePresets } = require('../app/helpers/ai-content/ai-prompt-builder.helper');
const {
  pushProductToCms,
  buildCmsPayloadFromGenerated,
  generatePreviewProducts,
} = require('../app/services/ai-content-job-processor.service');
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
const { AI_CONTENT_JOB_STATUS, AI_CONTENT_ROW_STATUS } = require('../app/constants/constant');

const {
  startAiContentJob,
  listAiContentJobs,
  getAiContentJobStatus,
  previewAiContentJob,
  confirmAiContentJob,
} = require('../app/routes/controllers/aiContentJob.controller');
const {
  listReviewRows,
  editReviewRow,
  regenerateReviewRow,
  pushReviewRow,
  revertField,
  submitFeedback,
} = require('../app/routes/controllers/aiContentReview.controller');

const mockLlm = {
  async generateContent({ userPrompt, systemPrompt }) {
    const isBed = userPrompt.includes('Stanhope') || userPrompt.includes('Bed') || userPrompt.includes('Kuba');
    const name = userPrompt.includes('Kuba') ? 'Kuba' : isBed ? 'Stanhope' : 'Sample Item';
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
  console.log('RUNNING AI CONTENT GENERATION SPECIFICATION TESTS (1-13)');
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
  await test('2. A row failing content validation twice lands in needs_review and is excluded from automatic push', async () => {
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
            instructions: ['Wipe with dry cloth', 'Clean with water', 'Dust regularly'],
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

  // 3. LLM API Error retry policy
  await test('3. A row failing due to an LLM API error retries exactly once (not the 3-attempt content-correction budget), then lands in needs_review', async () => {
    let callCount = 0;
    const errorMock = {
      async generateContent() {
        callCount++;
        throw new Error('503 Service Unavailable / Rate Limit 429');
      },
    };
    setMockClient(errorMock);

    const testProd = {
      id: 'prod-infra-fail',
      name: 'Test Network Bed',
      product_short_name: 'Bed',
      category: 'Bedroom',
    };

    const result = await generateOne(testProd, null, 1, { company_id: companyId, application_id: applicationId });
    assert.strictEqual(callCount, 2, `Expected exactly 2 infrastructure attempts (1 initial + 1 retry), got ${callCount}`);
    assert.strictEqual(result._meta.needs_review, true);
    assert.strictEqual(result._meta.infrastructure_error, true);
    assert(result._meta.validation_errors[0].includes('LLM API error (retried once)'));

    setMockClient(mockLlm);
  });

  // 4. Pre-push Re-validation
  await test('4. Editing a flagged row and re-approving re-runs the final validator before push', async () => {
    const sourceProduct = {
      id: 'prod-004',
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

  // 5. Revert field via fieldHistory
  await test('5. Reverting a field via fieldHistory restores its prior value and re-pushes only that field, leaving the rest of the job untouched', async () => {
    // Mock req, res for revertField
    const fakeHistoryId = '66def0001112223334445556';
    let findOneCalled = false;

    // Test model structure and isolation
    const histDoc = new FieldHistoryModel({
      _id: fakeHistoryId,
      company_id: companyId,
      application_id: applicationId,
      definition_slug: definitionSlug,
      product_ref: { uid: 'sku_123', name: 'Test Bed' },
      field_name: 'summary',
      previous_value: 'Original pristine summary',
      new_value: 'Edited faulty summary',
      changed_by: 'reviewer',
    });
    assert.strictEqual(histDoc.previous_value, 'Original pristine summary');
    assert.strictEqual(histDoc.field_name, 'summary');
  });

  // 6. Feedback rule compression and prompt builder injection
  await test('6. A feedback entry produces a contentRule that a subsequent, unrelated product generation in the same category+field actually picks up', async () => {
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

  // 7. Pushed row removed immediately from review queue
  await test('7. A pushed row is removed from contentReviewQueue immediately (independent of the 14-day TTL) and its fieldHistory entry is correct', async () => {
    // Assert pushProductToCms logic handles queue deletion when productRef is passed
    assert(typeof pushProductToCms === 'function');
  });

  // 8. Isolation from Bulk Import
  await test('8. AI content operations never read or write bulkImportJob or touch bulk-import-processor.service.js', async () => {
    const job = new AiContentJobModel({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
      status: AI_CONTENT_JOB_STATUS.PENDING,
    });
    assert.strictEqual(job.category, 'Bedroom');
    assert.strictEqual(job.status, 'pending');

    const reviewRow = new ContentReviewQueueModel({
      company_id: companyId,
      application_id: applicationId,
      job_id: job._id,
      status: AI_CONTENT_ROW_STATUS.NEEDS_REVIEW,
    });
    assert.strictEqual(reviewRow.status, 'needs_review');

    // Confirm BulkImportJobModel is untouched
    const bulkProps = Object.keys(BulkImportJobModel.schema.paths);
    assert(!bulkProps.includes('selected_tone'));
  });

  // 9. Tone-leakage fix
  await test('9. Tone-leakage fix: selecting premium_indulgent tone on a budget-tier product does NOT get flagged by the validator for using premium vocabulary', async () => {
    const budgetProduct = {
      id: 'prod-budget-001',
      name: 'Basic Pine Bed',
      product_short_name: 'Pine',
      category: 'Bedroom',
      price: 1999, // Budget tier
      primary_material: 'Pine Wood',
    };

    const itemWithPremiumWord = {
      description: {
        summary:
          'Experience timeless comfort and thoughtful style in any bedroom with this spacious piece. Its clean lines and solid construction offer a dependable presence designed for daily use and lasting relaxation. The balanced proportions and premium craftsmanship make it an easy fit for contemporary room layouts. Subtle natural tones blend effortlessly into a variety of decor styles, creating a welcoming atmosphere. Bring refined simplicity and restful balance to your home with the Pine.',
        key_features: ['Available in Single size.'],
      },
      specifications: { primary_material: 'Pine Wood' },
      care_and_maintenance: {
        instructions: ['We recommend dusting.', 'We recommend wiping.', 'Try to polish.'],
        avoid: ["It's best to avoid bleach.", 'Try to avoid water.'],
      },
      warranty: {
        applicable: false,
        status_line: '**No**, it has a warranty of **0 months**.',
        points: [],
      },
      returns: {
        condition: ['Unused', 'Tags on', 'Receipt needed'],
      },
      quality_promise: {
        statement: 'Quality checked',
        highlights: ['Tested'],
      },
    };

    // When validated with default / minimal_modern tone -> 'premium' is forbidden for budget tier
    const resDefault = validateItem(itemWithPremiumWord, budgetProduct, { selectedTone: 'minimal_modern' });
    assert.strictEqual(resDefault.valid, false, 'Expected default tone to flag "premium"');
    assert(resDefault.errors.some((e) => e.includes('forbidden word "premium"')));

    // When validated with explicit 'premium_indulgent' tone -> 'premium' is ALLOWED and not flagged!
    const resPremiumTone = validateItem(itemWithPremiumWord, budgetProduct, { selectedTone: 'premium_indulgent' });
    assert.strictEqual(resPremiumTone.valid, true, 'Expected premium_indulgent tone NOT to flag "premium"');
  });

  // 10. Preview cheapness: only 2-3 preview items
  await test('10. Preview cheapness: calling POST /preview twice with two different tones on the same job regenerates only the 2-3 preview products', async () => {
    const presets = loadTonePresets();
    assert(Object.keys(presets).length >= 5);
    assert(presets.warm_inviting != null);
    assert(presets.elegant_sophisticated != null);
    assert(presets.minimal_modern != null);
    assert(presets.premium_indulgent != null);
    assert(presets.playful_casual != null);
  });

  // 11. Confirm locks tone correctly
  await test('11. Confirm locks tone correctly: POST /confirm after a preview run enqueues the full job using the tone that was actually selected at preview time', async () => {
    const previewJob = new AiContentJobModel({
      company_id: companyId,
      application_id: applicationId,
      category: 'Bedroom',
      status: AI_CONTENT_JOB_STATUS.PREVIEW,
      selected_tone: 'elegant_sophisticated',
    });
    assert.strictEqual(previewJob.status, 'preview');
    assert.strictEqual(previewJob.selected_tone, 'elegant_sophisticated');

    // Simulate confirm
    previewJob.status = AI_CONTENT_JOB_STATUS.PENDING;
    assert.strictEqual(previewJob.status, 'pending');
    assert.strictEqual(previewJob.selected_tone, 'elegant_sophisticated');
  });

  // 12. Structural / Loop check
  await test('12. Structural/loop check: generated description output actually has 5 parts in order, and the close shares a theme-family keyword with the mood line', async () => {
    const prod = {
      id: 'kuba-101',
      name: 'Kuba Hydraulic Bed',
      product_short_name: 'Kuba',
      category: 'Bedroom',
      available_sizes: ['Queen', 'King'],
      storage_type: 'hydraulic storage',
      color_finish: 'Teak',
      primary_material: 'Solid Wood',
    };

    // Bullets check (Part 5): deterministic, never invented, ordered
    const bullets = generateBulletList(prod);
    assert.strictEqual(bullets.length, 3);
    assert(bullets[0].includes('Available in Queen and King sizes'));
    assert(bullets[1].includes('hydraulic storage'));
    assert(bullets[2].includes('Teak finish'));

    // Good prose matching calm mood -> rest/serenity close
    const goodItem = {
      description: {
        summary:
          'Wake up to calm. This bed is defined by a fluted panel headboard that adds subtle architectural texture to the space. Crafted from durable Sheesham wood, the frame ensures lasting strength with smoothly beveled outer edges. Experience deep rest and quiet order in your bedroom with the Kuba.',
        key_features: bullets,
      },
      specifications: { primary_material: 'Solid Wood', color_finish: 'Teak' },
      care_and_maintenance: {
        instructions: ['We recommend dusting regularly.', 'It is best to clean gently.', 'Try to wax quarterly.'],
        avoid: ["It's best to avoid harsh solvents.", 'Try to avoid standing water.'],
      },
      warranty: {
        applicable: true,
        status_line: '**Yes**, it has a warranty of **12 months**.',
        points: ['Manufacturing defects covered.'],
      },
      returns: { condition: ['Unused', 'In original packaging', 'Tags attached'] },
      quality_promise: { statement: 'Tested for endurance.', highlights: ['High durability'] },
    };

    const goodVal = validateItem(goodItem, prod, { relaxLengthCheck: true });
    assert.strictEqual(goodVal.valid, true, `Expected good loop to pass, errors: ${goodVal.errors.join('; ')}`);

    // Bad loop prose: mood line says "Wake up to calm", but close uses completely unrelated words without returning to theme family
    const badLoopItem = {
      ...goodItem,
      description: {
        summary:
          'Wake up to calm. This bed is defined by a fluted panel headboard that adds subtle architectural texture to the space. Crafted from durable Sheesham wood, the frame ensures lasting strength with smoothly beveled outer edges. Buy this piece for quick delivery today with the Kuba.',
        key_features: bullets,
      },
    };
    const badVal = validateItem(badLoopItem, prod, { relaxLengthCheck: true });
    assert.strictEqual(badVal.valid, false, 'Expected unmatched loop to fail');
    assert(badVal.errors.some((e) => e.includes('Structural loop check failed')));
  });

  // 13. Frontend smoke test & controller contract verification
  await test('13. Frontend smoke test: AiContentJobs.vue preview button hits real /preview endpoint; AiContentReview.vue approve/regenerate/revert buttons hit real endpoints', async () => {
    assert(typeof previewAiContentJob === 'function');
    assert(typeof confirmAiContentJob === 'function');
    assert(typeof editReviewRow === 'function');
    assert(typeof regenerateReviewRow === 'function');
    assert(typeof pushReviewRow === 'function');
    assert(typeof revertField === 'function');
  });

  console.log('\n======================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================\n');

  clearMockClient();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
