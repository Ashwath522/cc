'use strict';

const crypto = require('crypto');
const logger = require('../../common/logger');

// Direction Profile Schema Options
const NARRATIVE_LENSES = Object.freeze([
  'form',
  'material',
  'routine',
  'space',
  'mood',
  'detail',
  'contrast',
  'colour',
  'utility',
  'editorial',
  'minimal',
  'scene',
]);

const FEATURE_HIERARCHIES = Object.freeze([
  'form_material_use',
  'material_form_space',
  'routine_design_use',
  'space_form_material',
  'detail_material_room',
  'colour_form_use',
  'utility_design_room',
  'mood_detail_use',
]);

const OPENING_MECHANISMS = Object.freeze([
  'room_observation',
  'visual_observation',
  'material_observation',
  'everyday_ritual',
  'spatial_observation',
  'atmospheric_statement',
  'direct_product_observation',
  'design_editorial_statement',
  'tactile_impression',
  'functional_observation',
]);

const CLOSING_MECHANISMS = Object.freeze([
  'return_to_opening_scene',
  'everyday_ritual_close',
  'visual_character_close',
  'room_settling',
  'practical_role_close',
  'product_name_final_phrase',
  'editorial_observation_close',
]);

const EMOTIONAL_REGISTERS = Object.freeze([
  'calm',
  'warm',
  'refined',
  'contemporary',
  'understated',
  'tactile',
  'practical',
  'intimate',
  'architectural',
  'relaxed',
  'elegant',
  'grounded',
]);

const SENTENCE_RHYTHMS = Object.freeze([
  'short_mixed',
  'flowing',
  'mixed',
  'clipped',
]);

// Plain Language Explanations
const EXPLAIN_NARRATIVE_LENS = Object.freeze({
  form: "Anchor the narrative around the product's physical shape, lines, silhouette, and proportions.",
  material: 'Anchor the narrative around the tangible qualities, authenticity, and enduring character of the materials.',
  routine: 'Anchor the narrative around the daily human rituals, morning/evening habits, and living ease this piece facilitates.',
  space: 'Anchor the narrative around how the piece interacts with the surrounding room, spatial flow, and layout balance.',
  mood: 'Anchor the narrative around the emotional ambiance, feeling, and atmosphere the piece imparts to the home.',
  detail: 'Anchor the narrative around distinct craftsmanship touches, joints, accents, hardware, or edge treatments.',
  contrast: 'Anchor the narrative around how the piece resolves dual needs (such as substantial strength with visual lightness).',
  colour: 'Anchor the narrative around palette, undertones, finish depth, and visual warmth in different room light.',
  utility: 'Anchor the narrative around practical function, effortless usability, purposeful design, and daily convenience.',
  editorial: 'Anchor the narrative from a design-appreciative perspective, treating the piece as a curated statement of personal style.',
  minimal: 'Anchor the narrative around uncluttered simplicity, essential geometry, and quiet, unobtrusive utility.',
  scene: 'Anchor the narrative by placing the piece directly inside a lived-in room moment or everyday home setting.',
});

const EXPLAIN_FEATURE_HIERARCHY = Object.freeze({
  form_material_use: "lead with its shape and form, then describe the authentic materials, then explain how it is used in daily life",
  material_form_space: "lead with the tactile material qualities, transition to its form and silhouette, then describe how it sits within the room space",
  routine_design_use: "lead with the everyday routine or ritual it serves, highlight its key design features, then detail practical usage and utility",
  space_form_material: "lead with its spatial presence and room flow, highlight its shape and proportions, then ground with material construction",
  detail_material_room: "lead with a distinctive design detail or accent, describe the primary material feel, then explain how it completes the room",
  colour_form_use: "lead with the color tone and finish depth, follow with the physical silhouette, then explain everyday practical use",
  utility_design_room: "lead with functional utility and problem-solving, connect to thoughtful design touches, then settle into the room context",
  mood_detail_use: "lead with the atmospheric mood it creates, highlight specific craftsmanship details, then show how it supports daily living",
});

