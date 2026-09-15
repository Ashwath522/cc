'use strict';

// Fake LLM responses — no API key, no network calls.
// Matches the exact schema shape the real Gemini client returns.
//
// DIVERSITY REQUIREMENT: Different products must get different openers/closers.
// The mock tracks product assignments and provides diverse narrative angles.

function extractField(text, label) {
  if (!text) return null;
  const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':\\s*(.+)');
  const match = text.match(re);
  return match ? match[1].trim() : null;
}

const productIndexMap = new Map();
const productAttemptMap = new Map();
let productCounter = 0;

function resetUsedTracking() {
  productIndexMap.clear();
  productAttemptMap.clear();
  productCounter = 0;
}

const PRODUCT_KNOWN_INDICES = {
  'ul-cove-king-walnut': 0,
  'cove': 0,
  'ul-opal-queen-natural': 1,
  'opal': 1,
  'ul-masai-king-ebony': 2,
  'masai': 2,
  'ul-nina-queen-white': 3,
  'nina': 3,
  'ul-rio-single-natural': 4,
  'rio': 4,
  'ul-haven-king-charcoal': 5,
  'haven': 5,
  'ul-lune-queen-oak': 6,
  'lune': 6,
};

function getProductBaseIndex(key) {
  const normKey = String(key || '').toLowerCase();
  if (PRODUCT_KNOWN_INDICES[normKey] !== undefined) {
    return PRODUCT_KNOWN_INDICES[normKey];
  }
  for (const [k, v] of Object.entries(PRODUCT_KNOWN_INDICES)) {
    if (normKey.includes(k)) return v;
  }
  if (!productIndexMap.has(normKey)) {
    productIndexMap.set(normKey, productCounter++);
  }
  return productIndexMap.get(normKey);
}

