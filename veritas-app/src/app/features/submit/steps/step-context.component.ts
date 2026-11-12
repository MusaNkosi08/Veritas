import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ASSIGNMENT_TYPES, DISCLOSURE_OPTIONS } from '../../../models';
import { SubmissionDraft } from '../submission-draft';

@Component({
  selector: 'app-step-context',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      <div class="field">
        <label class="field__label" for="student-id">Student number</label>
        <input
          id="student-id"
          class="input numeric"
          autocomplete="off"
          spellcheck="false"
          [value]="d.studentId()"
          (input)="d.studentId.set(val($event))"
          [attr.aria-invalid]="d.showErrors() && !!d.studentIdError()"
          aria-describedby="student-id-hint student-id-error"
        />
        <span class="field__hint" id="student-id-hint">Masked on the report. Only the first and last two characters are kept.</span>
        @if (d.showErrors() && d.studentIdError(); as err) {
          <span class="field__error" id="student-id-error">{{ err }}</span>
        }
      </div>

      <div class="field">
        <label class="field__label" for="course">Course</label>
        <input
          id="course"
          class="input"
          placeholder="HIST 214 · Urban Histories of the Cape"
          [value]="d.course()"
          (input)="d.course.set(val($event))"
          [attr.aria-invalid]="d.showErrors() && !!d.courseError()"
          aria-describedby="course-error"
        />
        @if (d.showErrors() && d.courseError(); as err) {
          <span class="field__error" id="course-error">{{ err }}</span>
        }
      </div>

      <div class="field">
        <label class="field__label" for="assignment-type">Assignment type</label>
        <select
          id="assignment-type"
          class="select"
          [value]="d.assignmentType()"
          (change)="d.assignmentType.set(val($event))"
        >
          @for (t of types; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
      </div>
    </div>

    <fieldset class="disclosure">
      <legend class="field__label">The student's AI-use disclosure</legend>
      <div class="options">
        @for (opt of disclosures; track opt.value) {
          <label class="option" [class.is-selected]="d.aiDisclosure() === opt.value">
            <input
              type="radio"
              name="disclosure"
              [value]="opt.value"
              [checked]="d.aiDisclosure() === opt.value"
              (change)="d.aiDisclosure.set(opt.value)"
            />
            <span class="option__label">{{ opt.label }}</span>
            <span class="option__hint">{{ opt.hint }}</span>
          </label>
        }
      </div>
    </fieldset>

    <div class="l2">
      <label class="switch">
        <input
          type="checkbox"
          role="switch"
          [checked]="d.isL2()"
          (change)="d.isL2.set(checked($event))"
          aria-describedby="l2-hint"
        />
        <span class="switch__track" aria-hidden="true"><span class="switch__thumb"></span></span>
        <span class="switch__label">The student writes in an additional language</span>
      </label>
      <p class="field__hint" id="l2-hint">
        Self-declared by the student. Additional-language writing shares surface features with
        generated text, so the report weighs its readings with more caution and holds them at
        Inconclusive unless a baseline is supplied.
      </p>
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host { display: grid; gap: var(--space-7); }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: var(--space-5);
    }

    .disclosure { border: 0; padding: 0; display: grid; gap: var(--space-3); }

    .options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
      border: var(--hairline);
    }

    .option {
      position: relative;
      display: grid;
      gap: var(--space-1);
      padding: var(--space-4);
      cursor: pointer;
      border-right: var(--hairline);
      @include m.transition(background-color);
      &:last-child { border-right: 0; }
      &:hover { background: var(--paper-sunk); }

      input { @include m.sr-only; }
      &:has(input:focus-visible) { box-shadow: inset 0 0 0 2px var(--accent); }

      &.is-selected {
        background: var(--accent-wash);
        box-shadow: inset 0 -2px 0 var(--accent);
      }
    }

    .option__label { font-weight: var(--weight-semi); }
    .option__hint { font-size: var(--text-xs); color: var(--ink-muted); }

    .l2 { display: grid; gap: var(--space-2); max-width: 60ch; }

    .switch {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;

      input { @include m.sr-only; }
    }

    .switch__track {
      position: relative;
      width: 2.5rem;
      height: 1.375rem;
      border: var(--hairline-ink);
      border-radius: 999px;
      @include m.transition(background-color);
    }

    .switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: var(--ink);
      @include m.transition(transform, background-color);
    }

    input:checked + .switch__track {
      background: var(--ink);
      .switch__thumb { transform: translateX(1.125rem); background: var(--paper); }
    }

    input:focus-visible + .switch__track { box-shadow: var(--focus-ring); }

    .switch__label { font-weight: var(--weight-medium); }
  `,
})
export class StepContextComponent {
  protected readonly d = inject(SubmissionDraft);
  protected readonly types = ASSIGNMENT_TYPES;
  protected readonly disclosures = DISCLOSURE_OPTIONS;

  protected val(e: Event): string {
    return (e.target as HTMLInputElement | HTMLSelectElement).value;
  }
  protected checked(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}
