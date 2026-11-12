import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Band } from '../../models';

/**
 * Inline reference bar: where a value sits against the typical human
 * and model ranges. Purely visual; the table row beside it carries the
 * same information in text for screen readers and print.
 */
@Component({
  selector: 'app-range-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" aria-hidden="true">
      <span class="band band--human" [style.left.%]="humanSpan().left" [style.width.%]="humanSpan().width"></span>
      @if (ai(); as a) {
        <span class="band band--ai" [style.left.%]="a.left" [style.width.%]="a.width"></span>
      }
      @if (marker() !== null) {
        <span class="marker" [style.left.%]="marker()"></span>
      }
    </div>
  `,
  styles: `
    .bar {
      position: relative;
      height: 0.875rem;
      min-width: 7rem;
      border-bottom: var(--hairline);
    }

    .band {
      position: absolute;
      height: 0.375rem;
      border-radius: 1px;
    }

    .band--human { top: 0.125rem; background: var(--signal-low); opacity: 0.55; }
    .band--ai    { top: 0.5rem;   background: var(--signal-high); opacity: 0.45; }

    .marker {
      position: absolute;
      top: -0.125rem;
      bottom: -0.125rem;
      width: 2px;
      margin-left: -1px;
      background: var(--ink);
    }
  `,
})
export class RangeBarComponent {
  readonly scale = input.required<Band>();
  readonly human = input.required<Band>();
  readonly aiBand = input<Band | null>(null);
  readonly value = input<number | null>(null);

  private readonly toPct = (n: number): number => {
    const { min, max } = this.scale();
    return Math.min(100, Math.max(0, ((n - min) / (max - min)) * 100));
  };

  private readonly span = (b: Band) => {
    const left = this.toPct(b.min);
    return { left, width: this.toPct(b.max) - left };
  };

  protected readonly humanSpan = computed(() => this.span(this.human()));
  protected readonly ai = computed(() => {
    const b = this.aiBand();
    return b ? this.span(b) : null;
  });
  protected readonly marker = computed(() => {
    const v = this.value();
    return v === null ? null : this.toPct(v);
  });
}
