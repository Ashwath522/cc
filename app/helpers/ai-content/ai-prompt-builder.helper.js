'use strict';

const fs = require('fs');
const path = require('path');
const { matchMaterial } = require('./ai-care-matcher.helper');
const { LLM_GENERATED_SCHEMA_SUBSET } = require('./ai-schema.helper');
const {
  assignDirection,
  assignDirectionSync,
  formatDirectionInstruction,
  getDirectionByHash,
  hashProfile,
} = require('./ai-direction-decider.helper');

const PRICE_BANDS_PATH = path.join(__dirname, 'reference-data', 'price_bands.json');

function loadPriceBands() {
  try {
    const raw = fs.readFileSync(PRICE_BANDS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { Default: { good_max: 5000, mid_max: 20000 } };
  }
}

let ContentRuleModel = null;
function getRuleModel() {
  if (!ContentRuleModel) {
    try {
      ContentRuleModel = require('../../models/contentRule.model');
    } catch (e) {}
  }
  return ContentRuleModel;
}

async function loadRulesFromMongo(companyId, applicationId, category) {
  if (!companyId || !applicationId) {
    return {};
  }
  try {
    const Model = getRuleModel();
    if (!Model) return {};
    const query = { company_id: companyId, application_id: applicationId };
    if (category) {
      query.category = category;
    }
    const docs = await Model.find(query).lean().exec();
    const rules = {};
    for (const doc of docs) {
      if (!rules[doc.category]) {
        rules[doc.category] = {};
      }
      rules[doc.category][doc.field] = doc.rule_text;
    }
    return rules;
  } catch (err) {
    return {};
  }
}

function computeTier(price, category, priceBands) {
  const bands = (priceBands && (priceBands[category] || priceBands.Default)) || { good_max: 5000, mid_max: 20000 };
  if (!bands || price === undefined || price === null) return 'Mid-Premium';
  if (price <= bands.good_max) return 'Good';
  if (price <= bands.mid_max) return 'Mid-Premium';
  return 'Premium';
}

const TIER_VOICE = {
  Good: 'practical, reliable, everyday language',
  'Mid-Premium': 'considered, elevated, refined (never say "luxury")',
  Premium: 'crafted, aspirational, understated confidence',
};

// Legacy opening and closing strategies preserved for backwards compatibility
const OPENING_STRATEGIES = {
  1: { id: 1, name: 'Strategy 1 (Sensory/tactile)', description: 'open from a specific physical sensation' },
  2: { id: 2, name: 'Strategy 2 (Use-case/moment)', description: 'open from a concrete action the shopper or room performs' },
  3: { id: 3, name: 'Strategy 3 (Direct product statement)', description: 'open by naming the product and its most distinctive real attribute plainly' },
  4: { id: 4, name: 'Strategy 4 (Spatial/room)', description: "open from how the piece occupies or changes the room's layout or flow" },
  5: { id: 5, name: 'Strategy 5 (Material-first fact)', description: 'open from a specific, ungeneric detail about the actual material' },
  6: { id: 6, name: 'Strategy 6 (Contrast/juxtaposition)', description: 'open by juxtaposing two apparent opposites the product resolves' },
  7: { id: 7, name: 'Strategy 7 (Consequence/outcome)', description: 'open with the lived consequence of good furniture' },
};

const CLOSE_ANCHOR_STRATEGIES = {
  1: { id: 1, name: 'Close Strategy 1 (Practical role)', description: "close by highlighting the product's practical daily function" },
  2: { id: 2, name: 'Close Strategy 2 (Use-case fit)', description: 'close by highlighting how well the piece fits a specific lifestyle need' },
  3: { id: 3, name: 'Close Strategy 3 (Spatial presence)', description: "close on how the piece sits within the room's visual balance" },
  4: { id: 4, name: 'Close Strategy 4 (Daily routine fit)', description: 'close on how effortlessly the piece integrates into daily transitions' },
  5: { id: 5, name: 'Close Strategy 5 (Material callback)', description: 'close on a lasting quality or tactile feel of the specific primary material' },
};

function selectOpeningStrategy(productKey) {
  return OPENING_STRATEGIES[1];
}

function selectCloseStrategy(productKey) {
  return CLOSE_ANCHOR_STRATEGIES[1];
}

const PLAIN_HUMAN_ENGLISH_CONSTRAINT = `MANDATORY LANGUAGE CONSTRAINT:
Write like a knowledgeable person describing this product to a friend — plain,
natural sentences a real person would actually say out loud. Do not reach for
ornate, literary, or overly poetic language. Avoid dense compound-adjective
constructions (e.g. 'nature-inspired serenity and grounded ease'), avoid abstract
filler phrases (e.g. 'everyday calm', 'functional clarity', 'restful order'), and
avoid sounding like a thesaurus was used to avoid repeating a simple word. If a
plain word works, use the plain word. The result should read easily out loud in
one breath per sentence — if a sentence needs re-reading to parse, simplify it.`;

const SYSTEM_PROMPT_TEMPLATE = `You are a product content writer for a furniture and home goods retailer.
Write factual, warm, purchase-driving copy that helps a shopper imagine
the product in their home. The tone should feel desirable and confident,
but never loud or fake — no exclamation points, no unverifiable
superlatives ("best", "amazing", "guaranteed").

You will receive:
- Raw product data (may be sparse or messy)
- A pre-computed price tier label (internal use only — see rule below)
- A grounded reference list for care instructions (material-matched)
- Any known warranty facts

Return ONLY valid JSON matching this exact schema for the fields you are
asked to generate. No markdown fences, no commentary, no extra fields.

{{SCHEMA_SUBSET}}

RULES:
1. Never alter or contradict a factual value given in the source data
   (dimensions, material, weight) — these belong in specifications only
   and must never be rewritten there.
2. Every fact you mention from the source data must actually be present
   in the source data — never invent details. Reusing a short phrase or
   sentence from the source is fine when it's the clearest way to state
   an important fact; the priority is that required facts are present
   and the format rules below are followed, not avoiding all repetition.
   STRICT FACTUAL GROUNDING CONSTRAINTS:
   - Do NOT invent ungrounded construction or joinery methods (e.g. NEVER claim "traditional joinery", "hand-finished joinery", "mortise-and-tenon", "interlocking joinery", "corner bracing", "cross-braced", "precision milling", "timber movement resistance", or "kiln-dried" unless explicitly in the source specs).
   - Do NOT invent unstated mechanical parts (e.g. NEVER claim "gas-assist struts", "gas lift pistons", "sliding lids"). Refer strictly to the catalog-stated storage mechanism (e.g. "hydraulic lift mechanism", "drawer storage").
   - Do NOT invent unstated internal organization features (e.g. NEVER claim "drawer dividers", "cosmetic compartments", "partitioned internal sections" unless explicitly in source specs).
   - Do NOT invent health or ergonomic claims (e.g. NEVER claim "spinal support", "postural alignment", "mattress airflow/ventilation").
   - Describe only the verified material, finish, stated storage configuration, general proportions, and everyday room utility.
3. NUMBERS STAY AS DIGITS. Any numeric spec you reference in bullets or
   specifications (mattress size, seating capacity, counts, sizes, etc.) must
   be written the same way the source gives it — digits, not spelled-out
   words. Write "4 Inches" / "4-seater" / "78 x 60 in", never "four
   inches" / "four-seater".
4. VOICE & TONE ({{TONE_NAME}}): {{TONE_VOICE}}
   Never state any internal tier name, never mention price, never imply a numeric
   price range.
5. care_and_maintenance: select and politely rephrase ONLY from the
   provided reference list below. Do not invent instructions. Exactly 3
   instructions, exactly 2 avoid items.
   CRITICAL POLITE-TONE RULE: Every care instruction and avoid item MUST open with a soft framing phrase (e.g. "We recommend...", "It's best to...", "Try to...") — NEVER a bare verb like "Dust", "Wipe", "Avoid", "Clean", "Keep" as the first word.
   Reference for "{{MATCHED_CATEGORY}}":
   Instructions: {{MATCHED_INSTRUCTIONS}}
   Avoid: {{MATCHED_AVOID}}
6. WARRANTY FORMAT — must match this EXACTLY or it fails validation.
   status_line is one sentence containing BOTH of these bolded spans,
   with nothing else inside either pair of asterisks:
     - **Yes** or **No**
     - **N months** — digits, a space, then the literal word "months"
   Required phrasing when warranty applies:
   "**Yes**, it has a warranty of **N months**."
   Required phrasing when warranty does not apply:
   "**No**, it has a warranty of **0 months**."
   points: up to 4, only from real source-provided facts, never invented
   to pad the count.
7. If a fact is genuinely missing and must be inferred, use plain,
   non-committal language — never state an inferred detail with
   unwarranted confidence. Absence means omit the fact, not assume its opposite.
8. VARIANT GROUNDING: If the source data specifies a particular variant
   this product represents (e.g. {{VARIANT_SEATING}}, {{VARIANT_COLOR}}), the description
   must reflect THAT exact variant only. Never enumerate sibling variants in prose.
   Do not mention the product's size/seating variant (e.g. 'Queen size', 'King size', '3-seater')
   in prose. Refer to the product only by its short name and/or generic category noun.
9. NEVER describe the product by what it lacks. Do not use "without", "no", "not", "lacks",
   "doesn't have" to frame an absent feature. Describe resulting space positively.
10. MANDATORY NAME PLACEMENT: The product's short name ({{SHORT_NAME}}) MUST appear in the
    FINAL (CLOSING) sentence of the summary specifically, and exactly once in the entire summary.
    Do not substitute a pronoun or synonym in its place.

11. STORY ARCHITECTURE & DIRECTION:
{{DIRECTION_INSTRUCTIONS}}

{{PLAIN_ENGLISH_CONSTRAINT}}

12. DESCRIPTION SUMMARY SKELETON (4-6 sentences, ~70-110 words):
- Sentence 1 (Opening): Follow the assigned opening approach and narrative lens strictly.
- Sentences 2-3 (Story Development): Follow the assigned feature hierarchy ordering naturally.
- Final Sentence (Closing): Name {{SHORT_NAME}} and execute the assigned closing mechanism cleanly.
- (key_features bullets are handled programmatically).

13. NEVER include specific numeric measurements in summary prose. Numbers belong only
    in specifications and key_features bullets.

CATEGORY RULES for {{CATEGORY}} / {{SUBCATEGORY}}:
Emphasis: {{CATEGORY_EMPHASIS}}
Avoid: {{CATEGORY_AVOID}}
Tone: {{CATEGORY_TONE}}

LEARNED PREFERENCES (feedback-derived rules):
{{LEARNED_RULES}}

{{DIVERSITY_CONTEXT}}`;

const SUBCATEGORY_MAPPING = {
  beds: 'Beds',
  bed: 'Beds',
  'storage bed': 'Beds',
  'storage beds': 'Beds',
  'hydraulic storage bed': 'Beds',
  'hydraulic storage beds': 'Beds',
  'box storage bed': 'Beds',
  'box storage beds': 'Beds',
  'drawer storage bed': 'Beds',
  'drawer storage beds': 'Beds',
  'wooden bed': 'Beds',
  'wooden beds': 'Beds',
  'solid wood bed': 'Beds',
  'solid wood beds': 'Beds',
  'upholstered bed': 'Beds',
  'upholstered beds': 'Beds',
  'single bed': 'Beds',
  'single beds': 'Beds',
  'king size bed': 'Beds',
  'king size beds': 'Beds',
  'queen size bed': 'Beds',
  'queen size beds': 'Beds',
  'all beds': 'Beds',
  mattresses: 'Mattresses',
  mattress: 'Mattresses',
  'king size mattress': 'Mattresses',
  'queen size mattress': 'Mattresses',
  'memory foam mattress': 'Mattresses',
  'orthopaedic mattress': 'Mattresses',
  'spring mattress': 'Mattresses',
  wardrobes: 'Wardrobes',
  wardrobe: 'Wardrobes',
  '2 door wardrobes': 'Wardrobes',
  '2-door wardrobes': 'Wardrobes',
  '3 door wardrobes': 'Wardrobes',
  '3-door wardrobes': 'Wardrobes',
  'sliding wardrobes': 'Wardrobes',
  'bedroom storage': 'Bedroom Storage',
  'dressing tables': 'Bedroom Storage',
  'dressing table': 'Bedroom Storage',
  'bedside tables': 'Bedroom Storage',
  'bedside table': 'Bedroom Storage',
  'chest of drawers': 'Bedroom Storage',
  benches: 'Bedroom Storage',
  'storage chests': 'Bedroom Storage',
  'kids room': 'Kids Room',
  'kids beds': 'Kids Room',
  'kids bed': 'Kids Room',
  'bunk beds': 'Kids Room',
  'bunk bed': 'Kids Room',
  'kids tables': 'Kids Room',
  'kids table': 'Kids Room',
  'kids chairs': 'Kids Room',
  'kids chair': 'Kids Room',
  'pet furniture': 'Pet Furniture',
  'pet beds': 'Pet Furniture',
  'pet bed': 'Pet Furniture',
};

function resolveSubcategoryName(subcategory) {
  if (!subcategory) return null;
  const key = String(subcategory).trim().toLowerCase();
  if (SUBCATEGORY_MAPPING[key]) {
    return SUBCATEGORY_MAPPING[key];
  }
  return subcategory.trim();
}

function loadCategoryRules(category, subcategory) {
  const baseDir = path.join(__dirname, 'reference-data', 'categoryPrompts');
  const catPath = category ? path.join(baseDir, category) : null;
  const subName = resolveSubcategoryName(subcategory);

  const subPath = catPath && subName ? path.join(catPath, `${subName}.json`) : null;
  const catDefPath = catPath ? path.join(catPath, '_default.json') : null;
  const globalDefPath = path.join(baseDir, '_default.json');

  let rules = null;
  if (subPath && fs.existsSync(subPath)) {
    try {
      rules = JSON.parse(fs.readFileSync(subPath, 'utf-8'));
    } catch (e) {}
  }
  if (!rules && catDefPath && fs.existsSync(catDefPath)) {
    try {
      rules = JSON.parse(fs.readFileSync(catDefPath, 'utf-8'));
    } catch (e) {}
  }
  if (!rules && fs.existsSync(globalDefPath)) {
    try {
      rules = JSON.parse(fs.readFileSync(globalDefPath, 'utf-8'));
    } catch (e) {}
  }

  return rules || { emphasis_points: [], avoid_list: [], tone_notes: '' };
}

function formatLearnedRules(rules, category) {
  const categoryRules = rules ? rules[category] : null;
  if (!categoryRules || Object.keys(categoryRules).length === 0) {
    return '(none yet)';
  }
  return Object.entries(categoryRules)
    .map(([field, rule]) => `- [${field}] ${rule}`)
    .join('\n');
}

const { getEffectiveTone } = require('./tone');
const { buildDiversityHint } = require('./ai-opener-store.helper');

const TONE_NAMES = Object.freeze({
  warm_inviting: 'Warm & Inviting',
  elegant_sophisticated: 'Elegant & Sophisticated',
  minimal_modern: 'Minimal & Modern',
  premium_indulgent: 'Premium & Indulgent',
  playful_casual: 'Playful & Casual',
});

function loadTonePresets() {
  const { TONE_PRESETS } = require('./tone');
  return TONE_PRESETS;
}

function assemblePromptTemplate({
  product,
  tier,
  careMatch,
  toneName,
  toneVoice,
  lengthDirection,
  learnedRules,
  selectedTone,
  directionProfile,
  directionHash,
}) {
  const shortName = product.product_short_name || (product.name ? product.name.split(' ')[0] : 'Product');
  const variantSeating = product.seating_capacity || '(not specified)';
  const variantColor = product.color_finish || '(not specified)';

  let schemaSubset = JSON.parse(JSON.stringify(LLM_GENERATED_SCHEMA_SUBSET));
  if (lengthDirection) {
    const words = lengthDirection === 'shorter' ? '40-60' : '120-150';
    schemaSubset.description.summary = `CRITICAL OVERRIDE: Target ${words} words. The user requested this length.`;
  }

  const categoryRules = loadCategoryRules(product.category, product.subcategory);
  const directionInstructions = formatDirectionInstruction(directionProfile);

  let systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{{SCHEMA_SUBSET}}', JSON.stringify(schemaSubset, null, 2))
    .replace('{{TONE_NAME}}', toneName)
    .replace('{{TONE_VOICE}}', String(toneVoice || ''))
    .replace('{{TIER}}', tier)
    .replace('{{TIER_VOICE}}', String(toneVoice || ''))
    .replace('{{MATCHED_CATEGORY}}', careMatch.category)
    .replace('{{MATCHED_INSTRUCTIONS}}', JSON.stringify(careMatch.instructions))
    .replace('{{MATCHED_AVOID}}', JSON.stringify(careMatch.avoid))
    .replace('{{VARIANT_SEATING}}', variantSeating)
    .replace('{{VARIANT_COLOR}}', variantColor)
    .replace('{{CATEGORY}}', product.category || 'Unknown')
    .replace('{{SUBCATEGORY}}', product.subcategory || 'Unknown')
    .replaceAll('{{SHORT_NAME}}', shortName)
    .replace('{{DIRECTION_INSTRUCTIONS}}', directionInstructions)
    .replace('{{PLAIN_ENGLISH_CONSTRAINT}}', PLAIN_HUMAN_ENGLISH_CONSTRAINT)
    .replace('{{CATEGORY_EMPHASIS}}', JSON.stringify(categoryRules.emphasis_points))
    .replace('{{CATEGORY_AVOID}}', JSON.stringify(categoryRules.avoid_list))
    .replace('{{CATEGORY_TONE}}', categoryRules.tone_notes)
    .replace('{{LEARNED_RULES}}', formatLearnedRules(learnedRules, product.category))
    .replace('{{DIVERSITY_CONTEXT}}', buildDiversityHint(8));

  const variantLines = [];
  if (product.seating_capacity) variantLines.push(`Primary size/seating variant (THIS product): ${product.seating_capacity}`);
  if (product.color_finish) variantLines.push(`Color / finish (THIS product): ${product.color_finish}`);
  if (product.color_reason) variantLines.push(`Reason this color/finish suits a shopper (use this, don't invent a different one): ${product.color_reason}`);

  const productForPrompt = { ...product };
  delete productForPrompt.dimensions;
  delete productForPrompt.weight;
  delete productForPrompt.secondary_material;

  let userPrompt = `PRODUCT INPUT:
Name: ${productForPrompt.name}
Category: ${productForPrompt.category}
Subcategory: ${productForPrompt.subcategory || ''}
${variantLines.join('\n')}
Raw source data: ${JSON.stringify(productForPrompt, null, 2)}

Generate the requested fields now.`;

  return {
    systemPrompt,
    userPrompt,
    tier,
    careMatch,
    assignedStrategy: OPENING_STRATEGIES[1],
    assignedCloseStrategy: CLOSE_ANCHOR_STRATEGIES[1],
    selectedTone,
    assignedDirection: directionProfile,
    directionProfile,
    profileHash: directionHash,
    directionHash,
  };
}

function buildPrompt(
  product,
  priceBands,
  lengthDirection = null,
  learnedRules = {},
  selectedTone = null,
  tenantContext = {},
) {
  const pb = priceBands || loadPriceBands();
  const tier = computeTier(product.price, product.category, pb);
  const careMatch = matchMaterial(product.primary_material);

  const toneId =
    typeof selectedTone === 'object' && selectedTone !== null
      ? selectedTone.toneId || selectedTone.tone_id || selectedTone.id
      : selectedTone;

  const companyId =
    tenantContext.company_id ||
    tenantContext.companyId ||
    (typeof selectedTone === 'object' && selectedTone !== null ? selectedTone.companyId || selectedTone.company_id : null) ||
    'default';
  const applicationId =
    tenantContext.application_id ||
    tenantContext.applicationId ||
    (typeof selectedTone === 'object' && selectedTone !== null
      ? selectedTone.applicationId || selectedTone.application_id
      : null) ||
    'default';

  let toneName = `Tier Voice (${tier})`;
  let toneVoice = TIER_VOICE[tier] || '';

  if (toneId && toneId !== 'auto') {
    toneName = TONE_NAMES[toneId] || toneId;
    const toneResult = getEffectiveTone({ companyId, applicationId, toneId });
    toneVoice = String(toneResult || '');
  }

  // Resolve direction synchronously first
  const recentHashes = tenantContext.recentHashesInBatch || [];
  let resolvedProfile = tenantContext.directionProfile || tenantContext.forcedProfile || null;
  let resolvedHash = tenantContext.profileHash || tenantContext.directionHash || (resolvedProfile ? hashProfile(resolvedProfile) : null);

  if (!resolvedProfile) {
    const assigned = assignDirectionSync({
      companyId,
      applicationId,
      category: product.category,
      recentHashesInBatch: recentHashes,
    });
    resolvedProfile = assigned.profile;
    resolvedHash = assigned.profile_hash;
  }

  const syncResult = assemblePromptTemplate({
    product,
    tier,
    careMatch,
    toneName,
    toneVoice,
    lengthDirection,
    learnedRules,
    selectedTone: toneId,
    directionProfile: resolvedProfile,
    directionHash: resolvedHash,
  });

  // Support both synchronous destructuring and async await
  const asyncPromise = (async () => {
    let finalToneVoice = toneVoice;
    if (toneId && toneId !== 'auto') {
      const asyncResolvedTone = await getEffectiveTone({ companyId, applicationId, toneId });
      if (asyncResolvedTone) {
        finalToneVoice = String(asyncResolvedTone);
      }
    }

    let finalProfile = resolvedProfile;
    let finalHash = resolvedHash;

    // If direction was not explicitly forced, run async direction assignment to ensure Mongo sync
    if (!tenantContext.directionProfile && !tenantContext.forcedProfile) {
      try {
        const asyncAssigned = await assignDirection({
          companyId,
          applicationId,
          category: product.category,
          recentHashesInBatch: recentHashes,
        });
        if (asyncAssigned && asyncAssigned.profile) {
          finalProfile = asyncAssigned.profile;
          finalHash = asyncAssigned.profile_hash;
        }
      } catch (e) {}
    }

    return assemblePromptTemplate({
      product,
      tier,
      careMatch,
      toneName,
      toneVoice: finalToneVoice,
      lengthDirection,
      learnedRules,
      selectedTone: toneId,
      directionProfile: finalProfile,
      directionHash: finalHash,
    });
  })();

  Object.assign(asyncPromise, syncResult);
  return asyncPromise;
}

const VOCABULARY_UPGRADES = {
  'Assembled with': 'Crafted with / Meticulously built with',
  'Constructed with': 'Fashioned from / Handcrafted from',
  'Built from': 'Crafted from / Rendered in',
  'sturdy': 'robust / resilient / enduring',
  'durable': 'long-lasting / built to endure',
  'dependable framework': 'trusted framework / steadfast construction',
  'provides sturdy support': 'offers unwavering support',
  'thoughtful proportions': 'considered proportions / thoughtful scale',
  'practical utility': 'effortless functionality',
  'Reassuring joinery': 'Confident craftsmanship / Considered joinery',
  'soft satin treatments': 'refined satin detailing',
  'creates an inviting surface': 'lends a graceful, inviting finish',
  'looks even better with age': 'develops character with age',
  'Smooth protective sealants': 'Meticulous protective finishing',
  'preserve the authentic grain': 'honour the natural grain',
  'Mellow wood grain patterns': 'Rich, understated grain patterns',
  'hand-rubbed surfaces': 'hand-finished surfaces',
  'grounded ease': 'quiet sophistication',
  'balanced silhouette': 'considered silhouette',
  'harmonizes with': 'complements effortlessly',
  'approachable warmth': 'refined warmth',
};

module.exports = {
  buildPrompt,
  computeTier,
  loadPriceBands,
  loadRulesFromMongo,
  loadCategoryRules,
  loadTonePresets,
  resolveSubcategoryName,
  formatLearnedRules,
  SUBCATEGORY_MAPPING,
  OPENING_STRATEGIES,
  CLOSE_ANCHOR_STRATEGIES,
  TIER_VOICE,
  VOCABULARY_UPGRADES,
  PLAIN_HUMAN_ENGLISH_CONSTRAINT,
  assignDirection,
  assignDirectionSync,
  formatDirectionInstruction,
  getDirectionByHash,
  hashProfile,
};
