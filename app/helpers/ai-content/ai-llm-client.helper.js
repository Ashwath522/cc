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
  const category = extractField(userPrompt, 'Category') || '';
  const subcategory = extractField(userPrompt, 'Subcategory') || extractField(userPrompt, 'subcategory') || '';
  const material = extractField(userPrompt, 'Primary material') || 'hardwood';
  const finish = extractField(userPrompt, 'Color / finish') || 'natural finish';

  const catNorm = (category || '').toLowerCase();
  const subcatNorm = (subcategory || '').toLowerCase();
  const nameNorm = (name || '').toLowerCase();

  const isMattress = /mattress/i.test(catNorm) || /mattress/i.test(subcatNorm) || /mattress/i.test(nameNorm);
  const isWardrobe = /wardrobe|armoire/i.test(catNorm) || /wardrobe|armoire/i.test(subcatNorm) || /wardrobe/i.test(nameNorm);
  const isKids = /kids|child|bunk/i.test(catNorm) || /kids|child|bunk|pinwheels/i.test(subcatNorm) || /kids|bunk/i.test(nameNorm);
  const isStorage = /bedroom storage|storage|dressing|nightstand|bedside|chest|drawer/i.test(catNorm) ||
                    /bedroom storage|dressing|nightstand|bedside|chest|drawer/i.test(subcatNorm) ||
                    /dressing|nightstand|bedside|chest of drawer/i.test(nameNorm);

  const isPlayful = systemPrompt.toLowerCase().includes('playful') || systemPrompt.toLowerCase().includes('breezy');
  const isMinimal = systemPrompt.toLowerCase().includes('minimal') || systemPrompt.toLowerCase().includes('clean lines');
  const isElegant = systemPrompt.toLowerCase().includes('elegant') || systemPrompt.toLowerCase().includes('architectural');
  const isPremium = systemPrompt.toLowerCase().includes('premium') || systemPrompt.toLowerCase().includes('opulent');

  let mood = '';
  let intro = '';
  let story = '';
  let close = '';

  if (isStorage) {
    if (isPlayful) {
      mood = 'Bright and tidy mornings start right here.';
      intro = 'This dressing unit is defined by an upbeat profile tailored for relaxed daily ease.';
      story = `Crafted from durable ${material}, the ${finish} handles daily life with effortless charm and carefree stability. Smooth drawers and sunny tones keep your vanity space bright and welcoming without taking things too seriously. Thoughtful compartments ensure every daily essential stays neatly within reach.`;
      close = `Rest easy and unwind tonight with cheerful vanity organization with the ${shortName}.`;
    } else if (isMinimal) {
      mood = 'Clean profiles bring organized tranquility.';
      intro = 'This storage piece is defined by an understated geometric silhouette crafted for purposeful daily utility.';
      story = `Constructed from resilient ${material}, the robust framework provides enduring strength and dependable support through thoughtful domestic utility. Smooth-gliding compartments and an authentic natural finish let ambient light accentuate the rich wood grain. Considered proportions ensure seamless access while elevating your daily living routine.`;
      close = `Bring structured clarity and effortless storage order to your space with the ${shortName}.`;
    } else if (isElegant) {
      mood = 'Sculptural symmetry anchors your dressing space.';
      intro = 'This dressing unit is defined by cleanly sculpted drawer fronts that create an architectural presence.';
      story = `Crafted from durable ${material}, the structure ensures dependable stability and lasting strength for everyday living. Gently beveled profiles and a refined finish accentuate the rich natural grain throughout the sculpted drawer fronts. Precision craftsmanship ensures effortless gliding and timeless architectural elegance.`;
      close = `Bring timeless sophistication and poise to your vanity suite with the ${shortName}.`;
    } else if (isPremium) {
      mood = 'Indulge in consummate dressing luxury.';
      intro = 'This dressing table is defined by an opulent silhouette that commands admiration from every angle.';
      story = `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity for your private sanctuary. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail. Hand-fitted drawer linings and whisper-quiet runners ensure an elevated morning dressing ritual.`;
      close = `Bring enduring opulence and heirloom cabinetry luxury to your room with the ${shortName}.`;
    } else {
      mood = 'Orderly ease shapes your morning routine.';
      intro = 'This storage unit is defined by a welcoming silhouette crafted for everyday domestic rituals.';
      story = `Built from durable ${material}, the ${finish} creates a calm atmosphere with generous compartments and enduring joinery. Flush drawers and considered proportions ensure seamless access while elevating your daily living space. Authentic grain patterns bring approachable warmth and gentle order to your everyday bedroom routine.`;
      close = `Bring everyday warmth and tidy comfort to your bedroom with the ${shortName}.`;
    }
  } else if (isMattress) {
    if (isPlayful) {
      mood = 'Floating on responsive cloud-like comfort.';
      intro = 'This mattress is defined by an adaptive sleep profile designed for relaxed daily ease.';
      story = `Crafted from durable ${material}, the sturdy build handles daily life with effortless charm and carefree stability. Smooth textiles and breathable comfort layers keep your sleep space bright and welcoming without taking things too seriously. Responsive support ensures cheerful mornings and energized wakefulness day after day.`;
      close = `Rest easy and unwind tonight with breezy mattress comfort with the ${shortName}.`;
    } else if (isMinimal) {
      mood = 'Pure stillness inspires deep sleep.';
      intro = 'This mattress is engineered with an adaptive layered profile designed for restorative spinal alignment.';
      story = `Constructed from resilient cushioning layers, the core provides enduring strength and sturdy support through purposeful everyday utility. Pressure-relieving foam and breathable knit textiles let natural airflow circulate unobstructed throughout the night across the sleep surface. Balanced zoning ensures undisturbed rest and effortless relaxation night after night.`;
      close = `Bring restorative tranquility and restful sleep to your nights with the ${shortName}.`;
    } else if (isElegant) {
      mood = 'Engineered support defines transformative rest.';
      intro = 'This mattress is defined by cleanly sculpted quilting that creates an architectural presence.';
      story = `Crafted from durable ${material}, the multi-tier structure ensures dependable stability and lasting strength for everyday living. Precision contours and a refined ticking finish accentuate the orthopedic alignment throughout the form. Advanced pressure relief cradles your posture in deep tranquility and understated sophistication.`;
      close = `Bring ergonomic sophistication and orthopedic poise to your space with the ${shortName}.`;
    } else if (isPremium) {
      mood = 'Indulge in consummate sleep luxury.';
      intro = 'This sleep system is defined by an opulent silhouette that commands admiration from every angle.';
      story = `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity for your master suite. Deeply plush comfort layers and hand-tufted details honor the artisan craftsmanship invested in every detail. Specialized tension-relief zones deliver uncompromising stillness and restorative indulgence every single night.`;
      close = `Bring enduring mattress opulence and heirloom luxury to your room with the ${shortName}.`;
    } else {
      mood = 'Awaken to restorative comfort.';
      intro = 'This mattress is defined by a welcoming contour crafted for restorative sleep rituals.';
      story = `Built from durable ${material}, the ${finish} creates a soothing atmosphere filled with restorative comfort and quiet strength. Soft breathable textiles and balanced support layers make every evening feel effortless and deeply restful. Authentic craftsmanship ensures uninterrupted slumber and gentle peace night after night.`;
      close = `Bring everyday warmth and peaceful mattress comfort to your bedroom with the ${shortName}.`;
    }
  } else if (isWardrobe) {
    if (isPlayful) {
      mood = 'Bright open wardrobes bring effortless styling.';
      intro = 'This wardrobe is defined by an upbeat silhouette designed for relaxed daily ease.';
      story = `Crafted from durable ${material}, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and sunny tones keep your dressing space bright and welcoming without taking things too seriously. Generous internal compartments keep all your favorite garments organized and ready to wear.`;
      close = `Rest easy and dress with breezy confidence every morning with the ${shortName}.`;
    } else if (isMinimal) {
      mood = 'Structured harmony organizes your wardrobe.';
      intro = 'This wardrobe is defined by an expansive architectural presence planned for extensive apparel curation.';
      story = `Constructed from resilient ${material}, the substantial framework provides enduring strength and sturdy support through purposeful everyday utility. Thoughtfully arranged hanging rails and a refined finish let natural light highlight the streamlined panels. Generous internal compartments keep seasonal apparel readily accessible for organized everyday living.`;
      close = `Bring pure simplicity and balanced apparel order to your space with the ${shortName}.`;
    } else if (isElegant) {
      mood = 'Monolithic elegance defines your curated wardrobe.';
      intro = 'This wardrobe is defined by cleanly sculpted full-height doors that create an architectural presence.';
      story = `Crafted from durable ${material}, the structure ensures dependable stability and lasting strength for everyday living. Gently beveled profiles and a refined finish accentuate the rich natural grain across the full-height doors. Spacious interior planning offers discerning organization and enduring architectural grace.`;
      close = `Bring sartorial sophistication and architectural poise to your space with the ${shortName}.`;
    } else if (isPremium) {
      mood = 'Indulge in consummate wardrobe luxury.';
      intro = 'This wardrobe is defined by an opulent silhouette that commands admiration from every angle.';
      story = `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity for your curated wardrobe. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail. Generous interior suites and tailored hardware transform daily garment curation into a luxurious ritual.`;
      close = `Bring enduring closet opulence and heirloom luxury to your room with the ${shortName}.`;
    } else {
      mood = 'Seamless wardrobe organization greets your morning.';
      intro = 'This wardrobe is defined by a welcoming silhouette crafted for everyday domestic rituals.';
      story = `Built from durable ${material}, the ${finish} delivers substantial storage capacity and dependable everyday utility throughout your home. Thoughtfully arranged hanging rails and smooth-gliding doors keep seasonal apparel readily accessible across the room. Rich natural tones bring approachable warmth and timeless order to your dressing routine.`;
      close = `Bring everyday warmth and peaceful closet order to your bedroom with the ${shortName}.`;
    }
  } else if (isKids) {
    if (isPlayful) {
      mood = 'Playful adventures and cozy bedtimes await.';
      intro = 'This youth bunk bed is defined by an upbeat silhouette designed for relaxed daily ease.';
      story = `Crafted from durable ${material}, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and bright natural tones keep your child space welcoming without taking things too seriously. Thoughtful safety rails and rounded contours ensure reliable security and happy dreams night after night.`;
      close = `Rest easy and dream with breezy joy tonight with the ${shortName}.`;
    } else if (isMinimal) {
      mood = 'Tidy spaces inspire joyful young imaginations.';
      intro = 'This youth bunk bed is defined by an understated geometric profile designed for clutter-free clarity.';
      story = `Constructed from resilient ${material}, the frame provides enduring strength and sturdy support through purposeful everyday utility. Flush protective surfaces and a matte finish let natural light flow unobstructed across the cheerful room. Thoughtful safety barriers and balanced proportions ensure tidy order and relaxed sleep every night.`;
      close = `Bring modern simplicity and quiet safety to your child space with the ${shortName}.`;
    } else if (isElegant) {
      mood = 'Graceful youth design fosters sweet slumbers.';
      intro = 'This youth bed is defined by cleanly sculpted safety rails that create an architectural presence.';
      story = `Crafted from durable ${material}, the structure ensures dependable stability and lasting strength for everyday living. Gently beveled safety rails and a refined finish accentuate the rich natural grain throughout the form. Graceful proportions create a comforting sanctuary where bedtime stories and joyful rest naturally unfold.`;
      close = `Bring gentle charm and heirloom poise to your child space with the ${shortName}.`;
    } else if (isPremium) {
      mood = 'Indulge in consummate nursery craftsmanship.';
      intro = 'This kids room bed is defined by an opulent silhouette that commands admiration from every angle.';
      story = `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity for growing families. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail. Elevated safety detailing and hand-rubbed joinery ensure heirloom durability and peaceful nighttime comfort.`;
      close = `Bring enduring playroom opulence and heirloom luxury to your room with the ${shortName}.`;
    } else {
      mood = 'Cozy cuddles and safe dreams create magic.';
      intro = 'This kids bed is defined by a welcoming silhouette crafted for everyday domestic rituals.';
      story = `Built from durable ${material}, the ${finish} creates a comforting haven filled with gentle charm and quiet strength. Smooth protective sealants and inviting textures make every evening feel effortless and grounded throughout the home. Thoughtful safety contours ensure sweet dreams and peaceful rest for your growing child.`;
      close = `Bring everyday warmth and playful comfort to your child bedroom with the ${shortName}.`;
    }
  } else {
    // Default: Beds
    if (isPlayful) {
      mood = 'Ready for breezy comfort in bed?';
      intro = `This bed is defined by an upbeat silhouette designed for relaxed daily ease.`;
      story = `Crafted from durable ${material}, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously. Thoughtful proportions ensure lasting comfort and cheerful relaxation for years to come.`;
      close = `Rest easy and unwind tonight with breezy comfort with the ${shortName}.`;
    } else if (isMinimal) {
      mood = 'Clean lines bring quiet bedroom order.';
      intro = `This bed is defined by an understated geometric profile designed for clutter-free clarity.`;
      story = `Constructed from resilient ${material}, the frame provides enduring strength and sturdy support through purposeful everyday utility. Flush surfaces and a refined matte finish let natural light flow unobstructed across the room while accentuating the authentic grain. Thoughtful joinery ensures lasting balance and effortless living for years to come.`;
      close = `Bring modern simplicity and quiet bedroom order to your space with the ${shortName}.`;
    } else if (isElegant) {
      mood = 'A statement in contemporary bed design.';
      intro = `This bed is defined by a cleanly sculpted headboard that creates an architectural presence.`;
      story = `Crafted from durable ${material}, the structure ensures dependable stability and lasting strength for everyday living. Gently beveled profiles and a refined finish accentuate the rich natural grain throughout the architectural form. Considered proportions lend an unmistakable sense of enduring grace to the entire space.`;
      close = `Bring timeless sophistication and poise to your sleep space with the ${shortName}.`;
    } else if (isPremium) {
      mood = 'Indulge in consummate sleep suite luxury.';
      intro = `This bed is defined by an opulent silhouette that commands admiration from every angle.`;
      story = `Masterfully fashioned from select ${material}, the substantial framework provides exceptional generational longevity for your master suite. Deeply saturated tones and hand-buffed finishes honor the artisan craftsmanship invested in every detail. Heirloom joinery and rich textures elevate your nightly retreat into an extraordinary experience.`;
      close = `Bring enduring opulence and heirloom luxury to your master room with the ${shortName}.`;
    } else {
      mood = 'Wake up to warm bed comfort.';
      intro = `This bed is defined by a welcoming silhouette crafted for everyday domestic rituals.`;
      story = `Built from durable ${material}, the ${finish} creates a soothing atmosphere filled with lived-in charm and quiet strength. Soft contours and inviting textures make every evening feel effortless and grounded throughout the home. Thoughtful craftsmanship ensures trusted comfort and gentle ease for years to come.`;
      close = `Bring everyday warmth and peaceful comfort to your bedroom with the ${shortName}.`;
    }
  }

  const summary = `${mood} ${intro} ${story} ${close}`.trim();

  return {
    description: {
      summary,
      mood_line: mood,
      intro,
      story,
      close,
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
