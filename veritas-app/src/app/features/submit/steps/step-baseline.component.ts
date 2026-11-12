import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { SubmissionDraft } from '../submission-draft';

@Component({
  selector: 'app-step-baseline',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="intro">
      <p>
        Paste one to three pieces the same student wrote earlier, ideally under supervision or
        before generative tools were in reach. Veritas builds a profile of their habits, such as
        how they use small words like <em>the</em>, <em>of</em> and <em>but</em>, and compares the
        new text against it. This is the strongest evidence the report can offer, in either direction.
      </p>
      <p class="field__hint">Optional. Around 200 words or more per piece gives a usable profile.</p>
    </div>

    @for (b of d.baselines(); track $index; let i = $index) {
      <div class="field baseline">
        <div class="label-row">
          <label class="field__label" [for]="'baseline-' + i">Earlier essay {{ i + 1 }}</label>
          <span class="count numeric">{{ d.baselineCounts()[i] ?? 0 | number }} words</span>
        </div>
        <textarea
          class="textarea textarea--short"
          [id]="'baseline-' + i"
          spellcheck="false"
          [value]="b"
          (input)="d.setBaseline(i, val($event))"
        ></textarea>
        @if (d.baselines().length > 1 || b) {
          <button type="button" class="btn btn--quiet remove" (click)="d.removeBaseline(i)">
            Remove essay {{ i + 1 }}
          </button>
        }
      </div>
    }

    @if (d.canAddBaseline()) {
      <button type="button" class="btn btn--secondary add" (click)="d.addBaseline()">
        Add another earlier essay
      </button>
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-6); }

    .intro { display: grid; gap: var(--space-2); color: var(--ink-muted); }

    .label-row { display: flex; justify-content: space-between; align-items: baseline; }
    .count { font-size: var(--text-sm); color: var(--ink-muted); }

    .textarea--short { min-height: 10rem; font-size: var(--text-base); }

    .remove { justify-self: start; }
    .add { justify-self: start; }
  `,
})
export class StepBaselineComponent {
  protected readonly d = inject(SubmissionDraft);
  protected val(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }
}
