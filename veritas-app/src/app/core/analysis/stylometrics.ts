import { COMMON_WORDS, FORMULAIC_PHRASES, FUNCTION_WORDS, FunctionClass, POS_CLASSES } from './lexicon';

export interface Burstiness {
  mean: number;
  sd: number;
  /** Coefficient of variation: sd / mean. Length-independent, so short and long texts compare. */
  cv: number;
}

export function burstiness(sentenceLengths: readonly number[]): Burstiness {
  const n = sentenceLengths.length;
  if (n < 2) return { mean: sentenceLengths[0] ?? 0, sd: 0, cv: 0 };
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / n;
  const variance = sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance);
  return { mean, sd, cv: mean > 0 ? sd / mean : 0 };
}

/** Content words / all words. Anything not in a closed function class is content. */
export function lexicalDensity(tokens: readonly string[]): number {
  if (!tokens.length) return 0;
  const content = tokens.filter((t) => !FUNCTION_WORDS.has(t)).length;
  return content / tokens.length;
}

/**
 * Perplexity proxy. True perplexity needs a language model; this
 * stand-in measures how often the writer leaves the common core of
 * English. Lower share = more predictable text. Labelled as a proxy
 * everywhere it appears, and weighted accordingly.
 *
 * Short tokens are excluded because they are almost all common anyway
 * and only dilute the measure.
 */
export function rareTokenShare(tokens: readonly string[]): number {
  const eligible = tokens.filter((t) => t.length > 2);
  if (!eligible.length) return 0;
  const rare = eligible.filter((t) => !COMMON_WORDS.has(t) && !COMMON_WORDS.has(stem(t))).length;
  return rare / eligible.length;
}

// Crude suffix stripping so "students" and "studying" are not counted as rare
// merely for being inflected. Precision does not matter here; consistency does.
function stem(t: string): string {
  return t.replace(/(ies|ing|ed|es|s|ly)$/, '');
}

export type PosProfile = Record<FunctionClass | 'content', number>;

export function posProfile(tokens: readonly string[]): PosProfile {
  const counts = Object.fromEntries(POS_CLASSES.map((c) => [c, 0])) as PosProfile;
  for (const t of tokens) counts[FUNCTION_WORDS.get(t) ?? 'content']++;
  const total = tokens.length || 1;
  for (const c of POS_CLASSES) counts[c] /= total;
  return counts;
}

/** Total variation distance: half the sum of absolute differences. 0 = identical, 1 = disjoint. */
export function profileDistance(a: PosProfile, b: PosProfile): number {
  return POS_CLASSES.reduce((sum, c) => sum + Math.abs(a[c] - b[c]), 0) / 2;
}

export interface FormulaicResult {
  per1000: number;
  hits: string[];
}

export function formulaicRate(text: string, wordCount: number): FormulaicResult {
  const lower = text.toLowerCase().replace(/’/g, "'");
  const hits: string[] = [];
  let total = 0;
  for (const phrase of FORMULAIC_PHRASES) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    const n = (lower.match(re) ?? []).length;
    if (n) {
      total += n;
      hits.push(phrase.replace(/,$/, ''));
    }
  }
  return { per1000: wordCount ? (total / wordCount) * 1000 : 0, hits };
}