// 10 distinct, self-contained summary generators
// Each hits 75-85 words, 4-5 sentences, unique 3-word start, theme loop keywords, and shortName in closer
const TEMPLATES = [
  // 0: Cove (Craft/Solid Sheesham)
  (shortName, mat, cat) => ({
    mood: `Distinctive surface discipline defines this ${mat || 'frame'} design, holding its character through years of regular use.`,
    intro: `This ${cat} piece channels material consistency into a grounded profile that fits naturally across various interior styles.`,
    story: `Solid timber construction preserves structural integrity and level platform alignment under daily use. The sturdy framework and durable platform keep the bed securely level and quiet.`,
    close: `${shortName} handles the ordinary with appropriate quiet — built for daily use, dependable in quality, and lasting in purpose.`,
  }),

  // 1: Opal (Calm/Teak)
  (shortName, mat, cat) => ({
    mood: `The morning runs more smoothly when the room has already worked out its spatial balance.`,
    intro: `This ${cat} furniture removes daily friction through dimensional accuracy and an uncluttered silhouette that stays quietly functional.`,
    story: `Selected hardwood sections provide a dense and steady foundation that withstands daily household use. The natural wood grain surface is protected by an enduring clear finish that highlights organic texture.`,
    close: `${shortName} settles into the room on its own terms, bringing quiet order, restful ease, and enduring strength.`,
  }),

  // 2: Masai (Minimal/Hydraulic)
  (shortName, mat, cat) => ({
    mood: `A room rearranges itself around furniture that understands its functional role.`,
    intro: `This ${cat} design earns its footprint with lean proportions, solid stability, and zero visual excess.`,
    story: `High-density engineered boards deliver consistent structural density that maintains shape retention over time. An integrated hydraulic lift mechanism and sturdy perimeter framing provide accessible under-bed storage.`,
    close: `${shortName} earns its place through honest craftsmanship, material integrity, and a silhouette that asks nothing extra of the space.`,
  }),

  // 3: Nina (Inviting/Upholstered)
  (shortName, mat, cat) => ({
    mood: `Carefully balanced proportions resolve the tension between visual lightness and structural durability.`,
    intro: `This upholstered ${cat} bed creates an inviting backdrop that softens the surrounding bedroom architecture without visual clutter.`,
    story: `The tailored fabric panels cover a solid internal framework designed to distribute weight evenly across the platform. Resilient cushioning preserves its clean geometric form and supportive backrest comfort through years of nightly reading.`,
    close: `${shortName} anchors the space with unforced presence, serene comfort, balanced proportions, and lasting material quality.`,
  }),

  // 4: Rio (Daily use/Mango)
  (shortName, mat, cat) => ({
    mood: `Some furniture belongs to the practical rhythms of the day that often go unnoticed.`,
    intro: `This compact ${cat} design occupies that reliable register — durable, honest, and built for continuous everyday living.`,
    story: `Solid mango wood offers rich character and authentic texture, built with sturdy framing for lasting rigidity. The low-profile silhouette optimizes floor clearance while providing steady platform support for single mattresses.`,
    close: `${shortName} makes itself useful without making itself noticed — delivering a solid foundation and dependable comfort for everyday living.`,
  }),

  // 5: Haven (Permanence/Storage)
  (shortName, mat, cat) => ({
    mood: `Grounded visual weight gives this ${mat ? mat.toLowerCase() : 'furniture'} an immediate sense of permanence.`,
    intro: `Its considered geometry keeps the bedroom structured and organized without overwhelming surrounding furnishings.`,
    story: `Generous box storage compartments beneath the platform keep seasonal bedding neatly tucked away yet readily accessible. Woven fabric upholstery covers a solid perimeter frame designed for continuous everyday use.`,
    close: `${shortName} is furniture that answers the brief with clarity — honest in material, accurate in dimension, and grounded in craftsmanship.`,
  }),

  // 6: Lune (Restraint/Scandinavian)
  (shortName, mat, cat) => ({
    mood: `Not every ${cat} piece needs to announce itself with dramatic flourishes.`,
    intro: `This Scandinavian-inspired frame establishes calm authority through genuine restraint, clean geometry, and a dependable structural foundation.`,
    story: `Solid rubberwood legs and rails create clean edges and seamless tonal transitions throughout the frame. Sturdy platform construction supports the mattress securely while absorbing movement for restful sleep.`,
    close: `${shortName} completes the bedroom with quiet confidence, peaceful ease, timeless refinement, and authentic craftsmanship.`,
  }),

  // 7: Architectural (Fallback/Retry)
  (shortName, mat, cat) => ({
    mood: `Quiet architectural discipline shapes this ${cat} piece from every angle.`,
    intro: `The frame combines robust craftsmanship with clean architectural lines to deliver lasting peace of mind.`,
    story: `Solid construction and secure joints ensure the platform remains steady through years of daily use. Protective surface treatments seal the material against everyday wear while preserving natural texture.`,
    close: `${shortName} provides lasting structural integrity while keeping the room peaceful, organized, and effortlessly balanced.`,
  }),

  // 8: Purposeful (Fallback/Retry)
  (shortName, mat, cat) => ({
    mood: `Purposeful simplicity ensures this ${cat} piece integrates smoothly into modern daily routines.`,
    intro: `The thoughtful layout and sturdy frame provide unwavering support without introducing unnecessary visual clutter.`,
    story: `Every structural rail and support leg is calibrated to handle regular loads without flexing over time. Carefully finished surfaces and durable hardware maintain a clean profile from all viewing angles.`,
    close: `${shortName} fulfills its role through enduring craftsmanship, honest construction, and elegant functional simplicity.`,
  }),

  // 9: Evening light (Fallback/Retry)
  (shortName, mat, cat) => ({
    mood: `Evening light lands on ${mat ? mat.toLowerCase() : 'the surface'} with subtle warmth and depth.`,
    intro: `This ${cat} piece maintains its finish through deliberate construction and enduring material integrity.`,
    story: `Sturdy structural members keep the frame steady, ensuring the platform deck remains securely positioned. Protective surface coatings safeguard the timber while accentuating subtle textural depth across all exterior faces.`,
    close: `${shortName} brings the room to a natural resolution — combining lasting construction with refined proportion and enduring balance.`,
  }),
];

