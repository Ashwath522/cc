'use strict';

/**
 * Shared Copy Composer Helper
 * Provides deterministic pseudo-random seed utilities, theme-loop synchronization,
 * rich combinatorial closer generation, and schema word-count guarantees.
 */

const THEME_FAMILIES = {
  calm: {
    moodWords: ['calm', 'rest', 'peace', 'peaceful', 'serene', 'serenity', 'unhurried', 'quiet', 'soothe', 'soothing', 'relax', 'relaxing', 'stillness', 'gentle', 'ease', 'tranquil', 'tranquility', 'unwind', 'mornings', 'wake', 'experience'],
    closeWords: ['rest', 'restful', 'serenity', 'serene', 'calm', 'peace', 'peaceful', 'comfort', 'retreat', 'unwind', 'sleep', 'slumber', 'quiet', 'ease', 'tranquility', 'recharge', 'haven', 'order', 'balance'],
  },
  elegant: {
    moodWords: ['statement', 'contemporary', 'elegant', 'elegance', 'sophisticated', 'sophistication', 'refined', 'refinement', 'grace', 'graceful', 'poise', 'sculptural', 'architectural', 'modern', 'distinction', 'timeless', 'elevate'],
    closeWords: ['sophistication', 'sophisticated', 'statement', 'elegance', 'elegant', 'refined', 'refinement', 'style', 'presence', 'distinction', 'elevate', 'grace', 'aesthetic', 'polish', 'contemporary', 'balance'],
  },
  inviting: {
    moodWords: ['inviting', 'warm', 'warmth', 'cozy', 'welcome', 'welcoming', 'gather', 'gathering', 'comfort', 'comforting', 'hearth', 'home', 'embrace', 'hospitable'],
    closeWords: ['warmth', 'warm', 'welcome', 'welcoming', 'inviting', 'gather', 'comfort', 'living', 'home', 'cozy', 'belonging', 'presence', 'balance'],
  },
  minimal: {
    moodWords: ['minimal', 'order', 'simplicity', 'simple', 'clean', 'clarity', 'uncluttered', 'essential', 'balance', 'balanced', 'harmony'],
    closeWords: ['order', 'balance', 'balanced', 'simplicity', 'simple', 'clean', 'clarity', 'harmony', 'functional', 'pure', 'minimal', 'calm'],
  },
  craft: {
    moodWords: ['grounded', 'enduring', 'craft', 'craftsmanship', 'heritage', 'rooted', 'authentic', 'foundation', 'strength', 'solid', 'lasting'],
    closeWords: ['enduring', 'lasting', 'grounded', 'craftsmanship', 'strength', 'integrity', 'heritage', 'foundation', 'solid', 'dependable', 'honest', 'purpose', 'quality', 'accurate', 'consistent', 'principled', 'material', 'honest in'],
  },
  luxury: {
    moodWords: ['luxury', 'luxurious', 'indulgence', 'indulgent', 'grand', 'opulent', 'sumptuous', 'exquisite', 'masterpiece', 'prestige'],
    closeWords: ['luxury', 'luxurious', 'indulgence', 'indulgent', 'craftsmanship', 'refined', 'sophistication', 'grandeur', 'elevated', 'prestige', 'comfort'],
  },
  playful: {
    moodWords: ['playful', 'cheerful', 'bright', 'joy', 'joyful', 'vibrant', 'lively', 'delight', 'energy', 'friendly'],
    closeWords: ['playful', 'cheerful', 'joy', 'delight', 'bright', 'energy', 'ease', 'comfort', 'warmth', 'welcome', 'charm'],
  },
};

