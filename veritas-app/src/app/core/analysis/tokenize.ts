// Tokenisation is deliberately plain. A cleverer tokenizer would
// shift every metric by a few points and make the reference bands
// meaningless; a plain one is easy to reproduce by hand when a
// student or panel asks how a number was reached.

const WORD_RE = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;

export function words(text: string): string[] {
  return (text.match(WORD_RE) ?? []).map((w) => w.toLowerCase().replace(/’/g, "'"));
}

export function countWords(text: string): number {
  return (text.match(WORD_RE) ?? []).length;
}

/**
 * Sentences are split on terminal punctuation followed by a capital or
 * opening quote, and on line breaks. Line breaks count because headings
 * and list items are structurally separate units, even without a full stop.
 */
export function sentences(text: string): string[] {
  return text
    .split(/\n+/)
    // Headings and titles are not sentences. Counting them as very short
    // sentences would inflate rhythm variation and flatter the text.
    .filter((line) => !isHeading(line))
    .flatMap((line) => line.trim().split(/(?<=[.!?…])["”’)]*\s+(?=["“‘(]?[A-Z0-9])/))
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 0);
}

function isHeading(line: string): boolean {
  const t = line.trim();
  if (/^#{1,6}\s/.test(t)) return true;
  // Short line with no terminal punctuation: a title, not a sentence.
  return countWords(t) > 0 && countWords(t) < 9 && !/[.!?…:;"”)]$/.test(t);
}

/** Deterministic 32-bit hash. Used to seed simulations so a report never changes on reload. */
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (n: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, n));
