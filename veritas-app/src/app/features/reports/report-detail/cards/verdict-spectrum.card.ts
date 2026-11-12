import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PercentPipe } from '@angular/common';

import { SIGNAL_BANDS } from '../../../../core/analysis/reference-bands';
import { ProvenanceReport } from '../../../../models';
import { SIGNAL_COPY } from '../../../../shared/signal-copy';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';

@Component({
  selector: 'app-verdict-spectrum-card',
  imports: [ReportCardComponent, PercentPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="A" title="Verdict spectrum" kicker="Where the combined evidence places this text. A position, not a percentage.">
      <div class="verdict">
        <p class="verdict__headline" [class]="'verdict__headline tone-' + copy().tone">{{ copy().headline }}</p>

        <figure
          class="spectrum"
          role="img"
          [attr.aria-label]="'Signal position ' + (r().signalPosition | percent) + ' along the spectrum from verified human process to probable AI generation.'"
        >
          <div class="spectrum__track">
            <span class="spectrum__zone" [style.left.%]="verified * 100"></span>
            <span class="spectrum__zone" [style.left.%]="probable * 100"></span>
            @if (r().forcedReason) {
              <span class="spectrum__ghost" [style.left.%]="r().rawSignalPosition * 100" title="Unadjusted reading"></span>
            }
            <span class="spectrum__marker" [style.left.%]="r().signalPosition * 100">
              <span class="spectrum__value numeric">{{ r().signalPosition.toFixed(2) }}</span>
            </span>
          </div>
          <figcaption class="spectrum__legend">
            <span>Verified process</span>
            <span>Inconclusive</span>
            <span>Probable AI</span>
          </figcaption>
        </figure>

        @if (r().forcedReason; as reason) {
          <p class="forced">
            <strong>Held at Inconclusive.</strong> {{ reason }}
            The unadjusted reading was <span class="numeric">{{ r().rawSignalPosition.toFixed(2) }}</span>, shown as a hollow mark.
          </p>
        }

        <details class="factors">
          <summary>What moved the marker</summary>
          <table class="data-table">
            <thead>
              <tr><th scope="col">Factor</th><th scope="col" class="num">Weight</th><th scope="col" class="num">Lean</th></tr>
            </thead>
            <tbody>
              @for (c of sortedContributions(); track c.label) {
                <tr>
                  <td>{{ c.label }}</td>
                  <td class="num">{{ c.weight | percent }}</td>
                  <td class="num">
                    <span class="lean" [style.--lean]="c.lean"></span>
                    {{ c.lean.toFixed(2) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <p class="factors__note">Lean runs from 0.00 (typical of human drafting) to 1.00 (typical of generated text). Common typographic artifacts carry no weight.</p>
        </details>
      </div>
    </app-report-card>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .verdict { display: grid; gap: var(--space-6); }

    .verdict__headline {
      @include m.display(clamp(var(--text-xl), 3vw, var(--text-2xl)));
      max-width: 30ch;
      &.tone-low  { color: var(--signal-low-ink); }
      &.tone-mid  { color: var(--signal-mid-ink); }
      &.tone-high { color: var(--signal-high-ink); }
    }

    .spectrum { margin: 0; display: grid; gap: var(--space-3); padding-top: var(--space-6); }

    .spectrum__track {
      position: relative;
      height: 0.75rem;
      border-radius: 1px;
      background: var(--signal-gradient);
    }

    .spectrum__zone {
      position: absolute;
      top: -0.25rem;
      bottom: -0.25rem;
      width: 1px;
      background: var(--paper-raised);
    }

    .spectrum__marker,
    .spectrum__ghost {
      position: absolute;
      top: 50%;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    .spectrum__marker {
      background: var(--ink);
      box-shadow: 0 0 0 3px var(--paper-raised);
      transition: left var(--duration-slow) var(--ease);
    }

    .spectrum__ghost { border: 2px solid var(--ink); background: transparent; opacity: 0.55; }

    .spectrum__value {
      position: absolute;
      bottom: calc(100% + var(--space-2));
      left: 50%;
      transform: translateX(-50%);
      font-size: var(--text-sm);
      font-weight: var(--weight-semi);
    }

    .spectrum__legend {
      display: grid;
      grid-template-columns: 38fr 24fr 38fr;
      @include m.eyebrow;
      span:nth-child(2) { text-align: center; }
      span:last-child { text-align: right; }
    }

    .forced {
      padding: var(--space-3) var(--space-4);
      background: var(--signal-mid-wash);
      border-left: 2px solid var(--signal-mid);
      font-size: var(--text-sm);
      max-width: none;
    }

    .factors {
      border-top: var(--hairline);
      padding-top: var(--space-4);

      summary {
        cursor: pointer;
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        color: var(--accent);
        @include m.focus-visible;
      }

      .data-table { margin-top: var(--space-4); }
    }

    .lean {
      display: inline-block;
      width: 3rem;
      height: 4px;
      margin-right: var(--space-2);
      vertical-align: middle;
      background: linear-gradient(90deg, var(--ink) calc(var(--lean) * 100%), var(--rule) 0);
    }

    .factors__note { margin-top: var(--space-3); font-size: var(--text-xs); color: var(--ink-faint); }
  `,
})
export class VerdictSpectrumCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });
  protected readonly copy = computed(() => SIGNAL_COPY[this.r().signalLabel]);
  protected readonly sortedContributions = computed(() =>
    [...this.r().contributions].sort((a, b) => b.weight * b.lean - a.weight * a.lean),
  );
  protected readonly verified = SIGNAL_BANDS.verifiedBelow;
  protected readonly probable = SIGNAL_BANDS.probableAbove;
}
