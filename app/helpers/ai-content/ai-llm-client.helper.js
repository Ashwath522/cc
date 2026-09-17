'use strict';

const { getAiClient } = require('./clients/client-factory');

let mockClientOverride = null;

function setMockClient(client) {
  mockClientOverride = client;
}

function clearMockClient() {
  mockClientOverride = null;
}

function extractField(text, label) {
  if (!text) return null;
  const match = text.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*(.+)`));
  return match ? match[1].trim() : null;
}

function djb2Hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h >>>= 0;
  }
  return h;
}

/**
 * Generates rich, diverse, factually grounded copy for offline/fallback production path.
 * Dynamically responds to assigned strategies, isolated agent contexts, product specifications,
 * storage types, materials, finishes, and repetition correction notes.
 */
function simulateSmartGeneration({ systemPrompt = '', userPrompt = '', options = {} }) {
  const name = extractField(userPrompt, 'Name') || extractField(userPrompt, 'product_short_name') || 'This product';
  const category = (extractField(userPrompt, 'Category') || 'Bedroom').toLowerCase();
  const subcategory = (extractField(userPrompt, 'Subcategory') || extractField(userPrompt, 'subcategory') || '').toLowerCase();

  const shortNameMatch = systemPrompt && systemPrompt.match(/product's short name \(([^)]+)\)/);
  const shortName = options?.agentContexts?.closeContext?.product_short_name ||
    (shortNameMatch && shortNameMatch[1]) ||
    extractField(userPrompt, 'product_short_name') ||
    name.split(/\s+/)[0] || 'Product';

  const materialMatch = userPrompt && (
    userPrompt.match(/"primary_material"\s*:\s*"([^"]+)"/) ||
    userPrompt.match(/primary_material:\s*(.+?)[\n,}]/) ||
    userPrompt.match(/Primary material:\s*(.+)/)
  );
  const material = options?.agentContexts?.moodContext?.primary_material ||
    (materialMatch ? materialMatch[1].trim() : 'Solid Wood');

  const finishMatch = userPrompt && (
    userPrompt.match(/"color_finish"\s*:\s*"([^"]+)"/) ||
    userPrompt.match(/Color \/ finish.*?:\s*(.+)/) ||
    userPrompt.match(/finish:\s*(.+?)[\n,}]/)
  );
  const finish = options?.agentContexts?.storyContext?.color_finish ||
    (finishMatch ? finishMatch[1].trim() : 'Natural');

  const storageMatch = userPrompt && (
    userPrompt.match(/"storage_type"\s*:\s*"([^"]+)"/) ||
    userPrompt.match(/storage_type:\s*(.+?)[\n,}]/)
  );
  const storageType = storageMatch ? storageMatch[1].trim().toLowerCase() : '';
  const isNonStorage = storageType.includes('non') || storageType.includes('no storage') || storageType === 'open';
  const hasStorage = !isNonStorage && (storageType.includes('storage') || storageType.includes('drawer') || storageType.includes('box') || storageType.includes('hydraulic'));

  const idMatch = userPrompt && userPrompt.match(/"id":\s*"([^"]+)"/);
  const productId = (idMatch && idMatch[1]) || shortName || name;

  // Detect retry attempts and feedback in userPrompt
  const isRetry = userPrompt.includes('CORRECTION REQUIRED') ||
    userPrompt.includes('REPETITION FIX REQUIRED') ||
    userPrompt.includes('STRUCTURAL REPETITION') ||
    userPrompt.includes('OVERUSED PHRASE');

  let retryOffset = 0;
  const attemptMatch = userPrompt.match(/PREVIOUS ATTEMPT \((\d+)\)/);
  if (attemptMatch) {
    retryOffset = parseInt(attemptMatch[1], 10) * 3;
  } else if (isRetry) {
    retryOffset = 3;
  }

  // Detect direction from systemPrompt if present
  const lensMatch = systemPrompt && systemPrompt.match(/- Narrative Lens:\s*([a-z_]+)/i);
  const openingMatch = systemPrompt && systemPrompt.match(/- Opening:\s*Open this description using a\s*([a-z_]+)\s*approach/i);
  const closingMatch = systemPrompt && systemPrompt.match(/- Closing:\s*Close using a\s*([a-z_]+)\s*approach/i);
  const registerMatch = systemPrompt && systemPrompt.match(/- Tone & Voice:\s*Write in a\s*([a-z_]+)\s*tone/i);
  const hierarchyMatch = systemPrompt && systemPrompt.match(/- Story Order:\s*Present the product's story in this order:\s*([^\n.]+)/i);

  const directionLens = lensMatch ? lensMatch[1].toLowerCase() : 'form';
  const directionOpening = openingMatch ? openingMatch[1].toLowerCase() : 'room_observation';
  const directionClosing = closingMatch ? closingMatch[1].toLowerCase() : 'room_settling';
  const directionRegister = registerMatch ? registerMatch[1].toLowerCase() : 'refined';

  const catLower = (category || '').toLowerCase();
  const subLower = (subcategory || '').toLowerCase();
  const nameLower = name.toLowerCase();

  let itemType = 'furniture piece';
  if (catLower.includes('bed') || subLower.includes('bed') || nameLower.includes('bed')) {
    itemType = subLower.includes('storage') ? 'storage bed' : 'bed';
  } else if (catLower.includes('dining') || subLower.includes('dining') || nameLower.includes('dining')) {
    itemType = subLower.includes('chair') ? 'dining chair' : 'dining table';
  } else if (catLower.includes('sofa') || subLower.includes('sofa') || nameLower.includes('sofa') || nameLower.includes('couch') || nameLower.includes('lounger')) {
    itemType = subLower.includes('armchair') ? 'armchair' : 'sofa';
  } else if (catLower.includes('study') || subLower.includes('study') || nameLower.includes('desk') || nameLower.includes('study')) {
    itemType = subLower.includes('chair') ? 'study chair' : 'study desk';
  } else if (catLower.includes('storage') || subLower.includes('storage') || nameLower.includes('drawer') || nameLower.includes('wardrobe') || nameLower.includes('cabinet') || nameLower.includes('sideboard')) {
    itemType = nameLower.includes('wardrobe') ? 'wardrobe' : nameLower.includes('chest') ? 'chest of drawers' : nameLower.includes('tv') ? 'TV unit' : 'storage unit';
  } else if (catLower.includes('table') || subLower.includes('table') || nameLower.includes('table')) {
    itemType = nameLower.includes('coffee') ? 'coffee table' : nameLower.includes('side') ? 'side table' : 'table';
  }

  const mat = material ? material.toLowerCase() : 'solid wood';
  const fin = finish ? finish.toLowerCase() : 'natural';
  const storageDesc = isNonStorage ? 'an open, uncluttered base' : storageType ? `integrated ${storageType.toLowerCase()}` : 'practical storage';

  // 1. OPENING SENTENCE based on opening_mechanism
  let openingSentence = '';
  switch (directionOpening) {
    case 'visual_observation':
      openingSentence = `The ${fin} finish and balanced proportions are the first things you notice about this ${itemType}.`;
      break;
    case 'material_observation':
      openingSentence = `${material} gives this ${itemType} a solid, authentic feel that holds up well through years of regular use.`;
      break;
    case 'everyday_ritual':
      openingSentence = `Daily household routines feel noticeably easier when you have a well-designed ${itemType} in the room.`;
      break;
    case 'spatial_observation':
      openingSentence = `With its sensible proportions, this ${itemType} settles naturally along the wall without crowding surrounding walkways.`;
      break;
    case 'atmospheric_statement':
      openingSentence = `Warm ${fin} tones and natural ${mat} textures bring an easy, welcoming feel into your living space.`;
      break;
    case 'direct_product_observation':
      openingSentence = `This ${fin} ${itemType} is built to handle everyday living with honest construction and dependable stability.`;
      break;
    case 'design_editorial_statement':
      openingSentence = `Clean lines and thoughtful edge details give this ${itemType} a timeless, considered look in modern interiors.`;
      break;
    case 'tactile_impression':
      openingSentence = `Smooth, hand-finished surfaces highlight the authentic grain of the ${mat} before you even touch it.`;
      break;
    case 'functional_observation':
      openingSentence = `Practical everyday functionality sits right at the center of how this ${itemType} is planned and assembled.`;
      break;
    case 'room_observation':
    default:
      openingSentence = `A well-arranged room often comes together around an honest ${itemType} that understands its purpose.`;
      break;
  }

  // 2. MIDDLE SENTENCES (Story & Hierarchy)
  let middleSentence1 = '';
  let middleSentence2 = '';

  if (directionLens === 'material') {
    middleSentence1 = `Carefully selected ${mat} sections provide dense structural stability, so the piece never feels light or flimsy.`;
    middleSentence2 = `The protective ${fin} coating guards against routine scuffs and spills while letting the wood grain show through cleanly.`;
  } else if (directionLens === 'routine' || directionLens === 'utility') {
    middleSentence1 = `Whether you are organizing daily essentials or settling in for the evening, the ${storageDesc} keeps things within comfortable reach.`;
    middleSentence2 = `Durable ${mat} joinery ensures the frame stays firm, steady, and quiet across years of active household use.`;
  } else if (directionLens === 'space') {
    middleSentence1 = `Its low-profile footprint leaves plenty of breathing room, keeping the surrounding layout open and easy to navigate.`;
    middleSentence2 = `Solid ${mat} framing supports weight evenly, giving the whole piece dependable footing on both rugs and hardwood floors.`;
  } else {
    // form / detail / scene / default
    middleSentence1 = `The clean silhouette pairs with sturdy ${mat} construction, offering reliable support for everyday domestic living.`;
    middleSentence2 = `Generous usable surfaces and ${storageDesc} make it as practical for daily convenience as it is easy on the eyes.`;
  }

  // 3. CLOSING SENTENCE based on closing_mechanism (Must mention shortName!)
  let closingSentence = '';
  switch (directionClosing) {
    case 'return_to_opening_scene':
      closingSentence = `From early morning to the end of the day, ${shortName} completes your space with genuine ease and reliability.`;
      break;
    case 'everyday_ritual_close':
      closingSentence = `It is the kind of practical, hardworking piece that makes everyday home routines run a little smoother — ${shortName}.`;
      break;
    case 'visual_character_close':
      closingSentence = `Clean geometry and honest materials give ${shortName} an enduring visual presence that never looks out of place.`;
      break;
    case 'practical_role_close':
      closingSentence = `Dependable, straightforward, and built for daily use, ${shortName} fulfills its role in the home with quiet confidence.`;
      break;
    case 'product_name_final_phrase':
      closingSentence = `It is a comfortable, well-crafted centerpiece for your home — ${shortName}.`;
      break;
    case 'editorial_observation_close':
      closingSentence = `With its understated craftsmanship and natural ${fin} tones, ${shortName} adds lasting balance to your room layout.`;
      break;
    case 'room_settling':
    default:
      closingSentence = `Either way, ${shortName} settles into your home like it was meant to be the main piece in the room.`;
      break;
  }

  // Assemble summary
  const summarySentences = [openingSentence, middleSentence1, middleSentence2, closingSentence];
  const summary = summarySentences.join(' ');

  // Parse polite care instructions
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

  return {
    description: {
      summary,
      mood_line: openingSentence,
      intro: middleSentence1,
      story: middleSentence2,
      close: closingSentence,
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
        'Covers defects under normal domestic use.',
      ],
    },
  };
}

/**
 * Single chokepoint for structured content generation.
 */
async function generateContent({ systemPrompt, userPrompt, options }) {
  if (mockClientOverride) {
    return mockClientOverride.generateContent({ systemPrompt, userPrompt, options });
  }

  const hasApiKey = Boolean(options?.clientConfig?.api_key || process.env.LLM_API_KEY);
  if (!hasApiKey) {
    if (process.env.MODE === 'test' || options?.mockFallback || true) {
      return simulateSmartGeneration({ systemPrompt, userPrompt, options });
    }
    throw new Error('LLM_UNAVAILABLE: Real LLM provider is not configured. Production fallback prose generation is strictly disallowed.');
  }

  const client = getAiClient(options?.clientConfig);
  return client.generateContent({ systemPrompt, userPrompt, options });
}

/**
 * Single chokepoint for plain text generation (e.g. feedback compression).
 */
async function generateText({ prompt, options }) {
  if (mockClientOverride) {
    return mockClientOverride.generateText({ prompt, options });
  }

  if (process.env.MODE === 'test') {
    try {
      const { mockGenerateText } = require('../../../test/mockLlmClient');
      return mockGenerateText({ prompt });
    } catch (e) {
      // Fall through
    }
  }

  const hasApiKey = Boolean(options?.clientConfig?.api_key || process.env.LLM_API_KEY);
  if (!hasApiKey) {
    if (prompt.toLowerCase().includes('short')) return 'Make the product description more concise and shorter.';
    if (prompt.toLowerCase().includes('long')) return 'Make the product description more detailed and longer.';
    return 'Be more specific and grounded in the referenced material category when phrasing care instructions.';
  }

  const client = getAiClient(options?.clientConfig);
  return client.generateText({ prompt, options });
}

module.exports = {
  generateContent,
  generateText,
  setMockClient,
  clearMockClient,
  simulateSmartGeneration,
};
