import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Every tab reads "Section · Veritas". Screen readers announce the
 * document title on navigation, so this doubles as an a11y landmark.
 */
@Injectable()
export class VeritasTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} · Veritas` : 'Veritas · Writing Provenance');
  }
}