const EXPLAIN_OPENING_MECHANISM = Object.freeze({
  room_observation: "Start with an observation of the room layout, spatial balance, or the visual environment where the piece lives.",
  visual_observation: "Start with what immediately catches the eye when looking at the piece (its silhouette, lines, or prominent design hook).",
  material_observation: "Start with an ungeneric, tangible observation about the authentic primary material and its surface behavior.",
  everyday_ritual: "Start with a relatable daily routine, morning ritual, or evening transition that unfolds around this piece.",
  spatial_observation: "Start with how the piece occupies floor clearance, preserves visual airiness, or balances proportions.",
  atmospheric_statement: "Start by setting the ambient feeling, warmth, or quiet mood the piece brings to an interior.",
  direct_product_observation: "Start plainly by observing the product's primary role and single most distinctive physical attribute.",
  design_editorial_statement: "Start with an informed design perspective on how the silhouette or detailing expresses understated taste.",
  tactile_impression: "Start with the physical sensation, touch, texture, or lived physical feel of leaning on or interacting with the piece.",
  functional_observation: "Start with the immediate practical utility, convenience, or functional relief the piece brings to the household.",
});

const EXPLAIN_CLOSING_MECHANISM = Object.freeze({
  return_to_opening_scene: "Conclude by looping back to the opening scene or setting, showing how the product brings that initial perspective to completion.",
  everyday_ritual_close: "Conclude on how effortlessly the piece supports daily transitions and everyday routines over years of use.",
  visual_character_close: "Conclude on the enduring visual character, quiet poise, and aesthetic presence the piece leaves in the space.",
  room_settling: "Conclude with how naturally the piece settles into the bedroom or living area as an organic, purposeful part of the home.",
  practical_role_close: "Conclude on the product's reliable daily functionality, organizational utility, and hardworking purpose.",
  product_name_final_phrase: "Conclude by landing cleanly on the product short name as the definitive final phrase or focal subject of the sentence.",
  editorial_observation_close: "Conclude with a thoughtful editorial observation about how the piece brings enduring balance and understated distinction.",
});

const EXPLAIN_EMOTIONAL_REGISTER = Object.freeze({
  calm: 'calm, tranquil, and peaceful',
  warm: 'warm, welcoming, and hospitable',
  refined: 'refined, polished, and quietly sophisticated',
  contemporary: 'contemporary, fresh, and modern',
  understated: 'understated, subtle, and restrained',
  tactile: 'tactile, sensory, and material-grounded',
  practical: 'practical, dependable, and purposeful',
  intimate: 'intimate, cozy, and personally comforting',
  architectural: 'architectural, structural, and proportion-focused',
  relaxed: 'relaxed, unhurried, and comfortable',
  elegant: 'elegant, poised, and graceful',
  grounded: 'grounded, solid, and enduring',
});

const EXPLAIN_SENTENCE_RHYTHM = Object.freeze({
  short_mixed: 'mix short, punchy statements (5-9 words) with medium explanatory sentences (12-18 words)',
  flowing: 'flowing, balanced compound sentences with natural pauses and cadence',
  mixed: 'a varied cadence alternating between concise observations and descriptive clauses',
  clipped: 'crisp, economical phrasing without unnecessary filler or run-on clauses',
});

let DirectionUsageModel = null;
function getDirectionUsageModel() {
  if (!DirectionUsageModel) {
    try {
      DirectionUsageModel = require('../../models/directionUsage.model');
    } catch (e) {}
  }
  return DirectionUsageModel;
}

let ContentReviewQueueModel = null;
function getContentReviewQueueModel() {
  if (!ContentReviewQueueModel) {
    try {
      ContentReviewQueueModel = require('../../models/contentReviewQueue.model');
    } catch (e) {}
  }
  return ContentReviewQueueModel;
}

// In-memory store for fallback (used when MongoDB is not connected or in tests)
const inMemoryDirectionUsage = new Map();

function hashProfile(profile) {
  if (!profile) return null;
  const sortedKeys = Object.keys(profile).sort();
  const sortedObj = {};
  for (const k of sortedKeys) {
    sortedObj[k] = profile[k];
  }
  return crypto.createHash('sha1').update(JSON.stringify(sortedObj)).digest('hex');
}

function getMemoryKey(companyId, applicationId, category) {
  return `${companyId || 'default'}:${applicationId || 'default'}:${(category || 'default').toLowerCase()}`;
}

/**
 * Generates a new profile selecting values with the lowest individual usage frequencies,
 * while strictly avoiding collisions on opening, hierarchy, and closing mechanisms used recently in this batch.
 */
