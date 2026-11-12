import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="masthead no-print">
      <div class="container masthead__inner">
        <a routerLink="/" class="wordmark" aria-label="Veritas, home">
          Veritas<span class="wordmark__dot" aria-hidden="true">.</span>
        </a>

        <nav aria-label="Primary">
          <ul class="nav">
            @for (item of items; track item.path) {
              <li>
                <a
                  class="nav__link"
                  [routerLink]="item.path"
                  routerLinkActive="is-active"
                  ariaCurrentWhenActive="page"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .masthead {
      border-bottom: var(--hairline);
      background: var(--paper);
    }

    .masthead__inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3) var(--space-6);
      min-height: var(--nav-height);
      padding-block: var(--space-3);
    }

    .wordmark {
      @include m.display(1.75rem);
      font-weight: var(--weight-medium);
      color: var(--ink);
      text-decoration: none;
      @include m.focus-visible;

      &__dot { color: var(--accent); }
    }

    .nav {
      display: flex;
      gap: var(--space-1) var(--space-5);
      flex-wrap: wrap;
      list-style: none;
      padding: 0;
    }

    .nav__link {
      position: relative;
      display: inline-block;
      padding-block: var(--space-2);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      letter-spacing: 0.01em;
      color: var(--ink-muted);
      text-decoration: none;
      @include m.transition(color);
      @include m.focus-visible;

      // A hairline that draws in from the left. Signals place without colour alone.
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background: var(--ink);
        transform: scaleX(0);
        transform-origin: left;
        @include m.transition(transform);
      }

      &:hover { color: var(--ink); }

      &.is-active {
        color: var(--ink);
        &::after { transform: scaleX(1); }
      }
    }
  `,
})
export class SiteNavComponent {
  protected readonly items: readonly NavItem[] = [
    { label: 'Submit', path: '/submit' },
    { label: 'Reports', path: '/reports' },
    { label: 'Methodology', path: '/methodology' },
    { label: 'Account', path: '/account' },
  ];
}
