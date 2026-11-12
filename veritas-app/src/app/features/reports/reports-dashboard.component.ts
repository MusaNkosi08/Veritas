import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorshipAnalysisService } from '../../core/services/authorship-analysis.service';
import { ReportStore } from '../../core/services/report-store.service';
import { SignalLabel } from '../../models';
import { CONFIDENCE_COPY } from '../../shared/signal-copy';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { SignalChipComponent } from '../../shared/ui/signal-chip.component';

type Filter = 'all' | SignalLabel;

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'verified-process', label: 'Low' },
  { value: 'inconclusive', label: 'Inconclusive' },
  { value: 'probable-ai', label: 'High' },
];

@Component({
  selector: 'app-reports-dashboard',
  imports: [PageHeaderComponent, RouterLink, DatePipe, DecimalPipe, SignalChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-page-header
        eyebrow="Archive"
        title="Provenance reports"
        lede="Every report you commission is kept here, newest first, with its audit trail intact."
      />

      @if (store.count() === 0) {
        <section class="empty" aria-labelledby="empty-title">
          <p class="empty__mark" aria-hidden="true">§</p>
          <h2 id="empty-title" class="empty__title">The archive is empty.</h2>
          <p class="empty__body">
            No text has been examined yet. When you commission your first report, it will be filed
            here alongside its verdict, its confidence rating and the date it was read.
          </p>
          <div class="empty__actions">
            <a routerLink="/submit" class="btn btn--primary">Commission a report</a>
            <button type="button" class="btn btn--secondary" (click)="loadSamples()">Load three sample reports</button>
          </div>
        </section>
      } @else {
        <div class="toolbar">
          <div class="filters" role="group" aria-label="Filter by signal">
            @for (f of filters; track f.value) {
              <button
                type="button"
                class="filter"
                [class.is-active]="filter() === f.value"
                [attr.aria-pressed]="filter() === f.value"
                (click)="filter.set(f.value)"
              >
                {{ f.label }} <span class="filter__n numeric">{{ counts()[f.value] }}</span>
              </button>
            }
          </div>
          <a routerLink="/submit" class="btn btn--primary">New report</a>
        </div>

        @if (visible().length) {
          <table class="reports">
            <caption class="sr-only">Provenance reports, newest first</caption>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Course</th>
                <th scope="col" class="num">Words</th>
                <th scope="col">Signal</th>
                <th scope="col">Confidence</th>
                <th scope="col">Date</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              @for (r of visible(); track r.id) {
                <tr>
                  <td data-label="Student" class="numeric student">{{ r.studentMaskedId }}</td>
                  <td data-label="Course">
                    <span class="course">{{ r.course }}</span>
                    <span class="type">{{ r.assignmentType }}</span>
                  </td>
                  <td data-label="Words" class="num numeric">{{ r.wordCount | number }}</td>
                  <td data-label="Signal"><app-signal-chip [label]="r.signalLabel" /></td>
                  <td data-label="Confidence">{{ confidence[r.confidence] }}</td>
                  <td data-label="Date" class="numeric date">{{ r.submittedAt | date: 'd MMM y' }}</td>
                  <td class="action">
                    <a [routerLink]="['/reports', r.id]">View report<span class="sr-only"> for {{ r.studentMaskedId }}, {{ r.course }}</span></a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <section class="filtered-empty" aria-live="polite">
            @switch (filter()) {
              @case ('verified-process') {
                <h2>No reports at the low end of the spectrum.</h2>
                <p>None of the texts on file read as a clear human drafting process yet.</p>
              }
              @case ('inconclusive') {
                <h2>Nothing is waiting in the middle.</h2>
                <p>No report is currently inconclusive, so no writing conferences are suggested.</p>
              }
              @case ('probable-ai') {
                <h2>No report sits at the high end.</h2>
                <p>None of the texts on file show a pattern consistent with AI generation.</p>
              }
            }
            <button type="button" class="btn btn--secondary" (click)="filter.set('all')">Show all reports</button>
          </section>
        }
      }
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .empty {
      display: grid;
      justify-items: center;
      gap: var(--space-4);
      padding-block: var(--space-8);
      text-align: center;
    }
    .empty__mark { @include m.display(var(--text-3xl)); color: var(--accent); line-height: 1; }
    .empty__title { font-size: var(--text-xl); }
    .empty__body { color: var(--ink-muted); max-width: 44ch; }
    .empty__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); margin-top: var(--space-3); }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }

    .filters { display: flex; flex-wrap: wrap; border: var(--hairline); border-radius: var(--radius-sm); }

    .filter {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      color: var(--ink-muted);
      border-right: var(--hairline);
      @include m.transition(background-color, color);
      @include m.focus-visible;
      &:last-child { border-right: 0; }
      &:hover { color: var(--ink); }
      &.is-active { background: var(--ink); color: var(--paper); }
    }
    .filter__n { margin-left: var(--space-1); opacity: 0.7; }

    .reports {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);

      th {
        @include m.eyebrow;
        text-align: left;
        padding: var(--space-3) var(--space-4) var(--space-3) 0;
        border-bottom: 1px solid var(--rule-strong);
      }
      td {
        padding: var(--space-4) var(--space-4) var(--space-4) 0;
        border-bottom: var(--hairline);
        vertical-align: middle;
      }
      tbody tr { @include m.transition(background-color); }
      tbody tr:hover { background: var(--paper-raised); }

      .num { text-align: right; }
    }

    .student { font-weight: var(--weight-medium); letter-spacing: 0.04em; }
    .course { display: block; font-weight: var(--weight-medium); }
    .type { display: block; font-size: var(--text-xs); color: var(--ink-faint); }
    .date { color: var(--ink-muted); white-space: nowrap; }
    .action { text-align: right; white-space: nowrap; }

    // Below tablet width each row becomes a card: same data, readable without sideways scrolling.
    @media (max-width: 760px) {
      .reports thead { @include m.sr-only; }
      .reports, .reports tbody, .reports tr, .reports td { display: block; }
      .reports tr {
        @include m.card;
        padding: var(--space-4);
        margin-bottom: var(--space-3);
      }
      .reports td {
        display: grid;
        grid-template-columns: 7rem 1fr;
        gap: var(--space-3);
        padding: var(--space-2) 0;
        border: 0;
        text-align: left;
        &::before { content: attr(data-label); @include m.eyebrow; }
      }
      .reports .num { text-align: left; }
      .reports .action { display: block; padding-top: var(--space-3); &::before { content: none; } }
    }

    .filtered-empty {
      display: grid;
      justify-items: start;
      gap: var(--space-3);
      padding: var(--space-7) 0;
      border-top: var(--hairline);
      h2 { font-size: var(--text-xl); }
      p { color: var(--ink-muted); }
    }
  `,
})
export class ReportsDashboardComponent {
  protected readonly store = inject(ReportStore);
  private readonly analysis = inject(AuthorshipAnalysisService);

  protected readonly filters = FILTERS;
  protected readonly confidence = CONFIDENCE_COPY;
  protected readonly filter = signal<Filter>('all');

  protected readonly counts = computed(() => {
    const all = this.store.reports();
    return {
      all: all.length,
      'verified-process': all.filter((r) => r.signalLabel === 'verified-process').length,
      inconclusive: all.filter((r) => r.signalLabel === 'inconclusive').length,
      'probable-ai': all.filter((r) => r.signalLabel === 'probable-ai').length,
    } satisfies Record<Filter, number>;
  });

  protected readonly visible = computed(() => {
    const f = this.filter();
    const all = this.store.reports();
    return f === 'all' ? all : all.filter((r) => r.signalLabel === f);
  });

  protected loadSamples(): void {
    this.analysis.loadSamples();
  }
}
