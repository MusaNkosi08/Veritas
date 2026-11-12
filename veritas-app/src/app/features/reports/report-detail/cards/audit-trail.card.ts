import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ReportStore } from '../../../../core/services/report-store.service';
import { ReviewerService } from '../../../../core/services/reviewer.service';
import { AuditAction, ProvenanceReport } from '../../../../models';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';

const ACTION_COPY: Record<AuditAction, string> = {
  submitted: 'Submitted',
  analysed: 'Analysed',
  'note-added': 'Reviewer note',
  exported: 'Exported',
};

@Component({
  selector: 'app-audit-trail-card',
  imports: [ReportCardComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="F" title="Export and audit trail" kicker="Every action on this report, in order. Entries can be added, never edited or removed.">
      <div class="layout">
        <div>
          <ol class="trail">
            @for (e of r().auditTrail; track e.id) {
              <li class="entry">
                <time class="entry__time numeric" [attr.datetime]="e.at.toISOString()">{{ e.at | date: 'd MMM y, HH:mm' }}</time>
                <div>
                  <p class="entry__action">{{ copy[e.action] }} <span class="entry__actor">· {{ e.actor }}</span></p>
                  <p class="entry__detail">{{ e.detail }}</p>
                </div>
              </li>
            }
          </ol>
          <p class="meta numeric">
            Report {{ r().id }} · version {{ r().reportVersion }} · engine v{{ r().engineVersion }}
          </p>
        </div>

        <div class="side no-print">
          <form class="note" (submit)="addNote($event)">
            <label class="field__label" for="reviewer-note">Reviewer note</label>
            <textarea
              id="reviewer-note"
              class="input note__input"
              rows="4"
              placeholder="Record what was discussed, decided or checked."
              [value]="note()"
              (input)="note.set(val($event))"
            ></textarea>
            <button type="submit" class="btn btn--secondary" [disabled]="!note().trim()">Add to audit trail</button>
          </form>

          <div class="export">
            <button type="button" class="btn btn--primary" (click)="exportPdf()">Export PDF</button>
            <p class="field__hint">Opens the print dialog. Choose "Save as PDF" as the destination.</p>
          </div>
        </div>
      </div>
    </app-report-card>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-7);
      @media (max-width: 760px) { grid-template-columns: 1fr; gap: var(--space-5); }
    }

    .trail { list-style: none; padding: 0; border-top: var(--hairline); }

    .entry {
      display: grid;
      grid-template-columns: 9.5rem 1fr;
      gap: var(--space-4);
      padding-block: var(--space-3);
      border-bottom: var(--hairline);
      font-size: var(--text-sm);
      @media (max-width: 520px) { grid-template-columns: 1fr; gap: var(--space-1); }
    }

    .entry__time { color: var(--ink-faint); }
    .entry__action { font-weight: var(--weight-medium); }
    .entry__actor { font-weight: normal; color: var(--ink-muted); }
    .entry__detail { color: var(--ink-muted); white-space: pre-wrap; }

    .meta { margin-top: var(--space-3); font-size: var(--text-xs); color: var(--ink-faint); }

    .side { display: grid; gap: var(--space-6); align-content: start; }
    .note { display: grid; gap: var(--space-2); justify-items: start; }
    .note__input { resize: vertical; }
    .export { display: grid; gap: var(--space-2); justify-items: start; padding-top: var(--space-5); border-top: var(--hairline); }
  `,
})
export class AuditTrailCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });
  private readonly store = inject(ReportStore);
  private readonly reviewer = inject(ReviewerService);

  protected readonly copy = ACTION_COPY;
  protected readonly note = signal('');

  protected val(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }

  protected addNote(e: Event): void {
    e.preventDefault();
    const text = this.note().trim();
    if (!text) return;
    this.store.appendAudit(this.r().id, { at: new Date(), actor: this.reviewer.name(), action: 'note-added', detail: text });
    this.note.set('');
  }

  protected exportPdf(): void {
    // Log first so the printed copy carries its own export entry.
    this.store.appendAudit(this.r().id, {
      at: new Date(),
      actor: this.reviewer.name(),
      action: 'exported',
      detail: 'Printed or saved as PDF.',
    });
    // Let the new entry render before the print snapshot is taken.
    setTimeout(() => window.print(), 50);
  }
}