function generateBiasedProfile(existingProfiles = [], excludedAttrs = {}) {
  const countUsage = (options, fieldName, excludedSet = new Set()) => {
    const counts = {};
    for (const opt of options) counts[opt] = 0;
    for (const record of existingProfiles) {
      const val = record.profile ? record.profile[fieldName] : null;
      if (val && counts[val] !== undefined) {
        counts[val] += record.usage_count || 1;
      }
    }
    // Filter out options in excludedSet if available
    let pool = options.filter((opt) => !excludedSet.has(opt));
    if (pool.length === 0) pool = options;

    // Sort options by usage ascending, breaking ties randomly
    const sorted = [...pool].sort((a, b) => {
      if (counts[a] !== counts[b]) return counts[a] - counts[b];
      return Math.random() - 0.5;
    });
    return sorted[0];
  };

  return {
    narrative_lens: countUsage(NARRATIVE_LENSES, 'narrative_lens'),
    feature_hierarchy: countUsage(FEATURE_HIERARCHIES, 'feature_hierarchy', excludedAttrs.hierarchies || new Set()),
    opening_mechanism: countUsage(OPENING_MECHANISMS, 'opening_mechanism', excludedAttrs.openings || new Set()),
    closing_mechanism: countUsage(CLOSING_MECHANISMS, 'closing_mechanism', excludedAttrs.closings || new Set()),
    emotional_register: countUsage(EMOTIONAL_REGISTERS, 'emotional_register'),
    sentence_rhythm: countUsage(SENTENCE_RHYTHMS, 'sentence_rhythm'),
  };
}

/**
 * Formats assigned profile into clear natural language instructions for the prompt.
 */
function formatDirectionInstruction(profile) {
  if (!profile) return '';

  const lensExp = EXPLAIN_NARRATIVE_LENS[profile.narrative_lens] || profile.narrative_lens;
  const hierarchyExp = EXPLAIN_FEATURE_HIERARCHY[profile.feature_hierarchy] || profile.feature_hierarchy;
  const openingExp = EXPLAIN_OPENING_MECHANISM[profile.opening_mechanism] || profile.opening_mechanism;
  const registerExp = EXPLAIN_EMOTIONAL_REGISTER[profile.emotional_register] || profile.emotional_register;
  const closingExp = EXPLAIN_CLOSING_MECHANISM[profile.closing_mechanism] || profile.closing_mechanism;
  const rhythmExp = EXPLAIN_SENTENCE_RHYTHM[profile.sentence_rhythm] || profile.sentence_rhythm;

  return `ASSIGNED STORY DIRECTION (Mandatory architecture for this product):
- Narrative Lens: ${profile.narrative_lens} (${lensExp})
- Story Order: Present the product's story in this order: ${hierarchyExp}.
- Opening: Open this description using a ${profile.opening_mechanism} approach: ${openingExp}.
- Tone & Voice: Write in a ${profile.emotional_register} tone (${registerExp}).
- Closing: Close using a ${profile.closing_mechanism} approach: ${closingExp}.
- Sentence Rhythm: Vary sentence length — ${rhythmExp} (${profile.sentence_rhythm}).`;
}

/**
 * Decides direction profile based on DB/memory usage counts and short-term batch memory.
 */
