import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { AuthorshipAnalysisService } from '../../core/services/authorship-analysis.service';
import { ReviewerService } from '../../core/services/reviewer.service';
import { MIN_WORDS } from '../../models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StepBaselineComponent } from './steps/step-baseline.component';
import { StepContextComponent } from './steps/step-context.component';
import { StepReviewComponent } from './steps/step-review.component';
import { StepTextComponent } from './steps/step-text.component';
import { SubmissionDraft } from './submission-draft';

const STEPS = [
  { label: 'Student & context', title: 'Who wrote it, and for what' },
  { label: 'Text', title: 'The text under review' },
  { label: 'Baseline', title: 'Earlier work by the same student' },
  { label: 'Review', title: 'Review and submit' },
] as const;

type Phase = 'editing' | 'analysing' | 'failed';

@Component({
  selector: 'app-submit-wizard',
  imports: [
    PageHeaderComponent,
    RouterLink,
    StepContextComponent,
    StepTextComponent,
    StepBaselineComponent,
    StepReviewComponent,
  ],
  providers: [SubmissionDraft],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-page-header
        eyebrow="New analysis"
        title="Commission a provenance report"
        lede="Four short steps. Veritas reads the text, compares it with the student's earlier work where you provide it, and returns a report you can discuss with them."
      />

      @switch (phase()) {
        @case ('analysing') {
          <section class="analysing" aria-live="polite" aria-busy="true">
            <div class="analysing__rule" aria-hidden="true"><span></span></div>
            <h2 class="analysing__title">Reading the text</h2>
            <p class="analysing__body">
              Measuring sentence rhythm, vocabulary and formatting traces
              @if (draft.filledBaselines().length) { and comparing them with the student's earlier work }.
            </p>
          </section>
        }
        @default {
          <div class="layout">
            <nav class="progress" aria-label="Submission steps">
              <ol>
                @for (s of steps; track s.label; let i = $index) {
                  <li>
                    <button
                      type="button"
                      class="progress__step"
                      [class.is-current]="i === current()"
                      [class.is-done]="i < current()"
                      [disabled]="i > maxReached()"
                      [attr.aria-current]="i === current() ? 'step' : null"
                      (click)="goTo(i)"
                    >
                      <span class="progress__num numeric">{{ i + 1 }}</span>
                      <span class="progress__label">{{ s.label }}</span>
                      @if (i < current()) { <span class="sr-only">(completed)</span> }
                    </button>
                  </li>
                }
              </ol>
            </nav>

            <form class="panel" novalidate (submit)="onContinue($event)" aria-labelledby="step-heading">
              <header class="panel__head">
                <p class="eyebrow">Step {{ current() + 1 }} of {{ steps.length }}</p>
                <h2 id="step-heading" class="panel__title" tabindex="-1" #heading>{{ step().title }}</h2>
              </header>

              @switch (current()) {
                @case (0) { <app-step-context /> }
                @case (1) { <app-step-text /> }
                @case (2) { <app-step-baseline /> }
                @case (3) { <app-step-review (edit)="goTo($event)" /> }
              }

              @if (phase() === 'failed') {
                <p class="failed" role="alert">
                  The analysis did not complete. Your text is still here; submit again when ready.
                </p>
              }

              <footer class="panel__actions">
                @if (current() > 0) {
                  <button type="button" class="btn btn--quiet" (click)="back()">Back</button>
                } @else {
                  <a routerLink="/methodology" class="btn btn--quiet">How Veritas reads a text</a>
                }

                <span class="tooltip-host">
                  <button
                    type="submit"
                    class="btn btn--primary"
                    [attr.aria-disabled]="blocked() ? 'true' : null"
                    [attr.aria-describedby]="blocked() ? 'continue-tip' : null"
                  >
                    {{ current() === steps.length - 1 ? 'Submit for analysis' : current() === 2 && !draft.filledBaselines().length ? 'Continue without baseline' : 'Continue' }}
                  </button>
                  @if (blocked()) {
                    <span role="tooltip" id="continue-tip" class="tooltip">
                      Texts under {{ min }} words are statistically unreliable for authorship analysis.
                    </span>
                  }
                </span>
              </footer>
            </form>
          </div>
        }
      }

      <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .layout {
      display: grid;
      grid-template-columns: minmax(12rem, 15rem) 1fr;
      gap: var(--space-7);
      align-items: start;

      @media (max-width: 760px) { grid-template-columns: 1fr; gap: var(--space-5); }
    }

    .progress ol {
      list-style: none;
      padding: 0;
      display: grid;
      border-top: var(--hairline);
      position: sticky;
      top: var(--space-5);

      @media (max-width: 760px) { grid-template-columns: repeat(4, 1fr); border-top: 0; }
    }

    .progress__step {
      display: flex;
      align-items: baseline;
      gap: var(--space-3);
      width: 100%;
      padding: var(--space-3) 0;
      border-bottom: var(--hairline);
      text-align: left;
      color: var(--ink-faint);
      @include m.transition(color);
      @include m.focus-visible;

      &:not(:disabled):hover { color: var(--ink); }
      &:disabled { cursor: default; }
      &.is-done { color: var(--ink-muted); }
      &.is-current { color: var(--ink); border-bottom-color: var(--ink); }

      @media (max-width: 760px) {
        flex-direction: column;
        gap: 0;
        .progress__label { font-size: var(--text-xs); }
      }
    }

    .progress__num { @include m.display(var(--text-lg)); min-width: 1.25ch; }
    .is-current .progress__num { color: var(--accent); }
    .progress__label { font-size: var(--text-sm); font-weight: var(--weight-medium); }

    .panel { display: grid; gap: var(--space-6); min-width: 0; }
    .panel__head { display: grid; gap: var(--space-2); }
    .panel__title { font-size: var(--text-xl); outline: none; }

    .panel__actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
      padding-top: var(--space-5);
      border-top: var(--hairline);
    }

    .btn[aria-disabled='true'] { opacity: 0.4; cursor: not-allowed; }

    .tooltip-host { position: relative; display: inline-flex; }

    .tooltip {
      position: absolute;
      bottom: calc(100% + var(--space-2));
      right: 0;
      width: max-content;
      max-width: 18rem;
      padding: var(--space-2) var(--space-3);
      background: var(--ink);
      color: var(--paper);
      font-size: var(--text-xs);
      line-height: var(--leading-snug);
      border-radius: var(--radius-sm);
      z-index: var(--z-tooltip);
      opacity: 0;
      transform: translateY(4px);
      pointer-events: none;
      @include m.transition(opacity, transform);
    }

    .tooltip-host:hover .tooltip,
    .tooltip-host:focus-within .tooltip { opacity: 1; transform: none; }

    .failed { color: var(--signal-high-ink); font-size: var(--text-sm); }

    .analysing {
      display: grid;
      justify-items: center;
      gap: var(--space-4);
      padding-block: var(--space-9);
      text-align: center;
    }

    .analysing__rule {
      position: relative;
      width: min(20rem, 70vw);
      height: 2px;
      background: var(--rule);
      overflow: hidden;

      span {
        position: absolute;
        inset: 0 auto 0 0;
        width: 30%;
        background: var(--signal-gradient);
        animation: sweep 1.6s var(--ease) infinite;
      }
    }

    @keyframes sweep {
      from { transform: translateX(-100%); }
      to   { transform: translateX(340%); }
    }

    @media (prefers-reduced-motion: reduce) {
      .analysing__rule span { animation: none; width: 100%; opacity: 0.6; }
    }

    .analysing__title { font-size: var(--text-xl); }
    .analysing__body { color: var(--ink-muted); }
  `,
})
export class SubmitWizardComponent {
  protected readonly draft = inject(SubmissionDraft);
  private readonly analysis = inject(AuthorshipAnalysisService);
  private readonly reviewer = inject(ReviewerService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly steps = STEPS;
  protected readonly min = MIN_WORDS;
  protected readonly current = signal(0);
  protected readonly maxReached = signal(0);
  protected readonly phase = signal<Phase>('editing');
  protected readonly announcement = signal('');

  protected readonly step = computed(() => STEPS[this.current()] ?? STEPS[0]);
  /** Only the text step can be hard-blocked; everything else validates on attempt. */
  protected readonly blocked = computed(() => this.current() === 1 && !this.draft.meetsMinimum());

  protected onContinue(event: Event): void {
    event.preventDefault();
    const step = this.current();

    if (step === 0 && !this.draft.contextValid()) {
      this.draft.showErrors.set(true);
      this.focusFirstInvalid();
      return;
    }
    if (this.blocked()) {
      this.announcement.set(`Texts under ${MIN_WORDS} words are statistically unreliable for authorship analysis.`);
      return;
    }
    if (step === STEPS.length - 1) {
      this.submit();
      return;
    }
    this.goTo(step + 1);
  }

  protected back(): void {
    this.goTo(Math.max(0, this.current() - 1));
  }

  protected goTo(index: number): void {
    if (index > this.maxReached() + 1) return;
    this.current.set(index);
    this.maxReached.update((m) => Math.max(m, index));
    const s = STEPS[index];
    if (s) this.announcement.set(`Step ${index + 1} of ${STEPS.length}: ${s.label}`);
    // Move focus to the new step's heading so keyboard and screen-reader
    // users land at the top of the new content, not on a vanished button.
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }

  private focusFirstInvalid(): void {
    afterNextRender(
      () => (this.host.nativeElement as HTMLElement).querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }

  private submit(): void {
    const d = this.draft;
    this.phase.set('analysing');
    this.analysis
      .analyze({
        studentId: d.studentId().trim(),
        course: d.course().trim(),
        assignmentType: d.assignmentType(),
        aiDisclosure: d.aiDisclosure(),
        isL2: d.isL2(),
        text: d.text(),
        baselines: d.filledBaselines(),
        submittedBy: this.reviewer.name(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => void this.router.navigate(['/reports', report.id]),
        error: () => this.phase.set('failed'),
      });
  }
}
