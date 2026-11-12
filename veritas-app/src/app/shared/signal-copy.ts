import { AiDisclosure, Confidence, SignalLabel } from '../models';

// All verdict wording in one place. These strings appear on screen, in
// print and potentially in a disciplinary file, so they are reviewed
// together and never improvised inside a template.

export type SignalTone = 'low' | 'mid' | 'high';

export const SIGNAL_COPY: Record<SignalLabel, { chip: string; headline: string; tone: SignalTone }> = {
  'verified-process': {
    chip: 'Human process',
    headline: 'Consistent with verified human drafting process',
    tone: 'low',
  },
  inconclusive: {
    chip: 'Inconclusive',
    headline: 'Inconclusive — recommend a writing conference',
    tone: 'mid',
  },
  'probable-ai': {
    chip: 'AI patterns',
    headline: 'Patterns consistent with AI generation — requires human review',
    tone: 'high',
  },
};

export const CONFIDENCE_COPY: Record<Confidence, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const DISCLOSURE_COPY: Record<AiDisclosure, string> = {
  none: 'None declared',
  brainstorming: 'Brainstorming',
  editing: 'Editing',
  substantial: 'Substantial',
};
