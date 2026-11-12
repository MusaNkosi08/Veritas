import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_VERSION } from '../version';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <p class="footer__notice">
          Veritas is a diagnostic aid. No single score may be used for disciplinary action
          without human review. — v{{ version }}
        </p>
        <a routerLink="/methodology" class="footer__link no-print">How Veritas reads a text</a>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      border-top: var(--hairline);
      padding-block: var(--space-5);
    }

    .footer__inner {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-3) var(--space-6);
    }

    .footer__notice {
      font-size: var(--text-xs);
      color: var(--ink-faint);
      font-variant-numeric: tabular-nums;
    }

    .footer__link {
      font-size: var(--text-xs);
      color: var(--ink-muted);
    }
  `,
})
export class SiteFooterComponent {
  protected readonly version = APP_VERSION;
}
