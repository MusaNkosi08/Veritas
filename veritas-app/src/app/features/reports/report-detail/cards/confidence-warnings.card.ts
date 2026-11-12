import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Confidence, ProvenanceReport } from '../../../../models';
import { CONFIDENCE_COPY } from '../../../../shared/signal-copy';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';

const LEVELS: Confidence[] = ['low', 'medium', 'high'];

@Component({
  selector: 'app-confidence-warnings-card',
  imports: [ReportCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="E" title="Authorship confidence" kicker="How much weight this report can bear, whatever it says.">
      <div class="confidence">
        <div class="meter" role="img" [attr.aria-label]="'Confidence: ' + label()">
          @for (l of levels; track l; let i = $index) {
            <span class="meter__seg" [class.is-on]="i <= levelIndex()"></span>
          }
        </div>
        <p class="confidence__value">{{ label() }}</p>
        <p class="confidence__basis">
          Based on text length (<span class="numeric">{{ r().wordCount.toLocaleString('en-US') }}</span> words),
          {{ r().baselineCount ? r().baselineCount + ' baseline ' + (r().baselineCount === 1 ? 'essay' : 'essays') : 'no baseline' }}
          and declared language background.
        </p>
      </div>

      <section class="warnings" aria-labelledby="warnings-head">
        <h3 id="warnings-head">Warnings</h3>
        <ol>
          @for (w of r().warnings; track $index) {
            <li [class.is-lead]="$first && r().confidence === 'low'">{{ w }}</li>
          }
        </ol>
      </section>

      <section class="recommendation" aria-labelledby="rec-head">
        <h3 id="rec-head">Recommendation</h3>
        <p>{{ r().recommendation }}</p>
      </section>
    </app-report-card>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .confidence {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-2) var(--space-4);
      align-items: center;
      padding-bottom: var(--space-5);
      border-bottom: var(--hairline);
    }

    .meter { display: flex; gap: 3px; }
    .meter__seg { width: 1.5rem; height: 0.5rem; background: var(--rule); }
    .meter__seg.is-on { background: var(--ink); }

    .confidence__value { @include m.display(var(--text-xl)); }
    .confidence__basis { grid-column: 1 / -1; font-size: var(--text-sm); color: var(--ink-muted); }

    .warnings { padding-block: var(--space-5); border-bottom: var(--hairline); }
    .warnings h3, .recommendation h3 { margin-bottom: var(--space-3); }

    .warnings ol {
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-2);
      counter-reset: w;

      li {
        counter-increment: w;
        position: relative;
        padding-left: var(--space-6);
        font-size: var(--text-sm);
        color: var(--ink-muted);

        &::before {
          content: counter(w, decimal-leading-zero);
          position: absolute;
          left: 0;
          font-variant-numeric: tabular-nums;
          color: var(--ink-faint);
        }
      }

      .is-lead {
        color: var(--signal-high-ink);
        font-weight: var(--weight-semi);
        &::before { color: var(--signal-high-ink); }
      }
    }

    .recommendation { padding-top: var(--space-5); }
    .recommendation p { @include m.display(var(--text-lg)); line-height: var(--leading-snug); }
  `,
})
export class ConfidenceWarningsCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });
  protected readonly levels = LEVELS;
  protected readonly levelIndex = computed(() => LEVELS.indexOf(this.r().confidence));
  protected readonly label = computed(() => CONFIDENCE_COPY[this.r().confidence]);
}
