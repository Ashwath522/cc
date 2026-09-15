'use strict';

/**
 * Repetition & Semantic Auditor Agent
 * Performs multi-level auditing across Exact, Near-Duplicate, Structural, Semantic,
 * and Template-Signature repetition vectors.
 */

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
  'into', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without',
  'before', 'under', 'around', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these', 'those', 'it', 'its',
  'as', 'of', 'from', 'your', 'our', 'their', 'any', 'each', 'while', 'when', 'where',
]);

function normalizeTokens(text, shortName = '') {
  if (!text) return [];
  const lowerShort = (shortName || '').toLowerCase();
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && w !== lowerShort && !/^\d+$/.test(w));
}

function computeJaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (!setA.size && !setB.size) return 1.0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Classifies a sentence into a functional intent category.
 */
function classifySentenceIntent(sentence, position, totalSentences) {
  const s = sentence.toLowerCase();

  if (position === totalSentences - 1) {
    return 'CONCLUSION';
  }
  if (position === 0) {
    if (/\b(morning|evening|routine|daily|preparation|wake|nightly|settle)\b/i.test(s)) return 'USE_CASE';
    if (/\b(grain|wood|timber|sheesham|mango|teak|finish|texture|surface|panel)\b/i.test(s)) return 'MATERIAL_SENSORY';
    if (/\b(room|space|perimeter|layout|circulation|footprint|lightness)\b/i.test(s)) return 'SPATIAL_OBSERVATION';
    if (/\b(not every|some furniture|simplicity|restraint|clarity)\b/i.test(s)) return 'RHETORICAL_CONTRAST';
    return 'OBSERVATION';
  }

  if (/\b(storage|drawer|compartment|hydraulic|lift|box|linen|blanket)\b/i.test(s)) {
    return 'STORAGE_FUNCTION';
  }
  if (/\b(sheesham|mango|teak|rubberwood|particle board|engineered wood|fabric|upholstery|slat|panel)\b/i.test(s)) {
    return 'MATERIAL_DETAIL';
  }
  if (/\b(floor|clearance|legroom|perimeter|circulation|under-bed|seating|room)\b/i.test(s)) {
    return 'SPATIAL_FUNCTION';
  }
  if (/\b(grooming|vanity|stool|mirror|cosmetics|reading|rest|sleep|support)\b/i.test(s)) {
    return 'PRACTICAL_USE';
  }

  return 'FUNCTION';
}

const TEMPLATE_SIGNATURE_PATTERNS = [
  { pattern: /^[A-Z][a-z]+\s+(?:proportions|clarity|simplicity)\s+(?:defines|inspires|shapes|anchors)\b/i, name: 'abstract_noun_defines' },
  { pattern: /^Bring\s+[^.]+\s+to\s+(?:your|any)\s+(?:room|space)\s+with\s+the\b/i, name: 'bring_x_to_your_room' },
  { pattern: /^[A-Z][a-z]+\s+anchors\s+the\s+space\s+with\b/i, name: 'name_anchors_the_space' },
];

/**
 * Audits a generated summary against the accepted memory of previously generated products
 * in the same category.
 */
