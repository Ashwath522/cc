'use strict';

const fs = require('fs');
const path = require('path');
const { matchMaterial } = require('./ai-care-matcher.helper');
const { LLM_GENERATED_SCHEMA_SUBSET } = require('./ai-schema.helper');

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

const OPENING_STRATEGIES = {
  1: {
    id: 1,
    name: 'Strategy 1 (Sensory/tactile)',
    description: 'open from a specific physical sensation (texture, surface feel, how light interacts with the finish)',
  },
  2: {
    id: 2,
    name: 'Strategy 2 (Use-case/moment)',
    description: 'open from a concrete action the shopper or room performs (e.g. getting ready in the morning, organizing a shared space, welcoming a guest)',
  },
  3: {
    id: 3,
    name: 'Strategy 3 (Direct product statement)',
    description: 'open by naming the product and its most distinctive real attribute plainly, with no mood framing at all',
  },
  4: {
    id: 4,
    name: 'Strategy 4 (Spatial/room)',
    description: "open from how the piece occupies or changes the room's layout or flow",
  },
  5: {
    id: 5,
    name: 'Strategy 5 (Material-first fact)',
    description: 'open from a specific, ungeneric detail about the actual material (not generic "rich grain" — a specific detail about how this material behaves or looks, e.g. how mango wood ages differently than sheesham, how particle board provides uniform surfaces, etc.)',
  },
};

const STRATEGY_2_SUB_CASES = [
  'getting ready in the morning',
  'settling in after a long day',
  'hosting a guest or gathering',
  'starting a relaxed weekend routine',
  'returning home in the evening',
];

function selectOpeningStrategy(productKey) {
  const str = String(productKey || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const key = (Math.abs(hash) % 5) + 1;
  const strat = OPENING_STRATEGIES[key];

  if (key === 2) {
    let subHash = 5381;
    for (let i = 0; i < str.length; i++) {
      subHash = (subHash << 5) + subHash + str.charCodeAt(i);
      subHash |= 0;
    }
    const subIndex = Math.abs(subHash) % STRATEGY_2_SUB_CASES.length;
    const assignedSubCase = STRATEGY_2_SUB_CASES[subIndex];
    return {
      ...strat,
      description: `open from this specific concrete use-case/moment: "${assignedSubCase}". Do NOT use a formulaic template like "Preparing for a..." — describe the moment naturally and specifically.`,
    };
  }

  return strat;
}

const CLOSE_ANCHOR_STRATEGIES = {
  1: {
    id: 1,
    name: 'Close Strategy 1 (Practical role)',
    description: "close by highlighting the product's practical daily function and utility in organizing and supporting the living space",
  },
  2: {
    id: 2,
    name: 'Close Strategy 2 (Use-case fit)',
    description: 'close by highlighting how well the piece fits a specific lifestyle need, room constraint, or intended use',
  },
  3: {
    id: 3,
    name: 'Close Strategy 3 (Spatial presence)',
    description: "close on how the piece sits within the room's visual balance and proportions without overpowering the surrounding space",
  },
  4: {
    id: 4,
    name: 'Close Strategy 4 (Daily routine fit)',
    description: 'close on how effortlessly the piece integrates into daily transitions and morning/evening habits',
  },
  5: {
    id: 5,
    name: 'Close Strategy 5 (Material callback)',
    description: 'close on a lasting quality, tactile feel, or enduring aesthetic benefit of the specific primary material',
  },
};

function selectCloseStrategy(productKey) {
  const str = String(productKey || '');
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash |= 0;
  }
  const key = (Math.abs(hash) % 5) + 1;
  return CLOSE_ANCHOR_STRATEGIES[key];
}

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
3. NUMBERS STAY AS DIGITS. Any numeric spec you reference in bullets or
   specifications (mattress size, seating capacity, counts, sizes, etc.) must
   be written the same way the source gives it — digits, not spelled-out
   words. Write "4 Inches" / "4-seater" / "78 x 60 in", never "four
   inches" / "four-seater".
4. The price tier ({{TIER}}) must shape your WORD CHOICE only — {{TIER_VOICE}}.
   Never state the tier name, never mention price, never imply a numeric
   price range.
5. care_and_maintenance: select and politely rephrase ONLY from the
   provided reference list below. Do not invent instructions. Exactly 3
   instructions, exactly 2 avoid items.
   CRITICAL POLITE-TONE RULE: Every care instruction and avoid item MUST open with a soft framing phrase (e.g. "We recommend...", "It's best to...", "Try to...") — NEVER a bare verb like "Dust", "Wipe", "Avoid", "Clean", "Keep" as the first word.
   Concrete example:
     - INCORRECT: "Dust regularly with a soft cloth"
     - CORRECT: "We recommend dusting regularly with a soft cloth"
     - INCORRECT: "Avoid harsh chemical cleaners"
     - CORRECT: "It's best to avoid harsh chemical cleaners"
   Reference for "{{MATCHED_CATEGORY}}":
   Instructions: {{MATCHED_INSTRUCTIONS}}
   Avoid: {{MATCHED_AVOID}}
