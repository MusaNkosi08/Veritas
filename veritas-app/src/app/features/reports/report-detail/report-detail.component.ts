import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReportStore } from '../../../core/services/report-store.service';
import { DISCLOSURE_COPY } from '../../../shared/signal-copy';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { SignalChipComponent } from '../../../shared/ui/signal-chip.component';
import { ArtifactScanCardComponent } from './cards/artifact-scan.card';
import { AuditTrailCardComponent } from './cards/audit-trail.card';
import { ConfidenceWarningsCardComponent } from './cards/confidence-warnings.card';
import { DraftVelocityCardComponent } from './cards/draft-velocity.card';
import { StylometricsCardComponent } from './cards/stylometrics.card';
import { VerdictSpectrumCardComponent } from './cards/verdict-spectrum.card';

@Component({
  selector: 'app-report-detail',
  imports: [
    PageHeaderComponent,
    RouterLink,
    DatePipe,
    DecimalPipe,
    SignalChipComponent,
    VerdictSpectrumCardComponent,
    StylometricsCardComponent,
    ArtifactScanCardComponent,
    DraftVelocityCardComponent,
    ConfidenceWarningsCardComponent,
    AuditTrailCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      @if (report(); as r) {
        <nav class="crumbs no-print" aria-label="Breadcrumb">
          <a routerLink="/reports">Reports</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page" class="numeric">{{ r.id }}</span>
        </nav>

        <header class="masthead">
          <div class="masthead__top">
            <p class="eyebrow">Writing Provenance Report · <span class="numeric">{{ r.id }}</span></p>
            <app-signal-chip [label]="r.signalLabel" />
          </div>
          <h1 class="masthead__title">{{ r.course }}</h1>
          <p class="masthead__sub">{{ r.assignmentType }}</p>

          <dl class="facts">
            <div><dt class="eyebrow">Student</dt><dd class="numeric">{{ r.studentMaskedId }}</dd></div>
            <div><dt class="eyebrow">Submitted</dt><dd class="numeric">{{ r.submittedAt | date: 'd MMM y, HH:mm' }}</dd></div>
            <div><dt class="eyebrow">Length</dt><dd class="numeric">{{ r.wordCount | number }} words · {{ r.sentenceCount }} sentences</dd></div>
            <div><dt class="eyebrow">AI disclosure</dt><dd>{{ disclosure() }}</dd></div>
            <div><dt class="eyebrow">Language</dt><dd>{{ r.isL2 ? 'Additional language (declared)' : 'Not declared' }}</dd></div>
            <div><dt class="eyebrow">Baseline</dt><dd class="numeric">{{ r.baselineCount ? r.baselineCount + ' essays · ' + (r.baselineWordCount | number) + ' words' : 'None' }}</dd></div>
          </dl>
        </header>

        <div class="cards">
          <app-verdict-spectrum-card class="span-2" [report]="r" />
          <app-stylometrics-card class="span-2" [report]="r" />
          <app-artifact-scan-card [report]="r" />
          <!-- D and E stack beside C so the sections read in letter order. -->
          <div class="stack">
            <app-draft-velocity-card [report]="r" />
            <app-confidence-warnings-card [report]="r" />
          </div>
          <app-audit-trail-card class="span-2" [report]="r" />
        </div>

        <p class="print-only print-footer">
          Veritas is a diagnostic aid. No single score may be used for disciplinary action without
          human review. Report {{ r.id }}, engine v{{ r.engineVersion }}.
        </p>


        <details class="source">
          <summary>Examined text</summary>
          <div class="source__body">{{ r.text }}</div>
        </details>
      } @else {
        <app-page-header
          [eyebrow]="'Report ' + id()"
          title="This report is not on file."
          lede="It may have been commissioned in another browser, or the link may be incomplete. Reports are stored on this device only in the current release."
        >
          <div><a routerLink="/reports" class="btn btn--secondary">Back to the archive</a></div>
        </app-page-header>
      }
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .crumbs {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
      font-size: var(--text-sm);
      color: var(--ink-faint);
    }

    .masthead {
      display: grid;
      gap: var(--space-2);
      padding-bottom: var(--space-6);
      margin-bottom: var(--space-6);
      border-bottom: var(--hairline-ink);
    }

    .masthead__top { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
    .masthead__title { font-size: clamp(var(--text-2xl), 4vw, var(--text-3xl)); }
    .masthead__sub { color: var(--ink-muted); font-size: var(--text-md); }

    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--space-4) var(--space-5);
      margin-top: var(--space-5);

      div { display: grid; gap: var(--space-1); }
      dd { margin: 0; font-size: var(--text-sm); }
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-5);

      @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
    }

    .span-2 { grid-column: 1 / -1; }
    .stack { display: grid; gap: var(--space-5); align-content: start; }

    .source {
      margin-top: var(--space-6);
      border-top: var(--hairline);
      padding-top: var(--space-4);

      summary { cursor: pointer; font-weight: var(--weight-medium); color: var(--accent); @include m.focus-visible; }
    }

    .source__body {
      margin-top: var(--space-4);
      padding: var(--space-5);
      background: var(--paper-raised);
      border: var(--hairline);
      font-family: var(--font-display);
      white-space: pre-wrap;
      line-height: var(--leading-body);
      max-width: 72ch;
    }

    .print-only { display: none; }
  `,
})
export class ReportDetailComponent {
  // Bound from the :id route param via withComponentInputBinding().
  readonly id = input.required<string>();
  private readonly store = inject(ReportStore);

  protected readonly report = computed(() => this.store.byId(this.id()));
  protected readonly disclosure = computed(() => {
    const r = this.report();
    return r ? DISCLOSURE_COPY[r.aiDisclosure] : '';
  });
}