function auditRepetition(summary, productInput, categoryMemory = []) {
  const shortName = productInput.product_short_name || '';
  const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [summary.trim()];
  const opener = sentences[0] || '';
  const closer = sentences[sentences.length - 1] || '';

  const failureTypes = [];
  let matchedProduct = null;
  let matchedSentence = null;
  let highestSimilarity = 0;
  let reason = '';
  let rootCause = '';
  const recommendedFix = [];

  const openerTokens = normalizeTokens(opener, shortName);
  const closerTokens = normalizeTokens(closer, shortName);

  // Classify current structural intent sequence
  const currentStructure = sentences.map((s, idx) => classifySentenceIntent(s, idx, sentences.length)).join(' -> ');

  // 1. Template Signature Check
  for (const t of TEMPLATE_SIGNATURE_PATTERNS) {
    if (t.pattern.test(opener) || t.pattern.test(closer)) {
      failureTypes.push('TEMPLATE_SIGNATURE');
      reason = `Matches forbidden repetitive template formula "${t.name}".`;
      rootCause = 'Use of formulaic sentence pattern prohibited in training dataset generation.';
      recommendedFix.push('Rewrite opening/closing using direct product attributes or specific functional moment.');
    }
  }

  // 2. Cross-product comparison against category memory
  let structuralMatchCount = 0;

  for (const prev of categoryMemory) {
    if (prev.id === productInput.id) continue;

    const prevSummary = prev.summary || '';
    const prevSentences = prev.summary?.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) || [];
    const prevOpener = prevSentences[0] || '';
    const prevCloser = prevSentences[prevSentences.length - 1] || '';

    // Level 1: Exact Duplicates
    if (summary.trim().toLowerCase() === prevSummary.trim().toLowerCase()) {
      failureTypes.push('EXACT_REPETITION');
      matchedProduct = prev.id;
      matchedSentence = prevSummary;
      highestSimilarity = 1.0;
      reason = `Exact duplicate of full summary from product "${prev.id}".`;
      rootCause = 'Identical summary generated for two different products.';
      recommendedFix.push('Select a completely different narrative angle and structural archetype.');
      break;
    }

    if (opener.trim().toLowerCase() === prevOpener.trim().toLowerCase()) {
      failureTypes.push('EXACT_OPENER_REPETITION');
      matchedProduct = prev.id;
      matchedSentence = prevOpener;
      highestSimilarity = 1.0;
      reason = `Exact duplicate of opening sentence from product "${prev.id}".`;
      rootCause = 'Reusing identical opening sentence across products.';
      recommendedFix.push('Select an unused opening angle (e.g. spatial, use-case, material-first, or finish-led).');
    }

    // Level 2 & 4: Near Duplicate / Semantic Similarity
    const prevOpenerTokens = normalizeTokens(prevOpener, prev.shortName || '');
    const prevCloserTokens = normalizeTokens(prevCloser, prev.shortName || '');

    const openerJaccard = computeJaccard(openerTokens, prevOpenerTokens);
    const closerJaccard = computeJaccard(closerTokens, prevCloserTokens);

    if (openerJaccard >= 0.70 && openerJaccard > highestSimilarity) {
      highestSimilarity = openerJaccard;
      matchedProduct = prev.id;
      matchedSentence = prevOpener;
      if (!failureTypes.includes('SEMANTIC_REPETITION')) {
        failureTypes.push('SEMANTIC_REPETITION');
        reason = `Opening sentence is too similar to product "${prev.id}" (Jaccard: ${(openerJaccard * 100).toFixed(1)}%).`;
        rootCause = 'Opening expresses similar rhetorical concept and shares high token overlap.';
        recommendedFix.push('Change narrative angle from ' + (prev.angle || 'prior angle') + ' to an unused attribute angle.');
      }
    }

    if (closerJaccard >= 0.70 && closerJaccard > highestSimilarity) {
      highestSimilarity = closerJaccard;
      matchedProduct = prev.id;
      matchedSentence = prevCloser;
      if (!failureTypes.includes('NEAR_DUPLICATE_CLOSER')) {
        failureTypes.push('NEAR_DUPLICATE_CLOSER');
        reason = `Closing sentence is too similar to product "${prev.id}" (Jaccard: ${(closerJaccard * 100).toFixed(1)}%).`;
        recommendedFix.push('Vary closing payoff (practical utility vs room placement vs material permanence).');
      }
    }

    // Level 3: Structural Duplicate Tracking
    if (prev.structure && prev.structure === currentStructure) {
      structuralMatchCount++;
    }
  }

  // If more than 40% of category items use this exact structure, flag structural repetition
  if (categoryMemory.length >= 8 && structuralMatchCount / categoryMemory.length > 0.40) {
    if (!failureTypes.includes('STRUCTURAL_REPETITION')) {
      failureTypes.push('STRUCTURAL_REPETITION');
      reason = `Structure "${currentStructure}" is overused in this category (${structuralMatchCount}/${categoryMemory.length} items).`;
      rootCause = 'Generator repeatedly selecting identical sentence intent sequence.';
      recommendedFix.push('Switch to a different structural archetype (e.g. Problem-Solution, Finish-led, or Direct-fact).');
    }
  }

  const passed = failureTypes.length === 0;

  if (passed) {
    return {
      status: 'PASS',
      product_id: productInput.id,
      category: productInput.category || 'Bedroom',
      structure: currentStructure,
      highest_similarity_score: parseFloat(highestSimilarity.toFixed(2)),
    };
  }

  return {
    status: 'FAIL',
    product_id: productInput.id,
    category: productInput.category || 'Bedroom',
    failure_types: failureTypes,
    matched_product: matchedProduct,
    matched_sentence: matchedSentence,
    similarity_score: parseFloat(highestSimilarity.toFixed(2)),
    current_structure: currentStructure,
    reason: reason || 'Repetition detected across category corpus.',
    root_cause: rootCause || 'Insufficient structural or narrative angle differentiation.',
    recommended_fix: recommendedFix.length ? recommendedFix : ['Select a different supported narrative angle and structure.'],
  };
}

module.exports = {
  auditRepetition,
  classifySentenceIntent,
  normalizeTokens,
  computeJaccard,
};