6. WARRANTY FORMAT — must match this EXACTLY or it fails validation.
   status_line is one sentence containing BOTH of these bolded spans,
   with nothing else inside either pair of asterisks:
     - **Yes** or **No**
     - **N months** — digits, a space, then the literal word "months"
       (e.g. **12 months** — never **12-month**, never **twelve months**,
       never wrap other words inside the same bold span).
   Required phrasing when warranty applies:
   "**Yes**, it has a warranty of **N months**."
   Required phrasing when warranty does not apply:
   "**No**, it has a warranty of **0 months**."
   points: up to 4, only from real source-provided facts, never invented
   to pad the count.
7. If a fact is genuinely missing and must be inferred, use plain,
   non-committal language — never state an inferred detail with
   unwarranted confidence.
   (STANDING RULE: absence of a field must never be treated as a value
   — e.g. absent storage_type must never be treated as 'no storage';
   absent finish must never be treated as 'single default finish'.
   Absence means omit the fact, not assume its opposite or a default).
8. VARIANT GROUNDING. If the source data specifies a particular variant
   this product represents — e.g. a seating capacity ({{VARIANT_SEATING}})
   or a color/finish ({{VARIANT_COLOR}}) — the description must reflect
   THAT exact variant only. Never mention other sizes, seat counts, or
   colors that are not this specific variant.
   NEVER enumerate sibling variants (e.g. available sizes, colors, storage options) in prose. These will be added programmatically as bullets later.
   Do not mention the bed's size/seating variant (e.g. 'Queen size', 'King size', 'Queen bed', '3-seater') anywhere in summary. Size is surfaced separately as a bullet and must not be restated in prose. Refer to the product only by its short name and/or generic category noun (e.g. 'this bed', 'the Rattan') without the size qualifier attached.
