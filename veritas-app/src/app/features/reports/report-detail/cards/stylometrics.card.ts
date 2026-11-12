import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Band, ProvenanceReport, StylometricMetric } from '../../../../models';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';
import { RangeBarComponent } from '../../../../shared/ui/range-bar.component';

@Component({
  selector: 'app-stylometrics-card',
  imports: [ReportCardComponent, RangeBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="B" title="Stylometric diagnostics" kicker="Measured properties of the prose, set against provisional reference ranges.">
      <div class="scroll">
        <table class="data-table">
          <caption class="sr-only">Stylometric metrics with values and typical ranges</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col" class="num">Value</th>
              <th scope="col">Against reference</th>
              <th scope="col">Typical range</th>
            </tr>
          </thead>
          <tbody>
            @for (m of r().stylometrics; track m.key) {
              <tr>
                <th scope="row" class="metric">
                  <span class="metric__label">{{ m.label }}</span>
                  <span class="metric__note">{{ m.note }}</span>
                </th>
                <td class="num value">{{ m.display }}</td>
                <td>
                  @if (m.value !== null) {
                    <app-range-bar [scale]="m.scale" [human]="m.humanBand" [aiBand]="m.aiBand" [value]="m.value" />
                  }
                </td>
                <td class="range">
                  <span class="numeric">{{ band(m, m.humanBand) }}</span>
                  @switch (m.status) {
                    @case ('within') { <span class="tag tag--within">Within typical range</span> }
                    @case ('outside') { <span class="tag tag--outside">Outside typical range</span> }
                    @case ('not-applicable') { <span class="tag">Not measured</span> }
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="legend" aria-hidden="true">
        <span><i class="sw sw--human"></i> Typical of student drafting</span>
        <span><i class="sw sw--ai"></i> Typical of unedited model output</span>
        <span><i class="sw sw--mark"></i> This text</span>
      </div>
      <p class="note">
        "Outside typical range" describes the text, not the student. Many honest writers sit outside
        one range or another; only a pattern across several measures carries weight.
      </p>
    </app-report-card>
  `,
  styles: `
    .scroll { overflow-x: auto; }

    .data-table { min-width: 36rem; }

    .metric { font-weight: normal; text-transform: none; letter-spacing: 0; text-align: left; border-bottom: var(--hairline); padding: var(--space-4) var(--space-4) var(--space-4) 0; }
    .metric__label { display: block; font-weight: var(--weight-medium); color: var(--ink); font-size: var(--text-sm); }
    .metric__note { display: block; margin-top: var(--space-1); font-size: var(--text-xs); color: var(--ink-faint); max-width: 34ch; }

    .value { font-weight: var(--weight-semi); white-space: nowrap; }

    .range { display: grid; gap: var(--space-1); justify-items: start; font-size: var(--text-xs); color: var(--ink-muted); }

    .tag {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      padding: 0.05rem 0.4rem;
      border: var(--hairline);
      border-radius: var(--radius-sm);
      color: var(--ink-muted);
      white-space: nowrap;
    }
    .tag--within { border-color: var(--signal-low); color: var(--signal-low-ink); }
    .tag--outside { border-color: var(--rule-strong); color: var(--ink); }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-5);
      margin-top: var(--space-4);
      font-size: var(--text-xs);
      color: var(--ink-muted);
    }

    .sw { display: inline-block; width: 1rem; height: 0.375rem; margin-right: var(--space-1); vertical-align: middle; }
    .sw--human { background: var(--signal-low); opacity: 0.55; }
    .sw--ai { background: var(--signal-high); opacity: 0.45; }
    .sw--mark { width: 2px; height: 0.875rem; background: var(--ink); }

    .note { margin-top: var(--space-3); font-size: var(--text-xs); color: var(--ink-faint); }
  `,
})
export class StylometricsCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });

  protected band(m: StylometricMetric, b: Band): string {
    const f = (n: number): string => {
      switch (m.key) {
        case 'perplexity-proxy':
        case 'lexical-density':
          return `${Math.round(n * 100)}%`;
        case 'pos-delta':
          return n.toFixed(2);
        case 'burstiness':
          return n.toFixed(2);
        case 'formulaic-phrasing':
          return n.toFixed(0);
      }
    };
    return `${f(b.min)} to ${f(b.max)}`;
  }
}