function hashSeed(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function pick(arr, seed, offset = 0) {
  if (!arr || arr.length === 0) return '';
  return arr[(seed + offset) % arr.length];
}

function detectMoodFamily(moodLine) {
  if (!moodLine) return 'minimal';
  const moodTokens = moodLine.toLowerCase().split(/[^a-z0-9]+/);
  for (const [familyName, family] of Object.entries(THEME_FAMILIES)) {
    if (family.moodWords.some((w) => moodTokens.includes(w))) {
      return familyName;
    }
  }
  return 'minimal';
}

function buildSynchronizedCloser(moodLine, shortName, mat, finish, facts, seed, categoryType = 'bedroom') {
  const detectedTheme = detectMoodFamily(moodLine);

  const verbs = [
    `${shortName} settles into your bedroom suite with`,
    `${shortName} brings`,
    `${shortName} provides dependable domestic service with`,
    `${shortName} completes your room arrangement with`,
    `${shortName} delivers lasting domestic reliability with`,
    `${shortName} supports your household habits with`,
    `${shortName} enriches the domestic environment with`,
    `${shortName} handles daily domestic life with`,
    `${shortName} introduces thoughtful functional discipline with`,
    `${shortName} coordinates with surrounding furniture through`,
    `${shortName} serves as a reliable domestic companion through`,
    `${shortName} enhances your daily living space with`,
    `${shortName} anchors your personal resting space with`,
    `${shortName} fits naturally into household routines through`,
    `${shortName} maintains a reliable domestic presence through`,
    `${shortName} establishes an approachable focal point with`,
  ];

  let midQualities = [];
  if (categoryType === 'bed') {
    midQualities = facts.isHydraulic
      ? [
          `honest ${mat} durability, smooth hydraulic lift utility, and`,
          `steadfast ${mat} stability, concealed storage capacity, and`,
          `clean ${finish} visual character, robust framing, and`,
          `authentic ${mat} construction, accessible under-bed volume, and`,
          `resilient ${mat} paneling, expansive storage, and`,
          `balanced platform proportions, honest timber strength, and`,
          `dependable lift hardware, spacious internal capacity, and`,
          `solid platform levelness, concealed storage order, and`,
        ]
      : facts.isBoxStorage
      ? [
          `honest ${mat} durability, integrated box storage convenience, and`,
          `steadfast ${mat} stability, dust-protected compartments, and`,
          `clean ${finish} visual character, organized under-bed capacity, and`,
          `authentic ${mat} construction, compartmentalized storage, and`,
          `resilient ${mat} paneling, dependable under-bed order, and`,
          `balanced platform proportions, organized utility, and`,
          `built-in drawer accessibility, solid timber framing, and`,
          `organized under-bed storage, steadfast frame balance, and`,
        ]
      : [
          `honest ${mat} durability, open base lightness, and`,
          `steadfast ${mat} stability, generous perimeter clearance, and`,
          `clean ${finish} visual character, sturdy framing, and`,
          `authentic ${mat} construction, unencumbered floor space, and`,
          `resilient ${mat} paneling, unhindered room flow, and`,
          `space-conscious platform proportions, honest timber strength, and`,
          `elevated leg architecture, level mattress support, and`,
          `unobstructed lower clearance, solid platform stability, and`,
        ];
  } else if (categoryType === 'mattress') {
    midQualities = [
      `resilient ${mat} core density, uniform surface cushioning, and`,
      `adaptive ${mat} responsiveness, dependable weight distribution, and`,
      `durable ${mat} layering, steady motion isolation, and`,
      `consistent ${mat} firmness, lasting edge-to-edge support, and`,
      `high-density ${mat} construction, pressure-relieving comfort, and`,
      `resilient material composition, long-term shape retention, and`,
      `calibrated ${mat} layering, balanced core stability, and`,
      `supportive internal density, even weight absorption, and`,
      `dense internal composition, uniform surface alignment, and`,
      `protective outer casing, steady core resilience, and`,
    ];
  } else if (categoryType === 'wardrobe') {
    midQualities = [
      `honest ${mat} durability, deep hanging clearance, and`,
      `steadfast ${mat} stability, versatile shelf partitioning, and`,
      `clean ${finish} visual character, robust door alignment, and`,
      `authentic ${mat} construction, generous apparel capacity, and`,
      `resilient ${mat} paneling, dust-shielded storage, and`,
      `vertical storage efficiency, organized interior layout, and`,
      `deep shelf compartments, dependable door hardware, and`,
      `spacious hanging rails, solid frame stability, and`,
    ];
  } else if (categoryType === 'kids') {
    midQualities = [
      `honest ${mat} durability, child-friendly proportions, and`,
      `steadfast ${mat} stability, accessible storage compartments, and`,
      `clean ${finish} visual character, rounded edge safety, and`,
      `authentic ${mat} construction, versatile activity utility, and`,
      `resilient ${mat} paneling, wipe-clean surfaces, and`,
      `space-efficient geometry, practical study and rest utility, and`,
      `child-scaled dimensions, sturdy frame construction, and`,
      `approachable functional layout, durable panel strength, and`,
    ];
  } else {
    // Bedroom storage / generic
    midQualities = facts.isNonStorage
      ? [
          `honest ${mat} durability, open-frame lightness, and`,
          `steadfast ${mat} stability, space-saving design, and`,
          `clean ${finish} visual character, sturdy framing, and`,
          `authentic ${mat} construction, generous legroom, and`,
          `resilient ${mat} paneling, unencumbered space, and`,
          `space-conscious proportions, honest materials, and`,
          `elevated base geometry, level tabletop support, and`,
          `unobstructed lower clearance, solid panel strength, and`,
        ]
      : [
          `honest ${mat} durability, dedicated storage convenience, and`,
          `steadfast ${mat} stability, dust-protected drawers, and`,
          `clean ${finish} visual character, organized compartments, and`,
          `authentic ${mat} construction, smooth drawer storage, and`,
          `resilient ${mat} paneling, ample interior capacity, and`,
          `space-conscious proportions, organized storage, and`,
          `enclosed storage bays, dependable frame balance, and`,
          `accessible drawer capacity, solid timber integrity, and`,
        ];
  }

  const payoffsByTheme = {
    calm: [
      'restful ease.',
      'quiet domestic comfort.',
      'soothing bedroom serenity.',
      'peaceful daily calm.',
      'unhurried morning ease.',
      'tranquil domestic comfort.',
      'restful sleep and quiet ease.',
      'soothing nightly rest.',
      'unhurried restful calm.',
      'peaceful sleep comfort.',
      'gentle domestic ease.',
    ],
    minimal: [
      'balanced order.',
      'clean simplicity.',
      'functional clarity.',
      'minimal balance.',
      'uncluttered harmony.',
      'pure functional order.',
      'balanced clean simplicity.',
      'clean domestic harmony.',
      'uncluttered minimal balance.',
      'essential functional order.',
    ],
    craft: [
      'enduring craftsmanship.',
      'honest material purpose.',
      'lasting domestic strength.',
      'dependable structural integrity.',
      'solid construction quality.',
      'lasting authentic strength.',
      'enduring craft integrity.',
      'dependable domestic strength.',
      'honest functional purpose.',
      'steadfast craft quality.',
    ],
    inviting: [
      'welcoming warmth.',
      'inviting presence.',
      'hospitable comfort.',
      'warm domestic balance.',
      'welcoming home presence.',
      'inviting room presence.',
      'warm living comfort.',
      'inviting domestic warmth.',
      'welcoming comfort and balance.',
    ],
    elegant: [
      'refined presence.',
      'contemporary elegance.',
      'understated sophistication.',
      'graceful balance.',
      'refined aesthetic presence.',
      'contemporary distinction.',
      'graceful refined presence.',
      'refined contemporary poise.',
      'understated modern elegance.',
    ],
    playful: [
      'cheerful comfort.',
      'playful ease.',
      'bright energy.',
      'joyful domestic warmth.',
      'cheerful family comfort.',
      'delightful room charm.',
      'cheerful domestic ease.',
    ],
    luxury: [
      'refined comfort.',
      'luxurious ease.',
      'understated indulgence.',
      'elevated craftsmanship.',
      'grandeur and comfort.',
    ],
  };

  const selectedTheme = payoffsByTheme[detectedTheme] ? detectedTheme : 'minimal';
  const payoffs = payoffsByTheme[selectedTheme];

  const v = pick(verbs, seed, 1);
  const m = pick(midQualities, seed, 5);
  const p = pick(payoffs, seed, 11);

  return `${v} ${m} ${p}`;
}

module.exports = {
  hashSeed,
  pick,
  detectMoodFamily,
  buildSynchronizedCloser,
  THEME_FAMILIES,
};
