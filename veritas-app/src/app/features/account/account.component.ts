import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AuthorshipAnalysisService } from '../../core/services/authorship-analysis.service';
import { ReportStore } from '../../core/services/report-store.service';
import { ReviewerService } from '../../core/services/reviewer.service';
import { APP_VERSION } from '../../core/version';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-account',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-page-header
        eyebrow="Account"
        title="Reviewer settings"
        lede="This release runs in single-reviewer mode. Institutional sign-in and shared archives arrive with the hosted service."
      />

      <div class="sections">
        <section aria-labelledby="identity-head">
          <h2 id="identity-head">Your name on the audit trail</h2>
          <div class="field name">
            <label class="field__label" for="reviewer-name">Reviewer name</label>
            <input
              id="reviewer-name"
              class="input"
              autocomplete="name"
              [value]="reviewer.name()"
              (input)="setName($event)"
            />
            <span class="field__hint">Recorded against every report you submit and every note you add. Saved as you type.</span>
          </div>
        </section>

        <section aria-labelledby="storage-head">
          <h2 id="storage-head">This device</h2>
          <dl class="facts">
            <div><dt class="eyebrow">Mode</dt><dd>Single reviewer, this browser only</dd></div>
            <div><dt class="eyebrow">Reports stored</dt><dd class="numeric">{{ store.count() }}</dd></div>
            <div><dt class="eyebrow">Storage</dt><dd>Kept in local storage on this device. Nothing is sent elsewhere.</dd></div>
            <div><dt class="eyebrow">Release</dt><dd class="numeric">v{{ version }}</dd></div>
          </dl>

          <div class="actions">
            <button type="button" class="btn btn--secondary" (click)="analysis.loadSamples()">Load sample reports</button>

            @if (!confirming()) {
              <button type="button" class="btn btn--quiet" [disabled]="!store.count()" (click)="confirming.set(true)">
                Delete all reports
              </button>
            } @else {
              <div class="confirm" role="alert">
                <p>Delete {{ store.count() }} {{ store.count() === 1 ? 'report' : 'reports' }} from this browser? Audit trails go with them. This cannot be undone.</p>
                <div class="confirm__buttons">
                  <button type="button" class="btn btn--primary danger" (click)="clear()">Delete permanently</button>
                  <button type="button" class="btn btn--quiet" (click)="confirming.set(false)">Keep them</button>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    .sections { display: grid; gap: var(--space-8); max-width: 52rem; }
    section { display: grid; gap: var(--space-4); }
    h2 { font-size: var(--text-xl); }

    .name { max-width: 28rem; }

    .facts {
      border-top: var(--hairline);
      div {
        display: grid;
        grid-template-columns: minmax(8rem, 12rem) 1fr;
        gap: var(--space-4);
        padding-block: var(--space-3);
        border-bottom: var(--hairline);
      }
      dd { margin: 0; }
    }

    .actions { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-start; }

    .confirm {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--signal-high);
      background: var(--signal-high-wash);
      p { font-size: var(--text-sm); }
    }
    .confirm__buttons { display: flex; gap: var(--space-3); }
    .danger { background: var(--signal-high-ink); border-color: var(--signal-high-ink); }
  `,
})
export class AccountComponent {
  protected readonly reviewer = inject(ReviewerService);
  protected readonly store = inject(ReportStore);
  protected readonly analysis = inject(AuthorshipAnalysisService);
  protected readonly version = APP_VERSION;
  protected readonly confirming = signal(false);

  protected setName(e: Event): void {
    this.reviewer.name.set((e.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.store.clear();
    this.confirming.set(false);
  }
}
