import {
  AuditEntry,
  Confidence,
  ProvenanceReport,
  RangeStatus,
  SignalLabel,
  StylometricMetric,
  Submission,
  TypographicArtifact,
  Band,
} from '../../models';
import { APP_VERSION } from '../version';
import { notableSummary, scanArtifacts } from './artifact-scan';
import { simulateDraftVelocity } from './draft-velocity';
import { REFERENCE } from './reference-bands';
import { computeSignal } from './signal';
import {
  burstiness,
  formulaicRate,
  lexicalDensity,
  posProfile,
  profileDistance,
  rareTokenShare,
} from './stylometrics';
import { countWords, hash, sentences, words } from './tokenize';

/**
 * The whole pipeline as one pure function. No Angular, no I/O, no
 * clock or randomness except what is passed in. Same input, same
 * report: a property any finding that might reach a hearing must have.
 */
export function analyzeSubmission(sub: Submission, id: string, now: Date): ProvenanceReport {
  const text = sub.text.trim();
  const tokens = words(text);
  const wordCount = tokens.length;
  const sentenceList = sentences(text);
  const rhythm = burstiness(sentenceList.map(countWords));
  const density = lexicalDensity(tokens);
  const rare = rareTokenShare(tokens);
  const formulaic = formulaicRate(text, wordCount);
  const artifacts = scanArtifacts(text);
  const notable = notableSummary(artifacts);

  // Baselines are pooled: three short essays are a better portrait of a
  // writer than any single one of them.
  const baselines = sub.baselines.map((b) => b.trim()).filter((b) => countWords(b) > 0);
  const hasBaseline = baselines.length > 0;
  const baselineText = baselines.join('\n\n');
  const baselineTokens = words(baselineText);
  const posDelta = hasBaseline ? profileDistance(posProfile(tokens), posProfile(baselineTokens)) : null;
  const baselineRhythm = hasBaseline ? burstiness(sentences(baselineText).map(countWords)) : null;
  const burstinessShift = baselineRhythm ? Math.abs(rhythm.cv - baselineRhythm.cv) : null;

  const signal = computeSignal({
    rareShare: rare,
    burstinessCv: rhythm.cv,
    lexicalDensity: density,
    formulaicPer1000: formulaic.per1000,
    notableArtifactKinds: notable.kinds,
    notableArtifactTotal: notable.total,
    posDelta,
    burstinessShift,
    wordCount,
    isL2: sub.isL2,
    hasBaseline,
  });

  const confidence = rateConfidence(wordCount, sub.isL2, baselines.length, signal.forcedReason !== null);

  const stylometrics: StylometricMetric[] = [
    metric('perplexity-proxy', 'Perplexity (proxy: rare-token share)', rare, pct(rare), REFERENCE.perplexityProxy,
      rare < REFERENCE.perplexityProxy.human.min
        ? 'Vocabulary stays close to the most common English words.'
        : 'Vocabulary ranges as widely as typical student prose.'),
    metric('burstiness', 'Burstiness (sentence-length variation)', rhythm.cv,
      `${rhythm.cv.toFixed(2)} cv`, REFERENCE.burstiness,
      `Sentences average ${rhythm.mean.toFixed(1)} words, give or take ${rhythm.sd.toFixed(1)}.`),
    metric('lexical-density', 'Lexical density', density, pct(density), REFERENCE.lexicalDensity,
      'Share of words that carry content rather than grammar. Weak evidence on its own.'),
    metric('formulaic-phrasing', 'Formulaic phrasing', formulaic.per1000,
      `${formulaic.per1000.toFixed(1)} per 1,000`, REFERENCE.formulaic,
      formulaic.hits.length
        ? `Found: ${formulaic.hits.slice(0, 4).map((h) => `“${h}”`).join(', ')}${formulaic.hits.length > 4 ? ', and others' : ''}.`
        : 'No stock phrases from the published list.'),
    posDelta === null
      ? {
          key: 'pos-delta',
          label: 'Function-word profile vs baseline',
          value: null,
          display: 'No baseline',
          scale: REFERENCE.posDelta.scale,
          humanBand: REFERENCE.posDelta.human,
          aiBand: null,
          status: 'not-applicable',
          note: 'Supply one to three earlier essays to compare this text with how the student usually writes.',
        }
      : metric('pos-delta', 'Function-word profile vs baseline', posDelta, posDelta.toFixed(3), REFERENCE.posDelta,
          posDelta <= REFERENCE.posDelta.human.max
            ? `Close to the student's own habits across ${baselines.length} earlier ${baselines.length === 1 ? 'essay' : 'essays'}.`
            : `Departs from the student's habits across ${baselines.length} earlier ${baselines.length === 1 ? 'essay' : 'essays'}.`),
  ];

  const warnings = buildWarnings(sub, wordCount, baselines.length, confidence, signal.forcedReason, artifacts);
  const draftVelocity = simulateDraftVelocity(wordCount, signal.label, hash(text));

  const auditTrail: AuditEntry[] = [
    { id: `${id}-a1`, at: now, actor: sub.submittedBy, action: 'submitted', detail: `Text of ${wordCount.toLocaleString('en-US')} words, ${baselines.length ? `with ${baselines.length} baseline ${baselines.length === 1 ? 'essay' : 'essays'}` : 'without a baseline'}.` },
    { id: `${id}-a2`, at: new Date(now.getTime() + 1400), actor: `Veritas engine v${APP_VERSION}`, action: 'analysed', detail: `Report version 1 issued. Signal ${signal.position.toFixed(2)}, confidence ${confidence}.` },
  ];

  return {
    id,
    submittedAt: now,
    studentMaskedId: maskStudentId(sub.studentId),
    course: sub.course.trim(),
    assignmentType: sub.assignmentType,
    aiDisclosure: sub.aiDisclosure,
    isL2: sub.isL2,
    text,
    wordCount,
    signalPosition: signal.position,
    signalLabel: signal.label,
    confidence,
    stylometrics,
    artifacts,
    draftVelocity,
    warnings,
    recommendation: recommend(signal.label, confidence, sub.aiDisclosure),
    auditTrail,
    rawSignalPosition: signal.raw,
    forcedReason: signal.forcedReason,
    contributions: signal.contributions,
    baselineCount: baselines.length,
    baselineWordCount: baselineTokens.length,
    sentenceCount: sentenceList.length,
    engineVersion: APP_VERSION,
    reportVersion: 1,
  };
}

