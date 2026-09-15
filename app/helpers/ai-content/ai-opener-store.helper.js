'use strict';

/**
 * Single Responsibility: Persists and checks generated opening and closing sentences
 * across runs using n-gram Jaccard similarity, plus structural diversity tracking.
 *
 * Key improvements:
 * - structuralPatternCheck: detects narrative templates like "[Name] brings...feel"
 * - buildDiversityHint: injects recently-used patterns into prompt to avoid repetition
 * - source tagging: mock records are tagged so they don't pollute real diversity checks
 * - checkPhraseFrequency: ignores mock-polluted high-frequency phrases for real content
 */

const fs = require('fs');
const path = require('path');

const OPENERS_PATH = path.join(__dirname, '..', '..', '..', 'data', 'generatedOpeners.jsonl');
const PHRASE_FREQ_PATH = path.join(__dirname, '..', '..', '..', 'data', 'phraseFrequency.json');

const STOPWORDS = new Set([
  'the', 'a', 'an', 'this', 'that', 'with', 'for', 'to', 'of', 'and', 'in', 'on', 'is', 'its',
  'it', 'are', 'be', 'as', 'at', 'by', 'we', 'you', 'your', 'our', 'has', 'have', 'had',
  'was', 'were', 'will', 'would', 'can', 'could',
]);

// Structural patterns — narrative templates that repeat across products even
// when specific words change. Detecting these prevents variable-substitution repetition.
const STRUCTURAL_OPENER_PATTERNS = [
  {
    id: 'name_brings_feel',
    label: '[Name] brings a complete/warm/inviting feel',
    test: (s) => /\b\w+\s+brings\s+\w+.{0,30}feel\b/i.test(s),
  },
  {
    id: 'designed_for_to',
    label: 'Designed for/to/with/around ...',
    test: (s) => /^designed\s+(for|to|with|around)\b/i.test(s.trim()),
  },
  {
    id: 'n_drawers_make',
    label: '[N] drawers make ... easier',
    test: (s) => /\b\d+\s+drawers?\s+make\b/i.test(s),
  },
  {
    id: 'crafted_from_material',
    label: 'Crafted from [material], this ...',
    test: (s) => /^crafted\s+from\b/i.test(s.trim()),
  },
  {
    id: 'wake_up_to',
    label: 'Wake up to [mood].',
    test: (s) => /^wake\s+up\s+to\b/i.test(s.trim()),
  },
  {
    id: 'introducing_product',
    label: 'Introducing [Product], ...',
    test: (s) => /^introducing\b/i.test(s.trim()),
  },
  {
    id: 'mornings_feel',
    label: 'Mornings feel [adj] ...',
    test: (s) => /^mornings\s+feel\b/i.test(s.trim()),
  },
  {
    id: 'settling_in',
    label: 'Settling in after ...',
    test: (s) => /^settling\s+(in|into)\b/i.test(s.trim()),
  },
  {
    id: 'natural_grain_patterns',
    label: 'Natural grain patterns ...',
    test: (s) => /^natural\s+grain\s+patterns?\b/i.test(s.trim()),
  },
];

const STRUCTURAL_CLOSER_PATTERNS = [
  {
    id: 'gives_room_grounded',
    label: 'This [finish] gives the room a grounded character',
    test: (s) => /gives\s+the\s+room\s+\w+\s+grounded/i.test(s),
  },
  {
    id: 'making_purchase_feel',
    label: '... making the purchase feel thoughtful',
    test: (s) => /making\s+the\s+purchase\s+feel\b/i.test(s),
  },
  {
    id: 'making_it_choice',
    label: 'making it a [adj] choice for ...',
    test: (s) => /making\s+it\s+\w+\s+(solid|reliable|practical|good|ideal)\s+choice\b/i.test(s),
  },
  {
    id: 'name_for_bedroom',
    label: '... the [Name] for your bedroom/any bedroom',
    test: (s) => /\b(the\s+\w+\s+for\s+(your|any)\s+bedroom)\b/i.test(s),
  },
];

function loadOpeners(filePath) {
  const fp = filePath || OPENERS_PATH;
  if (!fs.existsSync(fp)) {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, '', 'utf-8');
    return [];
  }

  const content = fs.readFileSync(fp, 'utf-8');
  const lines = content.split('\n');
  const records = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      records.push(JSON.parse(line));
    } catch (err) {
      // skip unparseable lines silently
    }
  }

  return records;
}

/**
 * Returns the N most recent opener records, excluding mock/test records.
 */
function loadRecentOpeners(n, filePath) {
  const nVal = n || 10;
  const all = loadOpeners(filePath);
  return all.filter((r) => r.source !== 'mock').slice(-nVal);
}

/**
 * Returns recently used structural pattern IDs from the last N real openers.
 */