function assignDirectionSync({
  companyId = 'default',
  applicationId = 'default',
  category = 'General',
  recentHashesInBatch = [],
  forcedProfile = null,
} = {}) {
  const normCat = (category || 'General').toLowerCase();
  const memKey = getMemoryKey(companyId, applicationId, normCat);
  if (!inMemoryDirectionUsage.has(memKey)) {
    inMemoryDirectionUsage.set(memKey, new Map());
  }
  const store = inMemoryDirectionUsage.get(memKey);

  if (forcedProfile) {
    const hash = hashProfile(forcedProfile);
    if (!store.has(hash)) {
      store.set(hash, { profile: forcedProfile, profile_hash: hash, usage_count: 0, last_used_at: new Date() });
    }
    const rec = store.get(hash);
    rec.usage_count += 1;
    rec.last_used_at = new Date();
    return { profile: forcedProfile, profile_hash: hash, hash };
  }

  // Find candidate from store
  const allRecords = Array.from(store.values());
  const excludedSet = new Set(recentHashesInBatch || []);

  const recentProfiles = (recentHashesInBatch || []).map((h) => store.get(h)?.profile).filter(Boolean);
  const recentOpenings = new Set(recentProfiles.map((p) => p.opening_mechanism).filter(Boolean));
  const recentHierarchies = new Set(recentProfiles.map((p) => p.feature_hierarchy).filter(Boolean));
  const recentClosings = new Set(recentProfiles.map((p) => p.closing_mechanism).filter(Boolean));

  const candidates = allRecords
    .filter((r) => {
      if (excludedSet.has(r.profile_hash)) return false;
      if (
        r.profile &&
        (recentOpenings.has(r.profile.opening_mechanism) ||
          recentHierarchies.has(r.profile.feature_hierarchy) ||
          recentClosings.has(r.profile.closing_mechanism))
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.usage_count - b.usage_count || a.last_used_at - b.last_used_at);

  let winning = candidates[0];

  if (!winning) {
    // Generate new profile biased toward least-used individual attributes avoiding recent batch attributes
    const newProfile = generateBiasedProfile(allRecords, {
      openings: recentOpenings,
      hierarchies: recentHierarchies,
      closings: recentClosings,
    });
    const newHash = hashProfile(newProfile);
    winning = {
      profile: newProfile,
      profile_hash: newHash,
      usage_count: 0,
      last_used_at: new Date(),
    };
    store.set(newHash, winning);
  }

  winning.usage_count += 1;
  winning.last_used_at = new Date();

  return {
    profile: winning.profile,
    profile_hash: winning.profile_hash,
    hash: winning.profile_hash,
  };
}

/**
 * Asynchronous assignDirection that queries and updates MongoDB if available,
 * with seamless fallback to in-memory store.
 */
async function assignDirection({
  companyId = 'default',
  applicationId = 'default',
  category = 'General',
  recentHashesInBatch = [],
  forcedProfile = null,
} = {}) {
  const Model = getDirectionUsageModel();
  const normCat = (category || 'General').toLowerCase();

  // First get synchronous state as baseline
  const syncResult = assignDirectionSync({
    companyId,
    applicationId,
    category: normCat,
    recentHashesInBatch,
    forcedProfile,
  });

  if (!Model || !Model.db || Model.db.readyState !== 1) {
    return syncResult;
  }

  try {
    const query = { company_id: companyId, application_id: applicationId, category: normCat };

    if (forcedProfile) {
      const hash = hashProfile(forcedProfile);
      await Model.findOneAndUpdate(
        { ...query, profile_hash: hash },
        {
          $setOnInsert: { profile: forcedProfile },
          $inc: { usage_count: 1 },
          $set: { last_used_at: new Date() },
        },
        { upsert: true, new: true },
      ).exec();
      return { profile: forcedProfile, profile_hash: hash, hash };
    }

    const docs = await Model.find(query).sort({ usage_count: 1, last_used_at: 1 }).lean().exec();
    const excludedSet = new Set(recentHashesInBatch || []);

    const memKey = getMemoryKey(companyId, applicationId, normCat);
    const store = inMemoryDirectionUsage.get(memKey) || new Map();

    const recentProfiles = [];
    for (const h of recentHashesInBatch || []) {
      const mem = store.get(h);
      if (mem?.profile) {
        recentProfiles.push(mem.profile);
      } else {
        const found = docs.find((d) => d.profile_hash === h);
        if (found?.profile) recentProfiles.push(found.profile);
      }
    }

    const recentOpenings = new Set(recentProfiles.map((p) => p.opening_mechanism).filter(Boolean));
    const recentHierarchies = new Set(recentProfiles.map((p) => p.feature_hierarchy).filter(Boolean));
    const recentClosings = new Set(recentProfiles.map((p) => p.closing_mechanism).filter(Boolean));

    const qualifying = docs.filter((d) => {
      if (excludedSet.has(d.profile_hash)) return false;
      if (
        d.profile &&
        (recentOpenings.has(d.profile.opening_mechanism) ||
          recentHierarchies.has(d.profile.feature_hierarchy) ||
          recentClosings.has(d.profile.closing_mechanism))
      ) {
        return false;
      }
      return true;
    });

    let winning = qualifying[0];

    if (!winning) {
      const newProfile = generateBiasedProfile(docs, {
        openings: recentOpenings,
        hierarchies: recentHierarchies,
        closings: recentClosings,
      });
      const newHash = hashProfile(newProfile);
      winning = await Model.findOneAndUpdate(
        { ...query, profile_hash: newHash },
        {
          $setOnInsert: { profile: newProfile, usage_count: 0 },
          $set: { last_used_at: new Date() },
        },
        { upsert: true, new: true },
      ).lean().exec();
    }

    // Increment winning doc usage
    await Model.updateOne(
      { _id: winning._id },
      { $inc: { usage_count: 1 }, $set: { last_used_at: new Date() } },
    ).exec();

    // Keep in-memory store in sync
    store.set(winning.profile_hash, {
      profile: winning.profile,
      profile_hash: winning.profile_hash,
      usage_count: (winning.usage_count || 0) + 1,
      last_used_at: new Date(),
    });

    return {
      profile: winning.profile,
      profile_hash: winning.profile_hash,
      hash: winning.profile_hash,
    };
  } catch (err) {
    logger.warn(`[aiDirectionDecider] Mongo error in assignDirection, using in-memory result: ${err.message}`);
    return syncResult;
  }
}

/**
 * Records direction hash and generated content for a specific attempt into contentReviewQueue.
 */
async function recordDirectionForAttempt({
  jobId,
  productRef,
  attemptNumber = 1,
  profileHash,
  generatedContent = {},
  companyId,
  applicationId,
}) {
  const Model = getContentReviewQueueModel();
  if (!Model || !jobId) return null;

  try {
    const query = { job_id: jobId };
    if (companyId) query.company_id = companyId;
    if (applicationId) query.application_id = applicationId;
    if (productRef && productRef.uid) {
      query['product_ref.uid'] = productRef.uid;
    } else if (productRef && productRef.id) {
      query['product_ref.id'] = productRef.id;
    }

    const update = {
      $push: {
        generation_attempts: {
          attempt_number: attemptNumber,
          profile_hash: profileHash,
          generated_content: generatedContent,
          timestamp: new Date(),
        },
      },
    };

    return await Model.findOneAndUpdate(query, update, { new: true }).exec();
  } catch (err) {
    logger.warn(`[aiDirectionDecider] Error recording attempt for job ${jobId}: ${err.message}`);
    return null;
  }
}

/**
 * Fetches the exact direction profile by its hash to support replaying past generation attempts.
 */
async function getDirectionByHash({ companyId, applicationId, category, profileHash }) {
  if (!profileHash) return null;

  const Model = getDirectionUsageModel();
  if (Model && Model.db && Model.db.readyState === 1) {
    try {
      const query = { profile_hash: profileHash };
      if (companyId) query.company_id = companyId;
      if (applicationId) query.application_id = applicationId;
      if (category) query.category = category.toLowerCase();
      const doc = await Model.findOne(query).lean().exec();
      if (doc && doc.profile) return doc.profile;
    } catch (err) {
      logger.warn(`[aiDirectionDecider] Error fetching direction by hash: ${err.message}`);
    }
  }

  // Fallback to in-memory lookup
  const normCat = (category || 'General').toLowerCase();
  const memKey = getMemoryKey(companyId, applicationId, normCat);
  const store = inMemoryDirectionUsage.get(memKey);
  if (store && store.has(profileHash)) {
    return store.get(profileHash).profile;
  }

  // Cross-category in-memory search
  for (const subStore of inMemoryDirectionUsage.values()) {
    if (subStore.has(profileHash)) {
      return subStore.get(profileHash).profile;
    }
  }

  return null;
}

module.exports = {
  NARRATIVE_LENSES,
  FEATURE_HIERARCHIES,
  OPENING_MECHANISMS,
  CLOSING_MECHANISMS,
  EMOTIONAL_REGISTERS,
  SENTENCE_RHYTHMS,
  EXPLAIN_NARRATIVE_LENS,
  EXPLAIN_FEATURE_HIERARCHY,
  EXPLAIN_OPENING_MECHANISM,
  EXPLAIN_CLOSING_MECHANISM,
  EXPLAIN_EMOTIONAL_REGISTER,
  EXPLAIN_SENTENCE_RHYTHM,
  hashProfile,
  generateBiasedProfile,
  formatDirectionInstruction,
  assignDirection,
  assignDirectionSync,
  recordDirectionForAttempt,
  getDirectionByHash,
};
