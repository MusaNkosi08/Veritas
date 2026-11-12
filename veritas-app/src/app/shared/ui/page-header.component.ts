import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The editorial opening of every page: small-caps kicker, serif title,
 * one-paragraph lede. Consistent framing is what makes the suite read
 * as a single publication rather than a set of screens.
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      @if (eyebrow()) {
        <p class="eyebrow">{{ eyebrow() }}</p>
      }
      <h1 class="page-header__title">{{ title() }}</h1>
      @if (lede()) {
        <p class="page-header__lede">{{ lede() }}</p>
      }
      <ng-content />
    </header>
  `,
  styles: `
    .page-header {
      display: grid;
      gap: var(--space-4);
      padding-bottom: var(--space-6);
      margin-bottom: var(--space-7);
      border-bottom: var(--hairline);
    }

    .page-header__title {
      font-size: clamp(var(--text-2xl), 4vw, var(--text-3xl));
    }

    .page-header__lede {
      font-size: var(--text-md);
      color: var(--ink-muted);
      max-width: 60ch;
    }
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly lede = input<string>();
}
