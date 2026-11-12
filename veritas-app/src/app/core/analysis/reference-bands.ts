import { Band } from '../../models';

// Provisional reference bands for v0.1.0.
//
// These are working ranges for undergraduate prose of 300 to 3,000
// words, set by hand from typical behaviour of the measures below.
// They are NOT calibrated against a labelled corpus yet. That is
// stated on the Methodology page and in every report, and it is the
// first thing to replace when the real backend arrives.

export interface MetricReference {
  scale: Band;
  human: Band;
  ai: Band | null;
}

export const REFERENCE: Record<
  'perplexityProxy' | 'burstiness' | 'lexicalDensity' | 'formulaic' | 'posDelta',
  MetricReference
> = {
  // Share of tokens outside the common-word list. Model text favours
  // safe, high-frequency vocabulary, so it tends to sit lower.
  perplexityProxy: { scale: { min: 0.1, max: 0.5 }, human: { min: 0.27, max: 0.42 }, ai: { min: 0.16, max: 0.28 } },

  // Coefficient of variation of sentence length. People write a long
  // sentence, then a short one. Models hold a steadier rhythm.
  burstiness: { scale: { min: 0, max: 1 }, human: { min: 0.42, max: 0.9 }, ai: { min: 0.15, max: 0.38 } },

  // Content words as a share of all words. Weak on its own: dense
  // academic prose and model prose overlap heavily. Low weight.
  lexicalDensity: { scale: { min: 0.35, max: 0.7 }, human: { min: 0.44, max: 0.56 }, ai: { min: 0.52, max: 0.63 } },

  // Formulaic phrases per 1,000 words.
  formulaic: { scale: { min: 0, max: 20 }, human: { min: 0, max: 4 }, ai: { min: 5, max: 20 } },

  // Total variation distance between this text's function-word profile
  // and the student's baseline. A person's function-word habits are
  // among the most stable stylistic fingerprints they have.
  posDelta: { scale: { min: 0, max: 0.3 }, human: { min: 0, max: 0.1 }, ai: null },
};

/** Signal thresholds. The middle third is wide on purpose: doubt is the default. */
export const SIGNAL_BANDS = {
  verifiedBelow: 0.38,
  probableAbove: 0.62,
} as const;
