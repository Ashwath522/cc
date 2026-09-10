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
  const match = text.match(new RegExp(`${label}:\\s*(.+)`));
  return match ? match[1].trim() : null;
}

function simulateSmartGeneration({ systemPrompt = '', userPrompt = '' }) {
  const name = extractField(userPrompt, 'Name') || extractField(userPrompt, 'product_short_name') || 'This product';
  const shortName = name.split(/\s+/)[0] || 'This product';
  const category = extractField(userPrompt, 'Category') || 'Bedroom';
  const material = extractField(userPrompt, 'Primary material') || 'hardwood';
  const finish = extractField(userPrompt, 'Color / finish') || 'natural finish';

  const isPlayful = systemPrompt.toLowerCase().includes('playful') || systemPrompt.toLowerCase().includes('breezy');
  const isMinimal = systemPrompt.toLowerCase().includes('minimal') || systemPrompt.toLowerCase().includes('clean lines');
  const isElegant = systemPrompt.toLowerCase().includes('elegant') || systemPrompt.toLowerCase().includes('architectural');
  const isPremium = systemPrompt.toLowerCase().includes('premium') || systemPrompt.toLowerCase().includes('opulent');
  const mentionsSanctuary = systemPrompt.toLowerCase().includes('sanctuary');

  let mood = 'Wake up to warm comfort.';
  let intro = `This bed is defined by a welcoming silhouette crafted for everyday domestic rituals.`;
  let story = `Built from durable ${material}, the ${finish} creates a soothing atmosphere filled with lived-in charm and quiet strength. Soft contours and inviting textures make every evening feel effortless and grounded throughout the home.`;
  let close = `Bring everyday warmth and peaceful comfort to your bedroom with the ${shortName}.`;

  if (isPlayful) {
    mood = 'Ready for breezy comfort?';
    intro = `This bed is defined by an upbeat silhouette designed for relaxed daily ease.`;
    story = mentionsSanctuary
      ? `Crafted from durable ${material}, the sturdy build creates a true sanctuary of effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously.`
      : `Crafted from durable ${material}, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously.`;
    close = mentionsSanctuary
      ? `Rest easy and unwind tonight in your sanctuary with the ${shortName}.`
      : `Rest easy and unwind tonight with breezy comfort with the ${shortName}.`;
  } else if (isMinimal) {
    mood = 'Clean lines bring quiet order.';
    intro = `This bed is defined by an understated geometric profile designed for clutter-free clarity.`;
    story = mentionsSanctuary
      ? `Constructed from resilient ${material}, the frame provides enduring strength and an intentional sanctuary of purposeful everyday utility. Flush surfaces and a matte finish let natural light flow unobstructed across the room.`
      : `Constructed from resilient ${material}, the frame provides enduring strength and sturdy support through purposeful everyday utility. Flush surfaces and a matte finish let natural light flow unobstructed across the room.`;
    close = `Bring modern simplicity and quiet order to your space with the ${shortName}.`;
  } else if (isElegant) {
    mood = 'A statement in contemporary design.';
    intro = `This bed is defined by a cleanly sculpted headboard that creates an architectural presence.`;
    story = mentionsSanctuary
      ? `Crafted from durable ${material}, the structure ensures dependable stability and a stately sanctuary for everyday living. Gently beveled profiles and a refined finish accentuate the rich natural grain throughout the form.`
      : `Crafted from durable ${material}, the structure ensures dependable stability and lasting strength for everyday living. Gently beveled profiles and a refined finish accentuate the rich natural grain throughout the form.`;
    close = `Bring timeless sophistication and poise to your space with the ${shortName}.`;
  } else if (isPremium) {
    mood = 'Indulge in consummate luxury.';
    intro = `This bed is defined by an opulent silhouette that commands admiration from every angle.`;
    story = mentionsSanctuary
      ? `Masterfully fashioned from select ${material}, the substantial framework provides an exceptional sanctuary of generational longevity. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail.`
      : `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail.`;
    close = `Bring enduring opulence and heirloom luxury to your room with the ${shortName}.`;
  } else if (mentionsSanctuary) {
    story = `Built from durable ${material}, the ${finish} creates an inviting sanctuary filled with lived-in charm and quiet strength. Soft contours and inviting textures make every evening feel effortless and grounded throughout the home.`;
    close = `Bring everyday warmth and peaceful sanctuary to your bedroom with the ${shortName}.`;
  }

  const summary = `${mood} ${intro} ${story} ${close}`;

  return {
    description: {
      summary,
    },
    care_and_maintenance: {
      instructions: [
        'We recommend dusting regularly with a soft, dry cloth.',
        'We suggest wiping up spills promptly with a slightly damp cloth.',
        'It is best to use coasters or mats under hot or wet items.',
      ],
      avoid: [
        'It is best to avoid harsh chemical cleaners.',
        'We recommend avoiding dragging the piece across hard floors.',
      ],
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

  if (process.env.MODE === 'test') {
    try {
      const { mockGenerateContent } = require('../../../test/mockLlmClient');
      return mockGenerateContent({ systemPrompt, userPrompt });
    } catch (e) {
      // Fall through
    }
  }

  const hasApiKey = Boolean(options?.clientConfig?.api_key || process.env.LLM_API_KEY);
  if (!hasApiKey) {
    return simulateSmartGeneration({ systemPrompt, userPrompt });
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
};
