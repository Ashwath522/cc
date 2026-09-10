/**
 * Single Responsibility: Persists and checks generated opening and closing sentences
 * across runs using n-gram Jaccard similarity.
 */
const fs = require('fs');
const path = require('path');

const OPENERS_PATH = path.join(__dirname, '..', 'data', 'generatedOpeners.jsonl');
const PHRASE_FREQ_PATH = path.join(__dirname, '..', 'data', 'phraseFrequency.json');

const STOPWORDS = new Set([
  'the', 'a', 'an', 'this', 'that', 'with', 'for', 'to', 'of', 'and', 'in', 'on', 'is', 'its'
]);

function loadOpeners(filePath = OPENERS_PATH) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf-8');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const records = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      records.push(JSON.parse(line));
    } catch (err) {
      console.warn(`[openerStore] Skipping unparseable line ${i + 1}: ${err.message}`);
    }
  }

  return records;
}

function loadPhraseFrequencies(filePath = PHRASE_FREQ_PATH) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) || {};
  } catch (err) {
    return {};
  }
}

function savePhraseFrequencies(freqMap, filePath = PHRASE_FREQ_PATH) {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(freqMap, null, 2), 'utf-8');
}

function extractPhrases(sentence) {
  const words = extractSignificantWords(sentence);
  const phrases = [];
  if (words.length < 2) return phrases;

  // 2-word phrases
  for (let i = 0; i <= words.length - 2; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  // 3-word phrases
  for (let i = 0; i <= words.length - 3; i++) {
    phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return phrases;
}

function checkPhraseFrequency(sentence, freqMap, threshold = 3) {
  const phrases = extractPhrases(sentence);
  const repeated = [];
  const seenInSentence = new Set();

  for (const phrase of phrases) {
    if (seenInSentence.has(phrase)) continue;
    seenInSentence.add(phrase);
    const count = freqMap[phrase] || 0;
    if (count >= threshold) {
      repeated.push({ phrase, count });
    }
  }

  return {
    flagged: repeated.length > 0,
    repeatedPhrases: repeated
  };
}

function updatePhraseFrequencies(sentences, phraseFreqPath = PHRASE_FREQ_PATH) {
  const freqMap = loadPhraseFrequencies(phraseFreqPath);
  for (const sentence of sentences) {
    if (!sentence) continue;
    const phrases = extractPhrases(sentence);
    for (const phrase of phrases) {
      freqMap[phrase] = (freqMap[phrase] || 0) + 1;
    }
  }
  savePhraseFrequencies(freqMap, phraseFreqPath);
  return freqMap;
}

function appendOpener({ id, name, opener, closer, sentences }, filePath = OPENERS_PATH, phraseFreqPath = PHRASE_FREQ_PATH) {
  const record = {
    id,
    name,
    opener,
    closer,
    timestamp: new Date().toISOString()
  };

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf-8');

  // Update exact phrase frequencies for all sentences in summary (or [opener, closer] fallback)
  const sentencesToUpdate = (Array.isArray(sentences) && sentences.length > 0) ? sentences : [opener, closer];
  updatePhraseFrequencies(sentencesToUpdate, phraseFreqPath);

  return record;
}

function extractSignificantWords(sentence) {
  if (!sentence) return [];
  return String(sentence)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOPWORDS.has(word));
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

  for (const entry of (existingSentences || [])) {
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
          matchedSentence: existingText
        };
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  return { tooSimilar: false };
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
  OPENERS_PATH,
  PHRASE_FREQ_PATH
};
