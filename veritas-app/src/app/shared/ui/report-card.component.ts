import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A lettered report section. The letter lets a reviewer cite
 * "Section C" in a meeting and have everyone on the same page, on
 * screen or on paper.
 */
@Component({
  selector: 'app-report-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'report-card' },
  template: `
    <section class="card" [attr.aria-labelledby]="'card-' + letter()">
      <header class="card__head">
        <span class="card__letter" aria-hidden="true">{{ letter() }}</span>
        <div>
          <h2 class="card__title" [id]="'card-' + letter()">
            <span class="sr-only">Section {{ letter() }}: </span>{{ title() }}
          </h2>
          @if (kicker()) {
            <p class="card__kicker">{{ kicker() }}</p>
          }
        </div>
      </header>
      <div class="card__body">
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host { display: block; }

    .card {
      @include m.card;
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--space-5);
    }

    .card__head {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-4);
      align-items: baseline;
      padding-bottom: var(--space-4);
      border-bottom: var(--hairline);
    }

    .card__letter {
      @include m.display(var(--text-xl));
      color: var(--accent);
      line-height: 1;
      min-width: 1.5ch;
    }

    .card__title { font-size: var(--text-lg); }

    .card__kicker {
      margin-top: var(--space-1);
      font-size: var(--text-sm);
      color: var(--ink-faint);
    }
  `,
})
export class ReportCardComponent {
  readonly letter = input.required<string>();
  readonly title = input.required<string>();
  readonly kicker = input<string>();
}