9. NEVER describe the product by what it lacks. Do not use "without", "no", "not", "lacks", "doesn't have", or similar negation to frame an absent feature (e.g. no storage, no drawers, no headboard). If a feature is simply absent from the source data, do not mention its absence at all — describe the resulting product positively instead (e.g. an open, uncluttered base; a clean minimal silhouette) without ever naming what is missing. This applies to summary.
10. MANDATORY: The product's short name ({{SHORT_NAME}}) MUST appear in the FINAL (CLOSING) sentence of the summary specifically, and exactly once in the entire summary — this is checked programmatically and generation fails if it appears earlier or is missing. Do not substitute a pronoun, category term ("the bed"), or synonym in its place.
11. PROSE STRUCTURE — Follow this exact 4-part formula:
  Part 1 — MOOD LINE:
    ASSIGNED MOOD LINE STRATEGY FOR THIS PRODUCT:
    For this product, open the mood line using {{STRATEGY_NAME}} ({{STRATEGY_DESC}}).
    Do not use a sensory or emotional framing if assigned a direct statement or material-first strategy.
    Follow this assigned strategy strictly for this product. Do not default to stock mood framing or generic phrases (e.g., "Rich [wood] grain brings/invites...").
    (Light backstop: Avoid defaulting to stock mood words: soft, gentle, calm, quiet, peaceful, serene, grounded, restful, tidy, organized. Express product details concretely).
    
    MOOD-LINE MATERIAL LEAKAGE RULE:
    Never open Part 1 directly with a raw material name or construction statement (unless specifically assigned Strategy 5). Part 1 is for setting the mood or context, not technical specs.
    - INCORRECT (this is Part 3 content appearing in Part 1's slot): "Engineered wood construction provides a uniform surface..."
    - CORRECT: a mood/feeling-first sentence with NO material or product name at all, e.g. "Mornings feel unhurried in a well-organized room."
  Part 2 — {{INTRO_INSTRUCTION}}
  Part 3 — STORY: 1-2 paragraphs detailing material, construction, and secondary details based on category emphasis.
  Part 4 — CLOSE:
    ASSIGNED CLOSE STRATEGY FOR THIS PRODUCT:
    For this product, close the summary using {{CLOSE_STRATEGY_NAME}} ({{CLOSE_STRATEGY_DESC}}).
    MANDATORY: Name the product ({{SHORT_NAME}}) in this final sentence (and nowhere earlier in the summary).
    Follow this assigned close strategy strictly. Do NOT use generic anchor buzzwords (e.g. do not rely on "anchor", "anchor point", "visual anchor", "centerpiece"). Do not rely on the banned mood adjectives (soft, gentle, calm, quiet, peaceful, serene, grounded, restful, tidy, organized) for the closing thought.
    
    PROSE STYLE & RESONANCE (APPLIES TO MOOD & STORY):
    Translate each grounded fact into its lived, sensory consequence, not just state the fact. E.g. "hydraulic storage" → "generous under-bed space to store seasonal linens out of everyday traffic" rather than "an integrated hydraulic storage system." "Solid wood" → the tactile/visual warmth it brings to a room, not just "durable construction."
    
    CRITICAL GROUNDING RULE FOR PROSE STYLE:
    This is a REWORDING instruction, not a new-content instruction. You MUST NOT introduce any specific claim (color, hardware, shape, accent detail, pattern) that isn't present in the input product data. When design details are present, apply this rich treatment to them. When design details are absent, this guidance must draw ONLY from the material, storage, and room-use facts provided. Do not invent details just to sound warm.

    12. NEVER include specific numeric measurements (dimensions, weight, or any other raw number) in the prose. Describe scale and presence qualitatively — e.g. 'a substantial, grounded presence' rather than citing exact measurements. Numbers belong only in the specifications block and in key_features bullets, never in this summary.

    Produce the prose targeting ~70-110 words across 4-6 sentences.

    CATEGORY RULES for {{CATEGORY}} / {{SUBCATEGORY}}:
    Emphasis: {{CATEGORY_EMPHASIS}}
    Avoid: {{CATEGORY_AVOID}}
    Tone: {{CATEGORY_TONE}}

LEARNED PREFERENCES (feedback-derived rules):
{{LEARNED_RULES}}`;

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

function buildPrompt(product, priceBands, lengthDirection = null, learnedRules = {}) {
  const pb = priceBands || loadPriceBands();
  const tier = computeTier(product.price, product.category, pb);
  const careMatch = matchMaterial(product.primary_material);

  const productKey = product.id || product.product_short_name || product.name;
  const assignedStrategy = selectOpeningStrategy(productKey);
  const assignedCloseStrategy = selectCloseStrategy(productKey);

  const variantSeating = product.seating_capacity || '(not specified)';
  const variantColor = product.color_finish || '(not specified)';

  let schemaSubset = JSON.parse(JSON.stringify(LLM_GENERATED_SCHEMA_SUBSET));
  if (lengthDirection) {
    const words = lengthDirection === 'shorter' ? '40-60' : '120-150';
    schemaSubset.description.summary = `CRITICAL OVERRIDE: Target ${words} words. The user requested this length.`;
  }

  const categoryRules = loadCategoryRules(product.category, product.subcategory);

  let systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{{SCHEMA_SUBSET}}', JSON.stringify(schemaSubset, null, 2))
    .replace('{{TIER}}', tier)
    .replace('{{TIER_VOICE}}', TIER_VOICE[tier])
    .replace('{{MATCHED_CATEGORY}}', careMatch.category)
    .replace('{{MATCHED_INSTRUCTIONS}}', JSON.stringify(careMatch.instructions))
    .replace('{{MATCHED_AVOID}}', JSON.stringify(careMatch.avoid))
    .replace('{{VARIANT_SEATING}}', variantSeating)
    .replace('{{VARIANT_COLOR}}', variantColor)
    .replace('{{CATEGORY}}', product.category || 'Unknown')
    .replace('{{SUBCATEGORY}}', product.subcategory || 'Unknown')
    .replace(
      '{{INTRO_INSTRUCTION}}',
      product.design_details
        ? `INTRO: Names the product type + its single most distinctive design hook (${product.design_details}).`
        : `INTRO: Names the product type. (No specific design hook is provided, so do not invent one).`,
    )
    .replaceAll('{{SHORT_NAME}}', product.product_short_name || product.name.split(' ')[0])
    .replace('{{STRATEGY_NAME}}', assignedStrategy.name)
    .replace('{{STRATEGY_DESC}}', assignedStrategy.description)
    .replace('{{CLOSE_STRATEGY_NAME}}', assignedCloseStrategy.name)
    .replace('{{CLOSE_STRATEGY_DESC}}', assignedCloseStrategy.description)
    .replace('{{CATEGORY_EMPHASIS}}', JSON.stringify(categoryRules.emphasis_points))
    .replace('{{CATEGORY_AVOID}}', JSON.stringify(categoryRules.avoid_list))
    .replace('{{CATEGORY_TONE}}', categoryRules.tone_notes)
    .replace('{{LEARNED_RULES}}', formatLearnedRules(learnedRules, product.category));

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
${variantLines.join('\n')}
Raw source data: ${JSON.stringify(productForPrompt, null, 2)}

Generate the requested fields now.`;

  return { systemPrompt, userPrompt, tier, careMatch, assignedStrategy, assignedCloseStrategy };
}

module.exports = {
  buildPrompt,
  computeTier,
  loadPriceBands,
  loadRulesFromMongo,
  loadCategoryRules,
  resolveSubcategoryName,
  formatLearnedRules,
  SUBCATEGORY_MAPPING,
  OPENING_STRATEGIES,
  CLOSE_ANCHOR_STRATEGIES,
  TIER_VOICE,
};
