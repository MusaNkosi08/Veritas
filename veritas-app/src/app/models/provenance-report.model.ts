// The report is the product. Every field here is something a
// reviewer may be asked to justify, so each carries enough context
// to be read on its own, months later, in print.

export type AiDisclosure = 'none' | 'brainstorming' | 'editing' | 'substantial';
export type SignalLabel = 'verified-process' | 'inconclusive' | 'probable-ai';
export type Confidence = 'low' | 'medium' | 'high';

export type MetricKey =
  | 'perplexity-proxy'
  | 'burstiness'
  | 'lexical-density'
  | 'formulaic-phrasing'
  | 'pos-delta';

export type RangeStatus = 'within' | 'outside' | 'not-applicable';

export interface Band {
  readonly min: number;
  readonly max: number;
}

export interface StylometricMetric {
  key: MetricKey;
  label: string;
  /** null when the metric needs a baseline that was not supplied. */
  value: number | null;
  /** Human-readable value, already formatted with units. */
  display: string;
  /** Axis bounds for the inline range bar. */
  scale: Band;
  /** Range typical of drafted student prose. "Within" is judged against this. */
  humanBand: Band;
  /** Range typical of unedited model output. Shown for context only. */
  aiBand: Band | null;
  status: RangeStatus;
  /** One-line plain-English reading of this metric. */
  note: string;
}

export type ArtifactKind =
  | 'zero-width'
  | 'markdown-bold'
  | 'markdown-header'
  | 'bullet-glyph'
  | 'em-dash'
  | 'en-dash'
  | 'curly-double'
  | 'curly-single'
  | 'ellipsis-glyph';

/**
 * notable: rarely produced by typing or word-processor autocorrect.
 * common:  routinely inserted by Word, Google Docs and macOS. Context only.
 */
export type ArtifactWeight = 'notable' | 'common';

export interface TypographicArtifact {
  kind: ArtifactKind;
  label: string;
  /** What to print in the code preview. Invisible characters get a visible stand-in. */
  glyph: string;
  count: number;
  weight: ArtifactWeight;
  explanation: string;
  /** Up to three short excerpts showing the artifact in place. */
  samples: string[];
}

export interface DraftVelocityPoint {
  /** Minutes since the first recorded keystroke. */
  minute: number;
  /** Cumulative words in the document at that minute. */
  words: number;
}

export interface DraftVelocity {
  /** True while draft history is simulated rather than captured. */
  simulated: boolean;
  points: DraftVelocityPoint[];
  interpretation: string;
}

export interface SignalContribution {
  label: string;
  /** 0 = leans towards human process, 1 = leans towards generation. */
  lean: number;
  weight: number;
}

export type AuditAction = 'submitted' | 'analysed' | 'note-added' | 'exported';

export interface AuditEntry {
  id: string;
  at: Date;
  actor: string;
  action: AuditAction;
  detail: string;
}

export interface ProvenanceReport {
  id: string;
  submittedAt: Date;
  studentMaskedId: string;
  course: string;
  assignmentType: string;
  aiDisclosure: AiDisclosure;
  isL2: boolean;
  text: string;
  wordCount: number;
  signalPosition: number; // 0.0 to 1.0
  signalLabel: SignalLabel;
  confidence: Confidence;
  stylometrics: StylometricMetric[];
  artifacts: TypographicArtifact[];
  draftVelocity: DraftVelocity;
  warnings: string[];
  recommendation: string;
  auditTrail: AuditEntry[];

  // ── Beyond the core brief: needed to make the report defensible ──
  /** Position before any forcing rule was applied. Disclosed, never hidden. */
  rawSignalPosition: number;
  /** Why the position was held at Inconclusive, if it was. */
  forcedReason: string | null;
  contributions: SignalContribution[];
  baselineCount: number;
  baselineWordCount: number;
  sentenceCount: number;
  engineVersion: string;
  reportVersion: number;
}
