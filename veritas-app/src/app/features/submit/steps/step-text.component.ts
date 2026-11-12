import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MIN_WORDS } from '../../../models';
import { SubmissionDraft } from '../submission-draft';

type FileNotice = { tone: 'ok' | 'warn'; message: string } | null;

@Component({
  selector: 'app-step-text',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field">
      <div class="label-row">
        <label class="field__label" for="essay">Submitted text</label>
        <span class="count numeric" [class.is-short]="!d.meetsMinimum()" id="essay-count">
          {{ d.wordCount() | number }} words
          @if (!d.meetsMinimum()) {
            <span class="count__need">· {{ d.wordsShort() | number }} to go</span>
          }
        </span>
      </div>

      <textarea
        id="essay"
        class="textarea"
        spellcheck="false"
        placeholder="Paste the student's text here."
        [value]="d.text()"
        (input)="d.text.set(val($event))"
        aria-describedby="essay-count essay-hint"
      ></textarea>
      <span class="field__hint" id="essay-hint">
        Paste exactly what the student submitted. Do not tidy formatting: stray characters are part of the evidence.
      </span>

      <!-- Announce only the threshold crossing, not every keystroke. -->
      <p class="sr-only" aria-live="polite">
        @if (d.meetsMinimum()) { Minimum length reached. }
      </p>
    </div>

    <div
      class="drop"
      [class.is-over]="dragging()"
      (dragover)="onDragOver($event)"
      (dragleave)="dragging.set(false)"
      (drop)="onDrop($event)"
    >
      <p class="drop__title">Or drop a file</p>
      <p class="drop__hint">
        Plain text and Markdown are read here. Word documents are read in the hosted release.
      </p>
      <label class="btn btn--secondary drop__btn">
        Choose a file
        <input type="file" accept=".txt,.md,.docx,text/plain,text/markdown" (change)="onPick($event)" />
      </label>
      @if (notice(); as n) {
        <p class="drop__notice" [class.is-warn]="n.tone === 'warn'" role="status">{{ n.message }}</p>
      }
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    :host { display: grid; gap: var(--space-6); }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-4);
    }

    .count {
      font-size: var(--text-sm);
      color: var(--signal-low-ink);
      @include m.transition(color);
      &.is-short { color: var(--ink-muted); }
    }
    .count__need { color: var(--ink-faint); }

    .drop {
      display: grid;
      justify-items: start;
      gap: var(--space-2);
      padding: var(--space-5);
      border: 1px dashed var(--rule-strong);
      border-radius: var(--radius-sm);
      @include m.transition(background-color, border-color);

      &.is-over { background: var(--accent-wash); border-color: var(--accent); }
    }

    .drop__title { font-weight: var(--weight-semi); }
    .drop__hint { font-size: var(--text-sm); color: var(--ink-muted); }
    .drop__btn { margin-top: var(--space-2); }
    .drop__btn input { @include m.sr-only; }
    .drop__btn:has(input:focus-visible) { box-shadow: var(--focus-ring); }

    .drop__notice {
      font-size: var(--text-sm);
      color: var(--signal-low-ink);
      &.is-warn { color: var(--signal-mid-ink); }
    }
  `,
})
export class StepTextComponent {
  protected readonly d = inject(SubmissionDraft);
  protected readonly dragging = signal(false);
  protected readonly notice = signal<FileNotice>(null);
  protected readonly min = MIN_WORDS;

  protected val(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }

  protected onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) void this.read(file);
  }

  protected onPick(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.read(file);
    input.value = '';
  }

  // .docx is a zipped XML package and needs a parser; the hosted service
  // will handle it server-side. Until then, say so plainly.
  private async read(file: File): Promise<void> {
    const name = file.name.toLowerCase();
    if (name.endsWith('.docx')) {
      this.notice.set({ tone: 'warn', message: `“${file.name}” is a Word document. Open it, copy the text and paste it above.` });
      return;
    }
    if (!name.endsWith('.txt') && !name.endsWith('.md')) {
      this.notice.set({ tone: 'warn', message: 'Veritas reads .txt and .md files. Paste other formats as text.' });
      return;
    }
    this.d.text.set(await file.text());
    this.notice.set({ tone: 'ok', message: `Read “${file.name}”.` });
  }
}
