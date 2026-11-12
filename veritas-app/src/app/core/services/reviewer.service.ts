import { Injectable, effect, signal } from '@angular/core';

const KEY = 'veritas.reviewer.v1';

/**
 * Who is signing the audit trail. Single-reviewer mode keeps this in the
 * browser; institutional sign-in will replace it with a real identity.
 */
@Injectable({ providedIn: 'root' })
export class ReviewerService {
  readonly name = signal<string>(read() ?? 'Course reviewer');

  constructor() {
    effect(() => {
      try {
        globalThis.localStorage?.setItem(KEY, this.name());
      } catch {
        // Not fatal: the name simply resets next visit.
      }
    });
  }
}

function read(): string | null {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? null;
  } catch {
    return null;
  }
}