function metric(
  key: StylometricMetric['key'],
  label: string,
  value: number,
  display: string,
  ref: { scale: Band; human: Band; ai: Band | null },
  note: string,
): StylometricMetric {
  const status: RangeStatus = value >= ref.human.min && value <= ref.human.max ? 'within' : 'outside';
  return { key, label, value, display, scale: ref.scale, humanBand: ref.human, aiBand: ref.ai, status, note };
}

/**
 * Confidence is about the evidence, not the verdict. A long text with a
 * baseline supports a confident reading in either direction; a short
 * text supports none.
 */
function rateConfidence(wordCount: number, isL2: boolean, baselineCount: number, forced: boolean): Confidence {
  if (forced || wordCount < 500) return 'low';
  let points = 0;
  if (wordCount >= 500) points += 1;
  if (wordCount >= 900) points += 1;
  if (baselineCount >= 1) points += 2;
  if (baselineCount >= 2) points += 1;
  if (isL2) points -= 1;
  return points >= 4 ? 'high' : points >= 2 ? 'medium' : 'low';
}

function buildWarnings(
  sub: Submission,
  wordCount: number,
  baselineCount: number,
  confidence: Confidence,
  forcedReason: string | null,
  artifacts: readonly TypographicArtifact[],
): string[] {
  const w: string[] = [];
  if (confidence === 'low') {
    w.push(`This text is ${wordCount.toLocaleString('en-US')} words. Confidence is LOW. Do not use for disciplinary action.`);
  }
  if (forcedReason) {
    w.push(`The reading has been held at Inconclusive. ${forcedReason}`);
  }
  if (sub.isL2) {
    w.push('The student has declared an additional language. Steady sentence rhythm and common vocabulary are typical of L2 writing and are weighted with caution.');
  }
  if (baselineCount === 0) {
    w.push('No baseline was supplied. The text is compared with general student prose rather than with this student.');
  }
  if (sub.aiDisclosure === 'editing' && artifacts.length) {
    w.push('The student disclosed AI-assisted editing. Editing tools can introduce the typographic artifacts listed in this report.');
  }
  if (sub.aiDisclosure === 'substantial') {
    w.push('The student disclosed substantial AI use. Read this report against your course policy, not as a question of concealment.');
  }
  w.push('Reference bands are provisional in this release and have not yet been calibrated against a labelled corpus.');
  return w;
}

function recommend(label: SignalLabel, confidence: Confidence, disclosure: Submission['aiDisclosure']): string {
  if (disclosure === 'substantial' && label !== 'verified-process') {
    return 'The reading is consistent with the student’s own disclosure. Assess the work against your course’s AI-use policy.';
  }
  switch (label) {
    case 'verified-process':
      return 'No follow-up is indicated by this reading. File the report with the submission.';
    case 'inconclusive':
      return 'Schedule a 10-minute writing conference to discuss the drafting process.';
    case 'probable-ai':
      return confidence === 'high'
        ? 'Hold a writing conference before drawing any conclusion. Ask the student to walk through their notes, drafts and sources.'
        : 'Hold a writing conference to discuss the drafting process. This report alone does not support escalation.';
  }
}

/**
 * Masked at the point of analysis, so the raw identifier is never
 * stored. Keeps the first two and last two characters: enough for a
 * reviewer to match a report to their own records, not enough to
 * identify a student from a leaked export.
 */
export function maskStudentId(raw: string): string {
  const id = raw.trim();
  if (id.length <= 4) return '●'.repeat(id.length);
  return `${id.slice(0, 2)}${'●'.repeat(Math.max(3, id.length - 4))}${id.slice(-2)}`;
}

const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
