import { ArtifactKind, ArtifactWeight, TypographicArtifact } from '../../models';

interface ArtifactRule {
  kind: ArtifactKind;
  label: string;
  glyph: string;
  pattern: RegExp;
  weight: ArtifactWeight;
  explanation: string;
}

// Two tiers, and the distinction matters more than any single count.
//
// "notable" artifacts are rarely typed by hand and are not inserted by
// word-processor autocorrect: hidden characters and leftover Markdown
// are what text looks like when it has been copied out of a chat
// interface. They are still not proof (a student may have drafted in
// a Markdown editor), but they are a fair question to ask.
//
// "common" artifacts are produced by Word, Google Docs and macOS by
// default. Treating curly quotes as evidence would flag every student
// who writes in Word, so they are listed for completeness and given
// no weight in the verdict.
const RULES: readonly ArtifactRule[] = [
  {
    kind: 'zero-width',
    label: 'Zero-width characters',
    glyph: '⟨U+200B⟩',
    pattern: /[​-‍⁠﻿]/g,
    weight: 'notable',
    explanation: 'Invisible characters that keyboards do not produce. Usually carried over by copying from a web interface.',
  },
  {
    kind: 'markdown-bold',
    label: 'Markdown bold markers',
    glyph: '**text**',
    pattern: /\*\*[^*\n]{1,80}\*\*/g,
    weight: 'notable',
    explanation: 'Double asterisks around a phrase are formatting syntax from chat tools and Markdown editors, not from word processors.',
  },
  {
    kind: 'markdown-header',
    label: 'Markdown headers',
    glyph: '## Heading',
    pattern: /^[ \t]*#{1,6}[ \t]+\S.*$/gm,
    weight: 'notable',
    explanation: 'Lines opening with # are Markdown headings. Rare in essays typed in a word processor.',
  },
  {
    kind: 'bullet-glyph',
    label: 'Bullet glyphs in prose',
    glyph: '•',
    pattern: /[•▪◦‣]/g,
    weight: 'notable',
    explanation: 'Literal bullet characters, as opposed to list formatting. They usually arrive with pasted text.',
  },
  {
    kind: 'em-dash',
    label: 'Em dashes',
    glyph: '—',
    pattern: /—/g,
    weight: 'common',
    explanation: 'Word and Google Docs convert two hyphens into an em dash automatically. Not evidence by itself.',
  },
  {
    kind: 'en-dash',
    label: 'En dashes',
    glyph: '–',
    pattern: /–/g,
    weight: 'common',
    explanation: 'Common in typeset ranges and inserted by autocorrect. Not evidence by itself.',
  },
  {
    kind: 'curly-double',
    label: 'Curly double quotes',
    glyph: '“ ”',
    pattern: /[“”]/g,
    weight: 'common',
    explanation: 'Smart quotes are the default in Word, Google Docs and macOS. Not evidence by itself.',
  },
  {
    kind: 'curly-single',
    label: 'Curly apostrophes and single quotes',
    glyph: '‘ ’',
    pattern: /[‘’]/g,
    weight: 'common',
    explanation: 'Produced by autocorrect in most writing software. Not evidence by itself.',
  },
  {
    kind: 'ellipsis-glyph',
    label: 'Ellipsis character',
    glyph: '…',
    pattern: /…/g,
    weight: 'common',
    explanation: 'A single-character ellipsis. Inserted by autocorrect on many devices.',
  },
];

const SAMPLE_RADIUS = 28;
const MAX_SAMPLES = 3;

export function scanArtifacts(text: string): TypographicArtifact[] {
  const found: TypographicArtifact[] = [];
  for (const rule of RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    if (!matches.length) continue;
    found.push({
      kind: rule.kind,
      label: rule.label,
      glyph: rule.glyph,
      count: matches.length,
      weight: rule.weight,
      explanation: rule.explanation,
      samples: matches.slice(0, MAX_SAMPLES).map((m) => excerpt(text, m.index ?? 0, m[0].length)),
    });
  }
  // Notable first, then by frequency.
  return found.sort((a, b) =>
    a.weight === b.weight ? b.count - a.count : a.weight === 'notable' ? -1 : 1,
  );
}

function excerpt(text: string, index: number, length: number): string {
  const start = Math.max(0, index - SAMPLE_RADIUS);
  const end = Math.min(text.length, index + length + SAMPLE_RADIUS);
  const body = text
    .slice(start, end)
    .replace(/\s+/g, ' ')
    // Invisible characters must be made visible or the excerpt proves nothing.
    .replace(/​/g, '⟨ZWSP⟩')
    .replace(/‌/g, '⟨ZWNJ⟩')
    .replace(/‍/g, '⟨ZWJ⟩')
    .replace(/⁠/g, '⟨WJ⟩')
    .replace(/﻿/g, '⟨BOM⟩');
  return `${start > 0 ? '…' : ''}${body}${end < text.length ? '…' : ''}`;
}

/** Number of distinct notable artifact kinds, and their total occurrences. */
export function notableSummary(artifacts: readonly TypographicArtifact[]): { kinds: number; total: number } {
  const notable = artifacts.filter((a) => a.weight === 'notable');
  return { kinds: notable.length, total: notable.reduce((s, a) => s + a.count, 0) };
}
