import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ProvenanceReport } from '../../../../models';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';

const W = 560;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 28, left: 44 };

@Component({
  selector: 'app-draft-velocity-card',
  imports: [ReportCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="D" title="Draft velocity" kicker="How the word count grew over the writing session.">
      @if (r().draftVelocity.simulated) {
        <p class="simulated">
          <span class="eyebrow">Demonstration data</span>
          Draft history is not captured in this release. The timeline below is simulated to show the
          shape of this evidence and is not used in the verdict.
        </p>
      }

      <figure class="chart">
        <svg
          [attr.viewBox]="'0 0 ' + w + ' ' + h"
          role="img"
          [attr.aria-label]="'Word count over ' + chart().maxMinute + ' minutes, reaching ' + r().wordCount + ' words. ' + r().draftVelocity.interpretation"
        >
          @for (t of chart().yTicks; track t.value) {
            <line class="grid" [attr.x1]="pad.left" [attr.x2]="w - pad.right" [attr.y1]="t.y" [attr.y2]="t.y" />
            <text class="tick" [attr.x]="pad.left - 8" [attr.y]="t.y + 4" text-anchor="end">{{ t.value }}</text>
          }
          @for (t of chart().xTicks; track t.value) {
            <text class="tick" [attr.x]="t.x" [attr.y]="h - 8" text-anchor="middle">{{ t.value }}m</text>
          }
          <path class="area" [attr.d]="chart().area" />
          <path class="line" [attr.d]="chart().line" />
        </svg>
        <figcaption class="interpretation">{{ r().draftVelocity.interpretation }}</figcaption>
      </figure>
    </app-report-card>
  `,
  styles: `
    .simulated {
      display: grid;
      gap: var(--space-1);
      margin-bottom: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border: 1px dashed var(--rule-strong);
      font-size: var(--text-xs);
      color: var(--ink-muted);
      max-width: none;
    }

    .chart { margin: 0; display: grid; gap: var(--space-3); }

    svg { width: 100%; height: auto; aspect-ratio: 560 / 200; overflow: visible; }

    .grid { stroke: var(--rule); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .tick { font-family: var(--font-sans); font-size: 10px; fill: var(--ink-faint); font-variant-numeric: tabular-nums; }
    .area { fill: var(--accent-wash); }
    .line { fill: none; stroke: var(--accent); stroke-width: 1.5; vector-effect: non-scaling-stroke; stroke-linejoin: round; }

    .interpretation { font-size: var(--text-sm); color: var(--ink); font-style: italic; font-family: var(--font-display); }
  `,
})
export class DraftVelocityCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });

  protected readonly w = W;
  protected readonly h = H;
  protected readonly pad = PAD;

  protected readonly chart = computed(() => {
    const pts = this.r().draftVelocity.points;
    const maxMinute = Math.max(1, ...pts.map((p) => p.minute));
    const maxWords = niceCeil(Math.max(1, ...pts.map((p) => p.words)));
    const x = (m: number) => PAD.left + (m / maxMinute) * (W - PAD.left - PAD.right);
    const y = (n: number) => H - PAD.bottom - (n / maxWords) * (H - PAD.top - PAD.bottom);

    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.minute).toFixed(1)},${y(p.words).toFixed(1)}`).join(' ');
    const area = `${line} L${x(maxMinute).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`;

    const yTicks = [0, 0.5, 1].map((f) => ({ value: Math.round(maxWords * f), y: y(maxWords * f) }));
    const xStep = niceStep(maxMinute / 4);
    const xTicks = [];
    for (let m = 0; m <= maxMinute; m += xStep) xTicks.push({ value: m, x: x(m) });

    return { line, area, yTicks, xTicks, maxMinute };
  });
}

function niceCeil(n: number): number {
  const mag = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / mag) * mag;
}

function niceStep(n: number): number {
  const steps = [1, 2, 5, 10, 15, 20, 30, 60];
  return steps.find((s) => s >= n) ?? 60;
}
