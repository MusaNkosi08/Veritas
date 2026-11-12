import { Injectable, computed, effect, signal } from '@angular/core';

import { AuditEntry, ProvenanceReport } from '../../models';

const STORAGE_KEY = 'veritas.reports.v1';

/**
 * The archive. A single signal holding every report, newest first,
 * mirrored to localStorage. Reports are append-only by design: the only
 * mutation offered is adding an audit entry, which is how a provenance
 * record ought to behave.
 */
@Injectable({ providedIn: 'root' })
export class ReportStore {
  private readonly _reports = signal<ProvenanceReport[]>(load());

  readonly reports = this._reports.asReadonly();
  readonly count = computed(() => this._reports().length);

  constructor() {
    effect(() => persist(this._reports()));
  }

  byId(id: string): ProvenanceReport | undefined {
    return this._reports().find((r) => r.id === id);
  }

  add(report: ProvenanceReport): void {
    this._reports.update((list) => sortNewest([report, ...list.filter((r) => r.id !== report.id)]));
  }

  addMany(reports: ProvenanceReport[]): void {
    const ids = new Set(reports.map((r) => r.id));
    this._reports.update((list) => sortNewest([...reports, ...list.filter((r) => !ids.has(r.id))]));
  }

  appendAudit(reportId: string, entry: Omit<AuditEntry, 'id'>): void {
    this._reports.update((list) =>
      list.map((r) =>
        r.id === reportId
          ? { ...r, auditTrail: [...r.auditTrail, { ...entry, id: `${reportId}-a${r.auditTrail.length + 1}` }] }
          : r,
      ),
    );
  }

  clear(): void {
    this._reports.set([]);
  }
}

const sortNewest = (list: ProvenanceReport[]): ProvenanceReport[] =>
  [...list].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

// JSON flattens Dates to strings; restore them on the way back in so the
// rest of the app never has to wonder which it is holding.
function load(): ProvenanceReport[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProvenanceReport[];
    return sortNewest(
      parsed.map((r) => ({
        ...r,
        submittedAt: new Date(r.submittedAt),
        auditTrail: r.auditTrail.map((a) => ({ ...a, at: new Date(a.at) })),
      })),
    );
  } catch {
    // A corrupt or unavailable store should never take the app down.
    return [];
  }
}

function persist(reports: ProvenanceReport[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Quota or private mode. The session still works; it just won't survive reload.
  }
}