function getRecentlyUsedPatterns(n, filePath) {
  const nVal = n || 10;
  const recent = loadRecentOpeners(nVal, filePath);
  const usedPatterns = new Set();

  for (const record of recent) {
    for (const pat of STRUCTURAL_OPENER_PATTERNS) {
      if (record.opener && pat.test(record.opener)) {
        usedPatterns.add(pat.id);
      }
    }
    for (const pat of STRUCTURAL_CLOSER_PATTERNS) {
      if (record.closer && pat.test(record.closer)) {
        usedPatterns.add(pat.id);
      }
    }
  }

  return Array.from(usedPatterns);
}

/**
 * Builds a diversity hint string to inject into the LLM prompt.
 * Lists recent opener starts and banned structural templates.
 */
function buildDiversityHint(n, filePath) {
  const nVal = n || 8;
  const recent = loadRecentOpeners(nVal, filePath);
  if (recent.length === 0) return '';

  const lines = [];

  const openerStarts = recent
    .map((r) => (r.opener ? r.opener.split(/\s+/).slice(0, 4).join(' ') : ''))
    .filter(Boolean);

  if (openerStarts.length > 0) {
    lines.push('DIVERSITY — RECENT OPENERS (do NOT start your opener with these):');
    openerStarts.forEach((s) => lines.push('  - "' + s + '..."'));
  }

  const usedPatternIds = getRecentlyUsedPatterns(nVal, filePath);
  const usedLabels = STRUCTURAL_OPENER_PATTERNS
    .filter((p) => usedPatternIds.includes(p.id))
    .map((p) => p.label);
  if (usedLabels.length > 0) {
    lines.push('AVOID THESE NARRATIVE TEMPLATES (overused in recent products):');
    usedLabels.forEach((l) => lines.push('  - ' + l));
  }

  if (lines.length === 0) return '';
  return '\n' + lines.join('\n') + '\n';
}

function loadPhraseFrequencies(filePath) {
  const fp = filePath || PHRASE_FREQ_PATH;
  if (!fs.existsSync(fp)) {
    return {};
  }
  try {
    const content = fs.readFileSync(fp, 'utf-8');
    return JSON.parse(content) || {};
  } catch (err) {
    return {};
  }
}

function savePhraseFrequencies(freqMap, filePath) {
  const fp = filePath || PHRASE_FREQ_PATH;
  if (!fs.existsSync(path.dirname(fp))) {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
  }
  fs.writeFileSync(fp, JSON.stringify(freqMap, null, 2), 'utf-8');
}

function extractSignificantWords(sentence) {
  if (!sentence) return [];
  return String(sentence)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOPWORDS.has(word));
}

function extractPhrases(sentence) {
  const words = extractSignificantWords(sentence);
  const phrases = [];
  if (words.length < 2) return phrases;

  for (let i = 0; i <= words.length - 2; i++) {
    phrases.push(words[i] + ' ' + words[i + 1]);
  }
  for (let i = 0; i <= words.length - 3; i++) {
    phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
  }
  return phrases;
}

const DOMAIN_FACTUAL_PHRASES = new Set([
  'sheesham wood', 'mango wood', 'teak wood', 'solid wood', 'engineered wood',
  'rubber wood', 'solid sheesham', 'solid mango', 'solid teak', 'solid rubberwood',
  'dressing table', 'coffee table', 'dining table', 'bed frame', 'chest drawers',
  'bedside table', 'fabric upholstery', 'king size', 'queen size', 'single size',
  'hydraulic storage', 'hydraulic lift', 'lift mechanism', 'hydraulic lift mechanism',
  'box storage', 'storage bed', 'storage drawers', 'storage table', 'gas lift',
]);

/**
 * Checks phrase frequency. Phrases with counts >= 20 are treated as
 * mock-pollution artifacts and skipped for real content (unless the sentence
 * itself looks like a mock sentence). Factual domain nouns are also exempt.
 */
function checkPhraseFrequency(sentence, freqMap, threshold) {
  const thresh = threshold !== undefined ? threshold : 4;
  const phrases = extractPhrases(sentence);
  const repeated = [];
  const seenInSentence = new Set();

  // Heuristic: mock sentences have this distinctive template pattern
  const isMockSentence =
    /brings a complete, inviting feel to any/i.test(sentence) ||
    /selected finish finish gives the room/i.test(sentence) ||
    /brings a complete inviting feel/i.test(sentence);

  for (const phrase of phrases) {
    if (seenInSentence.has(phrase)) continue;
    seenInSentence.add(phrase);
    if (DOMAIN_FACTUAL_PHRASES.has(phrase.toLowerCase())) continue;
    const count = (freqMap && freqMap[phrase]) || 0;
    if (count >= thresh) {
      // Phrases with very high counts (>= 20) that are NOT in a mock sentence
      // are treated as mock-pollution artifacts and skipped
      if (count >= 20 && !isMockSentence) {
        continue;
      }
      repeated.push({ phrase, count });
    }
  }

  return {
    flagged: repeated.length > 0,
    repeatedPhrases: repeated,
  };
}

