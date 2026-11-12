import { Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';

import { SiteNavComponent } from './core/layout/site-nav.component';
import { SiteFooterComponent } from './core/layout/site-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteNavComponent, SiteFooterComponent],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>

    <app-site-nav />

    <main id="main" #main tabindex="-1" class="main">
      <router-outlet />
    </main>

    <app-site-footer />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: auto 1fr auto;
      min-height: 100dvh;
    }

    .main {
      padding-block: var(--space-8) var(--space-9);
      outline: none;
    }
  `,
})
export class AppComponent {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    // In an SPA, focus stays on the clicked nav link after a route change,
    // leaving screen-reader users stranded. Move it to the new content instead.
    // The first navigation is skipped so initial load doesn't steal focus.
    inject(Router)
      .events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.main().nativeElement.focus({ preventScroll: true }));

    // Collapsed sections are part of the record. Open them for print so the
    // PDF carries the full report, then restore what the reviewer had closed.
    if (typeof window !== 'undefined') {
      let opened: HTMLDetailsElement[] = [];
      window.addEventListener('beforeprint', () => {
        opened = [...document.querySelectorAll<HTMLDetailsElement>('main details:not([open])')];
        opened.forEach((d) => (d.open = true));
      });
      window.addEventListener('afterprint', () => opened.forEach((d) => (d.open = false)));
    }
  }
}
