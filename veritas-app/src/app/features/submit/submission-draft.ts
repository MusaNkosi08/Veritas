import { Injectable, computed, signal } from '@angular/core';

import { countWords } from '../../core/analysis/tokenize';
import { ASSIGNMENT_TYPES, AiDisclosure, MAX_BASELINES, MIN_WORDS } from '../../models';

/**
 * Wizard state, provided by the wizard component so it lives and dies
 * with the page. Each step reads and writes these signals directly;
 * validity is derived, never stored, so it cannot fall out of step.
 */
@Injectable()
export class SubmissionDraft {
  readonly studentId = signal('');
  readonly course = signal('');
  readonly assignmentType = signal<string>(ASSIGNMENT_TYPES[0]);
  readonly aiDisclosure = signal<AiDisclosure>('none');
  readonly isL2 = signal(false);
  readonly text = signal('');
  readonly baselines = signal<string[]>(['']);

  /** Errors stay hidden until the reviewer first tries to move on. */
  readonly showErrors = signal(false);

  readonly wordCount = computed(() => countWords(this.text()));
  readonly meetsMinimum = computed(() => this.wordCount() >= MIN_WORDS);
  readonly wordsShort = computed(() => Math.max(0, MIN_WORDS - this.wordCount()));

  readonly baselineCounts = computed(() => this.baselines().map(countWords));
  readonly filledBaselines = computed(() => this.baselines().filter((b) => countWords(b) > 0));
  readonly canAddBaseline = computed(() => this.baselines().length < MAX_BASELINES);

  readonly studentIdError = computed(() => {
    const v = this.studentId().trim();
    if (!v) return 'Enter the student number.';
    if (!/^[A-Za-z0-9-]{4,20}$/.test(v)) return 'Use 4 to 20 letters, digits or hyphens.';
    return null;
  });
  readonly courseError = computed(() => (this.course().trim() ? null : 'Enter the course code or name.'));
  readonly contextValid = computed(() => !this.studentIdError() && !this.courseError());

  setBaseline(index: number, value: string): void {
    this.baselines.update((list) => list.map((b, i) => (i === index ? value : b)));
  }

  addBaseline(): void {
    if (this.canAddBaseline()) this.baselines.update((list) => [...list, '']);
  }

  removeBaseline(index: number): void {
    this.baselines.update((list) => (list.length === 1 ? [''] : list.filter((_, i) => i !== index)));
  }
}
