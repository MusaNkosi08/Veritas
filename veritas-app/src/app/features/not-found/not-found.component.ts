import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-not-found',
  imports: [PageHeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-page-header
        eyebrow="404"
        title="No page at this address."
        lede="The link may be mistyped, or the page may have moved."
      >
        <div>
          <a routerLink="/reports" class="btn btn--secondary">Go to the archive</a>
        </div>
      </app-page-header>
    </div>
  `,
})
export class NotFoundComponent {}