function mockGenerateContent({ systemPrompt, userPrompt, options }) {
  const name = extractField(userPrompt, 'Name') || 'Product';
  const category = (extractField(userPrompt, 'Category') || 'bedroom').toLowerCase();

  const shortNameMatch = systemPrompt && systemPrompt.match(/product's short name \(([^)]+)\)/);
  const shortName = options?.agentContexts?.closeContext?.product_short_name ||
    (shortNameMatch && shortNameMatch[1]) ||
    name.split(' ')[0];

  const materialMatch = userPrompt && (
    userPrompt.match(/"primary_material"\s*:\s*"([^"]+)"/) ||
    userPrompt.match(/primary_material:\s*(.+?)[\n,}]/)
  );
  const material = options?.agentContexts?.moodContext?.primary_material ||
    (materialMatch ? materialMatch[1].trim() : null);

  const instructionsMatch = systemPrompt && systemPrompt.match(/Instructions:\s*(\[.*?\])/s);
  const avoidMatch = systemPrompt && systemPrompt.match(/Avoid:\s*(\[.*?\])/s);

  let refInstructions = [];
  let refAvoid = [];
  try { refInstructions = JSON.parse(instructionsMatch[1]); } catch (e) {}
  try { refAvoid = JSON.parse(avoidMatch[1]); } catch (e) {}

  const fallbackInstructions = [
    'wipe down with a soft, dry cloth regularly',
    'keep away from direct sunlight',
    'use coasters or mats under hot or wet items',
  ];
  const fallbackAvoid = ['harsh chemical cleaners', 'placing near direct heat sources'];

  const pickedInstructions = (refInstructions.length ? refInstructions : fallbackInstructions).slice(0, 3);
  while (pickedInstructions.length < 3) pickedInstructions.push(fallbackInstructions[pickedInstructions.length % fallbackInstructions.length]);

  const pickedAvoid = (refAvoid.length ? refAvoid : fallbackAvoid).slice(0, 2);
  while (pickedAvoid.length < 2) pickedAvoid.push(fallbackAvoid[pickedAvoid.length % fallbackAvoid.length]);

  const politeInstructions = pickedInstructions.map((line) => {
    const lower = line.charAt(0).toLowerCase() + line.slice(1);
    return 'We recommend you ' + lower.replace(/\.$/, '') + '.';
  });

  const politeAvoid = pickedAvoid.map((line) => {
    const stripped = line.replace(/^avoid\s+/i, '');
    const lower = stripped.charAt(0).toLowerCase() + stripped.slice(1);
    return "It's best to avoid " + lower.replace(/\.$/, '') + '.';
  });

  const idMatch = userPrompt && userPrompt.match(/"id":\s*"([^"]+)"/);
  const productKey = (idMatch && idMatch[1]) || shortName || name;
  const baseIdx = getProductBaseIndex(productKey);
  const prevAttempts = productAttemptMap.get(productKey) || 0;
  productAttemptMap.set(productKey, prevAttempts + 1);

  const templateIdx = (baseIdx + prevAttempts * 3) % TEMPLATES.length;
  const templateFn = TEMPLATES[templateIdx];
  const { mood, intro, story, close } = templateFn(shortName, material, category);

  const summary = [mood, intro, story, close].join(' ');

  return Promise.resolve({
    description: {
      summary,
      mood_line: mood,
      intro,
      story,
      close,
    },
    care_and_maintenance: {
      instructions: politeInstructions,
      avoid: politeAvoid,
    },
    warranty: {
      applicable: true,
      status_line: '**Yes**, it has a warranty of **12 months**.',
      points: [
        'Covers manufacturing defects in materials and workmanship.',
        'Covers defects in the production finish under normal use.',
        'Excludes accidental damage or misuse.',
      ],
    },
  });
}

function mockGenerateText({ prompt }) {
  if (prompt.toLowerCase().includes('short')) return Promise.resolve('Make the product description more concise and shorter.');
  if (prompt.toLowerCase().includes('long')) return Promise.resolve('Make the product description more detailed and longer.');
  return Promise.resolve('Be more specific and grounded in the referenced material category when phrasing care instructions.');
}

module.exports = { mockGenerateContent, mockGenerateText, resetUsedTracking };
