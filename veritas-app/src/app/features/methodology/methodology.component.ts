import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FORMULAIC_PHRASES } from '../../core/analysis/lexicon';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({
  selector: 'app-methodology',
  imports: [PageHeaderComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-page-header
        eyebrow="Methodology"
        title="What Veritas reads, and what it cannot know"
        lede="Veritas describes how a text was likely written. It does not decide who wrote it. Every report is evidence for a conversation, never a verdict on a student."
      />

      <div class="layout">
        <nav class="toc no-print" aria-label="On this page">
          <ol>
            <li><a routerLink="/methodology" fragment="scope">Scope</a></li>
            <li><a routerLink="/methodology" fragment="measures">The measures</a></li>
            <li><a routerLink="/methodology" fragment="artifacts">Typographic artifacts</a></li>
            <li><a routerLink="/methodology" fragment="verdict">How the verdict is placed</a></li>
            <li><a routerLink="/methodology" fragment="confidence">Confidence</a></li>
            <li><a routerLink="/methodology" fragment="risks">False-positive risks</a></li>
            <li><a routerLink="/methodology" fragment="use">Using a report</a></li>
          </ol>
        </nav>

        <article class="prose">
          <section id="scope">
            <h2>Scope</h2>
            <div class="columns">
              <div>
                <h3>What it does</h3>
                <ul class="dash">
                  <li>Measures how sentence length and word choice vary across the text.</li>
                  <li>Finds formatting traces that rarely appear in typed prose, such as hidden characters and leftover Markdown.</li>
                  <li>Compares the text with the student's earlier essays when you provide them.</li>
                  <li>States its own confidence, and says plainly when that confidence is too low to act on.</li>
                </ul>
              </div>
              <div>
                <h3>What it does not do</h3>
                <ul class="dash">
                  <li>It does not check for plagiarism or search for copied sources.</li>
                  <li>It does not prove that a text was written by AI. No tool can.</li>
                  <li>It does not identify a student, or store their student number.</li>
                  <li>It does not replace a conversation with the student about how they worked.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="measures">
            <h2>The measures</h2>
            <dl class="defs">
              <div>
                <dt>Burstiness</dt>
                <dd>How much sentence length varies. People tend to write a long sentence, then a short one. Unedited model output holds a steadier rhythm. Measured as the spread of sentence lengths relative to their average, so long and short texts compare fairly.</dd>
              </div>
              <div>
                <dt>Perplexity (proxy)</dt>
                <dd>True perplexity needs a language model. This release uses a stand-in: the share of words that fall outside a list of very common English words. It is the weakest measure in the report and carries only a tenth of the weight, because formal generated prose often uses uncommon academic vocabulary and reads as "unpredictable" by this test.</dd>
              </div>
              <div>
                <dt>Lexical density</dt>
                <dd>The share of words that carry meaning rather than grammar. Dense academic writing and generated text overlap heavily here, so it is shown for context and weighted at five per cent.</dd>
              </div>
              <div>
                <dt>Formulaic phrasing</dt>
                <dd>How often stock phrases appear per thousand words. Each is innocent alone; a dense cluster is a pattern. The full list is published below so that anyone can check a count by hand.</dd>
              </div>
              <div>
                <dt>Function-word profile against baseline</dt>
                <dd>How the student uses small words such as <em>the</em>, <em>of</em>, <em>but</em> and <em>which</em>. These habits are unconscious and stable, which makes them one of the most reliable fingerprints a writer has. Only measured when earlier essays are supplied.</dd>
              </div>
            </dl>
            <details class="phrases">
              <summary>The formulaic phrase list</summary>
              <p class="phrase-list">
                @for (p of phrases; track p) { <code>{{ p }}</code> }
              </p>
            </details>
            <p class="aside">
              Reference ranges in this release are provisional. They describe typical behaviour of
              each measure but have not yet been calibrated against a labelled corpus of student
              writing. Every report says so.
            </p>
          </section>

          <section id="artifacts">
            <h2>Typographic artifacts</h2>
            <p>
              Some characters are left behind by the tools a text passed through. Veritas sorts
              them into two groups, and the distinction matters more than any count.
            </p>
            <div class="columns">
              <div>
                <h3>Worth a conversation</h3>
                <p>Zero-width characters, Markdown bold and heading syntax, and literal bullet glyphs. Keyboards and word processors rarely produce these. They usually arrive with text copied from a chat interface, though a student who drafts in a Markdown editor will produce them honestly.</p>
              </div>
              <div>
                <h3>Usually autocorrect</h3>
                <p>Curly quotes, em and en dashes, and the single-character ellipsis. Word, Google Docs and macOS insert these by default. They are listed for completeness and carry no weight in the verdict.</p>
              </div>
            </div>
          </section>

          <section id="verdict">
            <h2>How the verdict is placed</h2>
            <p>
              Each measure leans somewhere between 0 (typical of human drafting) and 1 (typical of
              generated text). The leans are combined using fixed, published weights, and the
              result places a marker on the spectrum. Below 0.38 reads as a verified process; above
              0.62 reads as patterns consistent with generation. Everything between is
              inconclusive, and the middle band is deliberately wide.
            </p>
            <p>Two rules override the calculation and hold the marker at Inconclusive:</p>
            <ul class="dash">
              <li>The text is under 300 words.</li>
              <li>The student has declared an additional language and no baseline was supplied.</li>
            </ul>
            <p>When either applies, the report says so and shows the unadjusted reading alongside.</p>
          </section>

          <section id="confidence">
            <h2>Confidence</h2>
            <p>
              Confidence describes the evidence, not the verdict. It rises with text length and with
              each earlier essay supplied, and falls when the student writes in an additional
              language. Any text under 500 words is rated Low. A Low rating means the report must
              not be used for disciplinary action, whatever its verdict.
            </p>
          </section>

          <section id="risks" class="caution">
            <h2>Known false-positive risks</h2>
            <p>
              <strong>Students writing in an additional language</strong> often use a narrower,
              safer vocabulary and a steadier sentence rhythm. Those are exactly the features
              statistical readers associate with generated text. Published studies of commercial
              detectors have found them flagging non-native writers at far higher rates than native
              speakers.
            </p>
            <p>
              <strong>Many neurodivergent students</strong>, including some autistic writers and
              some with ADHD or dyslexia, write in regular, structured patterns or rely on templates
              and assistive tools that produce the same surface features.
            </p>
            <p>
              <strong>Students taught formulaic structures</strong>, such as five-paragraph essays or
              exam frameworks, will score higher on formulaic phrasing because they were taught to.
            </p>
            <p>
              Veritas cannot tell these students apart from generated text on statistics alone. A
              baseline of their own earlier writing is the best protection, which is why reports
              without one are rated lower in confidence.
            </p>
          </section>

          <section id="use">
            <h2>Using a report</h2>
            <ol class="numbered">
              <li>Read the confidence rating and warnings before the verdict.</li>
              <li>Treat Inconclusive as the normal case, not a failure of the tool.</li>
              <li>Where a conversation is recommended, ask the student to walk you through their notes, drafts and sources. Most questions are settled there.</li>
              <li>Record what was discussed in the report's audit trail.</li>
              <li>Never use a single report, or a single score, as the basis for disciplinary action.</li>
            </ol>
            <p><a routerLink="/submit">Commission a report</a></p>
          </section>
        </article>
      </div>
    </div>
  `,
  styles: `
    @use 'styles/mixins' as m;

    .layout {
      display: grid;
      grid-template-columns: 13rem 1fr;
      gap: var(--space-8);
      align-items: start;
      @media (max-width: 860px) { grid-template-columns: 1fr; gap: var(--space-5); }
    }

    .toc {
      position: sticky;
      top: var(--space-5);
      ol { list-style: none; padding: 0; border-top: var(--hairline); }
      li { border-bottom: var(--hairline); }
      a {
        display: block;
        padding: var(--space-2) 0;
        font-size: var(--text-sm);
        color: var(--ink-muted);
        text-decoration: none;
        &:hover { color: var(--ink); }
      }
      @media (max-width: 860px) { position: static; }
    }

    .prose {
      display: grid;
      gap: var(--space-8);
      max-width: 46rem;

      section { display: grid; gap: var(--space-4); scroll-margin-top: var(--space-5); }
      h2 { font-size: var(--text-xl); padding-bottom: var(--space-3); border-bottom: var(--hairline); }
      h3 { font-size: var(--text-md); margin-bottom: var(--space-2); }
      p { color: var(--ink); }
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: var(--space-6);
      p { color: var(--ink-muted); }
    }

    .dash {
      list-style: none;
      padding: 0;
      display: grid;
      gap: var(--space-2);
      li {
        position: relative;
        padding-left: var(--space-5);
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.8em;
          width: var(--space-3);
          height: 1px;
          background: var(--accent);
        }
      }
    }

    .defs {
      display: grid;
      border-top: var(--hairline);
      div {
        display: grid;
        grid-template-columns: 12rem 1fr;
        gap: var(--space-4);
        padding-block: var(--space-4);
        border-bottom: var(--hairline);
        @media (max-width: 600px) { grid-template-columns: 1fr; gap: var(--space-1); }
      }
      dt { font-weight: var(--weight-semi); }
      dd { margin: 0; color: var(--ink-muted); }
    }

    .phrases summary { cursor: pointer; color: var(--accent); font-weight: var(--weight-medium); @include m.focus-visible; }
    .phrase-list { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); max-width: none; }

    .aside { font-size: var(--text-sm); color: var(--ink-faint) !important; }

    .caution {
      padding: var(--space-5) var(--space-6);
      background: var(--signal-mid-wash);
      border-left: 2px solid var(--signal-mid);
      h2 { border-bottom-color: var(--signal-mid); }
    }

    .numbered {
      padding-left: var(--space-5);
      display: grid;
      gap: var(--space-2);
      li::marker { color: var(--accent); font-variant-numeric: tabular-nums; }
    }
  `,
})
export class MethodologyComponent {
  protected readonly phrases = FORMULAIC_PHRASES.map((p) => p.replace(/,$/, ''));
}
