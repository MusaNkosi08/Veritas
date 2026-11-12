import { DraftVelocity, DraftVelocityPoint, SignalLabel } from '../../models';
import { seededRandom } from './tokenize';

// Draft history needs an editor integration that records keystrokes
// over time. Until that exists, this card shows a simulated timeline
// so reviewers can see what the evidence will look like.
//
// Two safeguards keep the simulation honest:
//  1. It is generated AFTER the verdict and never feeds back into it.
//  2. Every report marks it as simulated, in the card and in print.

export function simulateDraftVelocity(
  wordCount: number,
  label: SignalLabel,
  seed: number,
): DraftVelocity {
  const rand = seededRandom(seed);
  const points = label === 'probable-ai' ? pasteProfile(wordCount, rand) : burstProfile(wordCount, rand);
  const interpretation =
    label === 'probable-ai'
      ? 'Most of the text arrives within a single minute, the shape a paste leaves behind. Real history would confirm or rule this out.'
      : 'Words arrive in uneven bursts separated by pauses, the shape of drafting and revising over several sittings.';
  return { simulated: true, points, interpretation };
}

/** Human drafting: sessions of steady typing, flat pauses, occasional deletions. */
function burstProfile(target: number, rand: () => number): DraftVelocityPoint[] {
  const points: DraftVelocityPoint[] = [{ minute: 0, words: 0 }];
  let minute = 0;
  let words = 0;
  while (words < target) {
    const burstLength = 4 + Math.floor(rand() * 8);
    for (let i = 0; i < burstLength && words < target; i++) {
      minute += 1;
      words = Math.min(target, words + Math.round(8 + rand() * 22));
      // Revision: sometimes a writer deletes a sentence.
      if (rand() < 0.08) words = Math.max(0, words - Math.round(10 + rand() * 25));
      points.push({ minute, words });
    }
    minute += 3 + Math.floor(rand() * 14);
    points.push({ minute, words });
  }
  return points;
}

/** Paste: a short typed opening, then most of the text at once, then light edits. */
function pasteProfile(target: number, rand: () => number): DraftVelocityPoint[] {
  const points: DraftVelocityPoint[] = [{ minute: 0, words: 0 }];
  let words = 0;
  let minute = 0;
  for (let i = 0; i < 3; i++) {
    minute += 1;
    words += Math.round(5 + rand() * 10);
    points.push({ minute, words });
  }
  minute += 2;
  points.push({ minute, words });
  minute += 1;
  words = Math.round(target * (0.94 + rand() * 0.03));
  points.push({ minute, words });
  for (let i = 0; i < 6; i++) {
    minute += 1 + Math.floor(rand() * 2);
    words = Math.min(target, words + Math.round(rand() * 8));
    points.push({ minute, words });
  }
  points.push({ minute: minute + 1, words: target });
  return points;
}
