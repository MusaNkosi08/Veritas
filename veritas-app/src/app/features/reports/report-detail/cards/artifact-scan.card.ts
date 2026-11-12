import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ProvenanceReport } from '../../../../models';
import { ReportCardComponent } from '../../../../shared/ui/report-card.component';

@Component({
  selector: 'app-artifact-scan-card',
  imports: [ReportCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-report-card letter="C" title="Typographic artifact scan" kicker="Characters and formatting left in the text. Concrete, countable, and checkable by anyone.">
      <section aria-labelledby="notable-head">
        <h3 class="group-head" id="notable-head">
          Worth a conversation
          <span class="group-count numeric">{{ notable().length }}</span>
        </h3>
        @if (notable().length) {
          <ul class="artifacts">
            @for (a of notable(); track a.kind) {
              <li class="artifact artifact--notable">
                <div class="artifact__top">
                  <code class="artifact__glyph">{{ a.glyph }}</code>
                  <span class="artifact__label">{{ a.label }}</span>
                  <span class="artifact__count numeric">× {{ a.count }}</span>
                </div>
                <p class="artifact__why">{{ a.explanation }}</p>
                <ul class="samples" aria-label="Excerpts">
                  @for (s of a.samples; track $index) {
                    <li><code>{{ s }}</code></li>
                  }
                </ul>
              </li>
            }
          </ul>
        } @else {
          <p class="none">None found. No hidden characters, Markdown syntax or pasted bullet glyphs.</p>
        }
      </section>

      <section aria-labelledby="common-head" class="common">
        <h3 class="group-head" id="common-head">
          Usually autocorrect
          <span class="group-count numeric">{{ common().length }}</span>
        </h3>
        @if (common().length) {
          <ul class="common__list">
            @for (a of common(); track a.kind) {
              <li>
                <code>{{ a.glyph }}</code>
                <span>{{ a.label }}</span>
                <span class="numeric common__n">× {{ a.count }}</span>
              </li>
            }
          </ul>
          <p class="common__note">
            Word, Google Docs and macOS insert these by default. Listed for completeness; they carry
            no weight in the verdict.
          </p>
        } @else {
          <p class="none">None found.</p>
        }
      </section>
    </app-report-card>
  `,
  styles: `
    :host { display: block; }

    .group-head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .group-count {
      display: inline-grid;
      place-items: center;
      min-width: 1.5rem;
      height: 1.5rem;
      border: var(--hairline);
      border-radius: 50%;
      font-size: var(--text-xs);
      color: var(--ink);
      letter-spacing: 0;
    }

    .artifacts { list-style: none; padding: 0; display: grid; gap: var(--space-4); }

    .artifact {
      padding: var(--space-4);
      border: var(--hairline);
      border-left: 2px solid var(--signal-high);
      background: var(--paper);
    }

    .artifact__top { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
    .artifact__glyph { font-size: var(--text-sm); }
    .artifact__label { font-weight: var(--weight-medium); flex: 1; }
    .artifact__count { font-weight: var(--weight-semi); }
    .artifact__why { margin-top: var(--space-2); font-size: var(--text-sm); color: var(--ink-muted); }

    .samples {
      list-style: none;
      padding: 0;
      margin-top: var(--space-3);
      display: grid;
      gap: var(--space-1);

      code {
        display: block;
        font-size: var(--text-xs);
        white-space: pre-wrap;
        word-break: break-word;
        padding: var(--space-2);
        color: var(--ink-muted);
      }
    }

    .common { margin-top: var(--space-6); padding-top: var(--space-5); border-top: var(--hairline); }

    .common__list {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--ink-muted);

      li { display: grid; grid-template-columns: 3.5rem 1fr auto; gap: var(--space-3); align-items: baseline; }
    }

    .common__n { color: var(--ink-faint); }
    .common__note { margin-top: var(--space-3); font-size: var(--text-xs); color: var(--ink-faint); }

    .none { font-size: var(--text-sm); color: var(--ink-muted); }
  `,
})
export class ArtifactScanCardComponent {
  readonly r = input.required<ProvenanceReport>({ alias: 'report' });
  protected readonly notable = computed(() => this.r().artifacts.filter((a) => a.weight === 'notable'));
  protected readonly common = computed(() => this.r().artifacts.filter((a) => a.weight === 'common'));
}
