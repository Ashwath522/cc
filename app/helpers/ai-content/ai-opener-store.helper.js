'use strict';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'this', 'that', 'with', 'for', 'to', 'of', 'and', 'in', 'on', 'is', 'its',
]);

// In-memory runtime cache for dedup across jobs / runs, with fallback
let inMemoryOpeners = [];
let inMemoryPhraseFreq = {};

function loadOpeners() {
  return inMemoryOpeners;
}

function loadPhraseFrequencies() {
  return inMemoryPhraseFreq;
}

function savePhraseFrequencies(freqMap) {
  inMemoryPhraseFreq = freqMap || {};
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
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i <= words.length - 3; i++) {
    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return phrases;
}

function checkPhraseFrequency(sentence, freqMap, threshold = 3) {
  const phrases = extractPhrases(sentence);
  const repeated = [];
  const seenInSentence = new Set();
  const map = freqMap || inMemoryPhraseFreq;

  for (const phrase of phrases) {
    if (seenInSentence.has(phrase)) continue;
    seenInSentence.add(phrase);
    const count = map[phrase] || 0;
    if (count >= threshold) {
      repeated.push({ phrase, count });
    }
  }

  return {
    flagged: repeated.length > 0,
    repeatedPhrases: repeated,
  };
}

function updatePhraseFrequencies(sentences) {
  const freqMap = { ...inMemoryPhraseFreq };
  for (const sentence of sentences) {
    if (!sentence) continue;
    const phrases = extractPhrases(sentence);
    for (const phrase of phrases) {
      freqMap[phrase] = (freqMap[phrase] || 0) + 1;
    }
  }
  inMemoryPhraseFreq = freqMap;
  return freqMap;
}

function appendOpener({ id, name, opener, closer, sentences }) {
  const record = {
    id,
    name,
    opener,
    closer,
    timestamp: new Date().toISOString(),
  };

  inMemoryOpeners.push(record);

  const sentencesToUpdate = Array.isArray(sentences) && sentences.length > 0 ? sentences : [opener, closer];
  updatePhraseFrequencies(sentencesToUpdate);

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

function buildNgrams(words, n = 3) {
  if (!words || words.length === 0) return [];
  if (words.length < n) {
    return [words.join(' ')];
  }
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function ngramOverlapCheck(newSentence, existingSentences, options = {}) {
  const n = options.n !== undefined ? options.n : 3;
  const threshold = options.threshold !== undefined ? options.threshold : 0.5;

  const newWords = extractSignificantWords(newSentence);
  const newNgrams = buildNgrams(newWords, n);
  if (newNgrams.length === 0) {
    return { tooSimilar: false };
  }

  let bestMatch = null;

  for (const entry of existingSentences || inMemoryOpeners) {
    let existingId = null;
    let existingText = '';

    if (typeof entry === 'string') {
      existingText = entry;
    } else if (entry && typeof entry === 'object') {
      existingId = entry.id || null;
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

  if (bestMatch) {
    return bestMatch;
  }

  return { tooSimilar: false };
}

function resetOpenerStore() {
  inMemoryOpeners = [];
  inMemoryPhraseFreq = {};
}

module.exports = {
  loadOpeners,
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
  resetOpenerStore,
};
