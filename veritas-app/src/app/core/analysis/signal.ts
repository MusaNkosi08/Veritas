import { Band, SignalContribution, SignalLabel } from '../../models';
import { SIGNAL_BANDS } from './reference-bands';
import { clamp } from './tokenize';

export interface SignalInput {
  rareShare: number;
  burstinessCv: number;
  lexicalDensity: number;
  formulaicPer1000: number;
  notableArtifactKinds: number;
  notableArtifactTotal: number;
  /** null when no baseline was supplied. */
  posDelta: number | null;
  /** |cv - baseline cv|, null without a baseline. */
  burstinessShift: number | null;
  wordCount: number;
  isL2: boolean;
  hasBaseline: boolean;
}

export interface SignalResult {
  raw: number;
  position: number;
  label: SignalLabel;
  forcedReason: string | null;
  contributions: SignalContribution[];
}

/**
 * Each factor maps to a "lean" between 0 (human process) and 1
 * (generation) by linear interpolation between two anchor values,
 * then contributes in proportion to its weight.
 *
 * Weights reflect how much each measure can be trusted on its own:
 *  - Sentence rhythm and the baseline comparison are the strongest
 *    signals available without a language model.
 *  - Notable artifacts are concrete, but one stray asterisk should
 *    not move the needle far, so the lean saturates slowly.
 *  - The vocabulary proxy is the weakest stand-in here and is held low.
 *  - Lexical density overlaps heavily between groups and is nearly
 *    decorative at 5%.
 *  - Common artifacts (curly quotes, dashes) carry zero weight.
 * Baseline factors drop out entirely when no baseline exists, and the
 * remaining weights are renormalised.
 */
export function computeSignal(input: SignalInput): SignalResult {
  const factors: SignalContribution[] = [
    { label: 'Sentence rhythm (burstiness)', weight: 0.25, lean: lerp(input.burstinessCv, { min: 0.55, max: 0.2 }) },
    // Weak: formal generated prose is full of academic vocabulary that a
    // short common-word list counts as "rare". Kept for transparency, held at 10%.
    { label: 'Vocabulary predictability (proxy)', weight: 0.1, lean: lerp(input.rareShare, { min: 0.36, max: 0.2 }) },
    { label: 'Formulaic phrasing', weight: 0.17, lean: lerp(input.formulaicPer1000, { min: 2, max: 10 }) },
    {
      label: 'Notable typographic artifacts',
      weight: 0.2,
      // Variety matters more than volume: one tool leaves one kind of mark.
      lean: clamp(input.notableArtifactKinds * 0.3 + Math.min(input.notableArtifactTotal, 10) * 0.04),
    },
    { label: 'Lexical density', weight: 0.05, lean: lerp(input.lexicalDensity, { min: 0.5, max: 0.62 }) },
  ];

  if (input.posDelta !== null) {
    factors.push({ label: 'Departure from baseline function words', weight: 0.15, lean: lerp(input.posDelta, { min: 0.06, max: 0.18 }) });
  }
  if (input.burstinessShift !== null) {
    factors.push({ label: 'Departure from baseline rhythm', weight: 0.08, lean: lerp(input.burstinessShift, { min: 0.08, max: 0.3 }) });
  }

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const contributions = factors.map((f) => ({ ...f, weight: f.weight / totalWeight }));
  const raw = round(contributions.reduce((s, f) => s + f.lean * f.weight, 0));

  // Forcing rules. These encode the known failure modes of every
  // statistical detector: short texts are noisy, and writers working in
  // an additional language produce the steady rhythm and common
  // vocabulary the measures read as "generated". Without a baseline to
  // compare against, the honest answer for those students is "unknown".
  let forcedReason: string | null = null;
  if (input.wordCount < 300) {
    forcedReason = `The text is ${input.wordCount} words, below the 300-word minimum for a reliable reading.`;
  } else if (input.isL2 && !input.hasBaseline) {
    forcedReason = 'The student writes in an additional language and no baseline was supplied.';
  }

  const position = forcedReason
    ? round(clamp(raw, SIGNAL_BANDS.verifiedBelow + 0.02, SIGNAL_BANDS.probableAbove - 0.02))
    : raw;

  return { raw, position, label: labelFor(position), forcedReason, contributions };
}

export function labelFor(position: number): SignalLabel {
  if (position < SIGNAL_BANDS.verifiedBelow) return 'verified-process';
  if (position > SIGNAL_BANDS.probableAbove) return 'probable-ai';
  return 'inconclusive';
}

/** Map value onto 0..1 between two anchors. Anchors may be reversed. */
function lerp(value: number, anchors: Band): number {
  return clamp((value - anchors.min) / (anchors.max - anchors.min));
}

const round = (n: number): number => Math.round(n * 1000) / 1000;
