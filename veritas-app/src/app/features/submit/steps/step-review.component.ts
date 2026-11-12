import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { maskStudentId } from '../../../core/analysis/analyze';
import { DISCLOSURE_COPY } from '../../../shared/signal-copy';
import { SubmissionDraft } from '../submission-draft';

@Component({
  selector: 'app-step-review',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="summary">
      <dl class="rows">
        <div class="row">
          <dt class="eyebrow">Student</dt>
          <dd class="numeric">{{ masked() }}</dd>
          <dd><button type="button" class="btn btn--quiet" (click)="edit.emit(0)">Edit<span class="sr-only"> student and context</span></button></dd>
        </div>
        <div class="row">
          <dt class="eyebrow">Course</dt>
          <dd>{{ d.course() }} · {{ d.assignmentType() }}</dd>
          <dd></dd>
        </div>
        <div class="row">
          <dt class="eyebrow">Disclosure</dt>
          <dd>{{ disclosure() }}{{ d.isL2() ? ' · Writes in an additional language' : '' }}</dd>
          <dd></dd>
        </div>
        <div class="row">
          <dt class="eyebrow">Text</dt>
          <dd class="numeric">{{ d.wordCount() | number }} words</dd>
          <dd><button type="button" class="btn btn--quiet" (click)="edit.emit(1)">Edit<span class="sr-only"> text</span></button></dd>
        </div>
        <div class="row">
          <dt class="eyebrow">Baseline</dt>
          <dd class="numeric">
            @switch (d.filledBaselines().length) {
              @case (0) { None supplied }
              @case (1) { One earlier essay }
              @default { {{ d.filledBaselines().length }} earlier essays }
            }
          </dd>
          <dd><button type="button" class="btn btn--quiet" (click)="edit.emit(2)">Edit<span class="sr-only"> baseline</span></button></dd>
        </div>
      </dl>

      <blockquote class="excerpt">{{ excerpt() }}</blockquote>
    </article>

    <p class="pledge">
      Submitting creates a permanent report with an audit trail. It describes how the text was
      likely written. It does not decide who wrote it.
    </p>
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host { display: grid; gap: var(--space-5); }

    .summary { @include m.card; display: grid; gap: var(--space-5); }

    .rows { display: grid; }

    .row {
      display: grid;
      grid-template-columns: 8rem 1fr auto;
      gap: var(--space-4);
      align-items: baseline;
      padding-block: var(--space-3);
      border-bottom: var(--hairline);
      &:last-child { border-bottom: 0; }
      dd { margin: 0; }
    }

    .excerpt {
      margin: 0;
      padding-left: var(--space-4);
      border-left: 2px solid var(--rule);
      font-family: var(--font-display);
      font-style: italic;
      color: var(--ink-muted);
    }

    .pledge { font-size: var(--text-sm); color: var(--ink-muted); }
  `,
})
export class StepReviewComponent {
  protected readonly d = inject(SubmissionDraft);
  readonly edit = output<number>();

  protected readonly masked = computed(() => maskStudentId(this.d.studentId()));
  protected readonly disclosure = computed(() => DISCLOSURE_COPY[this.d.aiDisclosure()]);
  protected readonly excerpt = computed(() => {
    const t = this.d.text().trim().replace(/\s+/g, ' ');
    return t.length > 280 ? `${t.slice(0, 280).replace(/\s\S*$/, '')} …` : t;
  });
}
