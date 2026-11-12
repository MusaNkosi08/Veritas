import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of, tap } from 'rxjs';

import { ProvenanceReport, Submission } from '../../models';
import { analyzeSubmission } from '../analysis/analyze';
import { FIXTURES } from '../mocks/fixtures';
import { ReportStore } from './report-store.service';

/** Simulated round trip. Long enough to show the analysing state, short enough not to annoy. */
const MOCK_LATENCY_MS = 1600;

/**
 * The single seam between the UI and analysis. Today it runs the
 * heuristics in the browser; when the backend arrives, `analyze` becomes
 *
 *   this.http.post<ProvenanceReport>('/api/reports', submission)
 *
 * and nothing upstream changes. Dates will need reviving from JSON at
 * that point, as the store already does for localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthorshipAnalysisService {
  private readonly store = inject(ReportStore);

  analyze(submission: Submission): Observable<ProvenanceReport> {
    return defer(() => of(analyzeSubmission(submission, newReportId(), new Date()))).pipe(
      delay(MOCK_LATENCY_MS),
      tap((report) => this.store.add(report)),
    );
  }

  /** Runs the sample submissions through the live pipeline and files them. */
  loadSamples(): void {
    const now = Date.now();
    const reports = FIXTURES.map((f, i) => {
      const at = new Date(now - f.daysAgo * 86_400_000 - i * 3_600_000);
      return analyzeSubmission(f.submission, `VR-SAMPLE-${i + 1}`, at);
    });
    this.store.addMany(reports);
  }
}

/** VR-YYMMDD-XXXX. Readable aloud in a meeting, sortable, unambiguous (no 0/O, 1/I). */
function newReportId(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => alphabet[b % alphabet.length]).join('');
  return `VR-${ymd}-${suffix}`;
}
