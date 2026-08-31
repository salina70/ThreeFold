/**
 * Feedback Nepal - AI Customer Analyzer core engine
 * A lightweight, dependency-free lexicon-based sentiment + keyword extractor.
 * Runs fully offline so the hackathon demo never depends on an external API key.
 *
 * How it works:
 * 1. Tokenize + normalize review text.
 * 2. Score each token against a weighted lexicon (-5..+5).
 * 3. Handle simple negation ("not good" flips polarity of the next word).
 * 4. Compute an overall score + comparative score (score / word count).
 * 5. Classify into positive / neutral / negative using thresholds.
 * 6. Extract keywords by removing stopwords and ranking by frequency,
 *    boosting words that also appear in the sentiment lexicon.
 */

const LEXICON = {
  good: 3, great: 4, excellent: 5, amazing: 5, awesome: 5, fantastic: 5,
  wonderful: 4, best: 5, love: 4, loved: 4, nice: 2, friendly: 3, helpful: 3,
  clean: 2, fast: 2, quick: 2, fresh: 2, delicious: 4, tasty: 3, affordable: 2,
  reasonable: 2, professional: 3, polite: 3, comfortable: 2, recommend: 3,
  recommended: 3, satisfied: 3, happy: 3, pleasant: 2, smooth: 2, efficient: 3,
  cozy: 2, beautiful: 3, perfect: 5, worth: 2, impressed: 4, impressive: 4,
  outstanding: 5, superb: 5, brilliant: 4, quality: 2, welcoming: 3,
  bad: -3, worst: -5, terrible: -5, horrible: -5, awful: -5, poor: -3,
  rude: -4, slow: -2, dirty: -3, expensive: -2, overpriced: -3, disappointing: -4,
  disappointed: -4, unprofessional: -4, cold: -1, stale: -3, late: -2,
  waste: -4, worse: -3, broken: -3, disgusting: -5, unfriendly: -3,
  uncomfortable: -2, noisy: -2, careless: -3, ignored: -3, overcooked: -2,
  undercooked: -3, mediocre: -2, unacceptable: -4, scam: -5, fraud: -5,
  never: -1, avoid: -3, refund: -2, complaint: -2, complain: -2, delay: -2,
  delayed: -2, cancel: -2, cancelled: -2, hate: -4, hated: -4, annoying: -3,
  problem: -2, issue: -2, issues: -2, misleading: -3, lied: -4, damaged: -3,
  okay: 1, ok: 1, fine: 1, average: 0, decent: 1,
};

const NEGATORS = new Set(["not", "no", "never", "n't", "cannot", "cant", "isnt", "wasnt", "dont", "didnt"]);

const STOPWORDS = new Set([
  "the","a","an","is","was","were","are","am","be","been","being","to","of","in","on",
  "for","and","or","but","with","at","by","from","up","about","into","over","after",
  "this","that","these","those","it","its","i","we","you","he","she","they","them",
  "my","our","your","their","his","her","as","if","so","just","very","really","also",
  "had","has","have","did","do","does","will","would","could","should","can","than",
  "there","here","when","where","which","who","what","how","all","some","such","only",
  "then","too","because","out","not","no","been","having","went","go","going","one",
  "us","me","him","them","was","were"
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function analyzeSentiment(text) {
  const tokens = tokenize(text);
  let score = 0;
  let negateNext = false;

  tokens.forEach((word) => {
    if (NEGATORS.has(word)) {
      negateNext = true;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(LEXICON, word)) {
      let weight = LEXICON[word];
      if (negateNext) {
        weight = -weight;
        negateNext = false;
      }
      score += weight;
    } else {
      negateNext = false;
    }
  });

  const comparative = tokens.length ? score / tokens.length : 0;

  let label = "neutral";
  if (score > 1) label = "positive";
  else if (score < -1) label = "negative";

  return { score, comparative: Number(comparative.toFixed(3)), label };
}

function extractKeywords(text, limit = 6) {
  const tokens = tokenize(text).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const freq = {};

  tokens.forEach((word) => {
    const boost = Object.prototype.hasOwnProperty.call(LEXICON, word) ? 2 : 1;
    freq[word] = (freq[word] || 0) + boost;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function analyzeReview(text) {
  const sentiment = analyzeSentiment(text);
  const keywords = extractKeywords(text);
  return { sentiment, keywords };
}

module.exports = { analyzeSentiment, extractKeywords, analyzeReview };
