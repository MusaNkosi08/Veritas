import { AiDisclosure } from './provenance-report.model';

/** What the wizard collects. The raw student ID never leaves this object. */
export interface Submission {
  studentId: string;
  course: string;
  assignmentType: string;
  aiDisclosure: AiDisclosure;
  isL2: boolean;
  text: string;
  baselines: string[];
  submittedBy: string;
}

export const ASSIGNMENT_TYPES = [
  'Argumentative essay',
  'Research paper',
  'Reflective writing',
  'Literature review',
  'Lab report',
  'Take-home examination',
] as const;

export const DISCLOSURE_OPTIONS: ReadonlyArray<{
  value: AiDisclosure;
  label: string;
  hint: string;
}> = [
  { value: 'none', label: 'None', hint: 'The student declares no AI assistance.' },
  {
    value: 'brainstorming',
    label: 'Brainstorming',
    hint: 'Used for ideas or outlines; the prose is their own.',
  },
  {
    value: 'editing',
    label: 'Editing',
    hint: 'Used to correct grammar or tighten sentences they wrote.',
  },
  {
    value: 'substantial',
    label: 'Substantial',
    hint: 'Parts of the submitted prose were generated.',
  },
];

export const MIN_WORDS = 300;
export const MAX_BASELINES = 3;