function updatePhraseFrequencies(sentences, phraseFreqPath, source) {
  const src = source || 'real';
  // Never update from mock sources — prevents test runs from corrupting real tracking
  if (src === 'mock') return {};

  const fp = phraseFreqPath || PHRASE_FREQ_PATH;
  const freqMap = loadPhraseFrequencies(fp);
  for (const sentence of sentences) {
    if (!sentence) continue;
    const phrases = extractPhrases(sentence);
    for (const phrase of phrases) {
      freqMap[phrase] = (freqMap[phrase] || 0) + 1;
    }
  }
  savePhraseFrequencies(freqMap, fp);
  return freqMap;
}

function appendOpener(opts, filePath, phraseFreqPath) {
  const id = opts.id;
  const name = opts.name;
  const opener = opts.opener;
  const closer = opts.closer;
  const sentences = opts.sentences;
  const source = opts.source || 'real';

  const fp = filePath || OPENERS_PATH;
  const pfp = phraseFreqPath || PHRASE_FREQ_PATH;

  const record = {
    id,
    name,
    opener,
    closer,
    source,
    timestamp: new Date().toISOString(),
  };

  if (!fs.existsSync(fp)) {
    fs.mkdirSync(path.dirname(fp), { recursive: true });
  }

  fs.appendFileSync(fp, JSON.stringify(record) + '\n', 'utf-8');

  if (source !== 'mock') {
    const sentencesToUpdate = (Array.isArray(sentences) && sentences.length > 0)
      ? sentences
      : [opener, closer];
    updatePhraseFrequencies(sentencesToUpdate, pfp, source);
  }

  return record;
}

function jaccardSimilarity(wordsA, wordsB) {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  if (setA.size === 0 && setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

function buildNgrams(words, n) {
  const nVal = n !== undefined ? n : 3;
  if (!words || words.length === 0) return [];
  if (words.length < nVal) {
    return [words.join(' ')];
  }
  const ngrams = [];
  for (let i = 0; i <= words.length - nVal; i++) {
    ngrams.push(words.slice(i, i + nVal).join(' '));
  }
  return ngrams;
}

function ngramOverlapCheck(newSentence, existingSentences, options) {
  const opts = options || {};
  const n = opts.n !== undefined ? opts.n : 3;
  const threshold = opts.threshold !== undefined ? opts.threshold : 0.5;

  const newWords = extractSignificantWords(newSentence);
  const newNgrams = buildNgrams(newWords, n);
  if (newNgrams.length === 0) {
    return { tooSimilar: false };
  }

  let bestMatch = null;

  for (const entry of (existingSentences || [])) {
    let existingId = null;
    let existingText = '';

    if (typeof entry === 'string') {
      existingText = entry;
    } else if (entry && typeof entry === 'object') {
      existingId = entry.id || null;
      // Skip mock records
      if (entry.source === 'mock') continue;
      existingText = entry.sentence || entry.opener || entry.closer || entry.text || '';
    }

    if (!existingText) continue;

    const existingWords = extractSignificantWords(existingText);
    const existingNgrams = buildNgrams(existingWords, n);
    if (existingNgrams.length === 0) continue;

    const score = jaccardSimilarity(newNgrams, existingNgrams);
    if (score >= threshold) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          tooSimilar: true,
          matchedAgainst: existingId,
          score,
          matchedSentence: existingText,
        };
      }
    }
  }

  return bestMatch || { tooSimilar: false };
}

/**
 * Checks if a new sentence matches a structural narrative template that
 * has already been used too many times in the last N real records.
 */
function structuralPatternCheck(newSentence, existingRecords, type, options) {
  const t = type || 'opener';
  const opts = options || {};
  const windowSize = opts.windowSize || 15;
  const maxAllowed = opts.maxAllowed || 2;

  const patterns = t === 'opener' ? STRUCTURAL_OPENER_PATTERNS : STRUCTURAL_CLOSER_PATTERNS;

  let matchedPattern = null;
  for (const pat of patterns) {
    if (pat.test(newSentence)) {
      matchedPattern = pat;
      break;
    }
  }

  if (!matchedPattern) return { tooSimilar: false };

  const recent = (existingRecords || [])
    .filter((r) => r.source !== 'mock')
    .slice(-windowSize);

  let count = 0;
  for (const record of recent) {
    const text = t === 'opener' ? (record.opener || '') : (record.closer || '');
    if (matchedPattern.test(text)) {
      count++;
    }
  }

  if (count >= maxAllowed) {
    return {
      tooSimilar: true,
      patternId: matchedPattern.id,
      patternLabel: matchedPattern.label,
      patternCount: count,
    };
  }

  return { tooSimilar: false };
}

module.exports = {
  loadOpeners,
  loadRecentOpeners,
  appendOpener,
  loadPhraseFrequencies,
  savePhraseFrequencies,
  extractPhrases,
  checkPhraseFrequency,
  updatePhraseFrequencies,
  extractSignificantWords,
  jaccardSimilarity,
  buildNgrams,
  ngramOverlapCheck,
  structuralPatternCheck,
  buildDiversityHint,
  getRecentlyUsedPatterns,
  STRUCTURAL_OPENER_PATTERNS,
  STRUCTURAL_CLOSER_PATTERNS,
  OPENERS_PATH,
  PHRASE_FREQ_PATH,
};
