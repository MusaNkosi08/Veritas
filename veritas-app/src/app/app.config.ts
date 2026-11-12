import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { VeritasTitleStrategy } from './core/routing/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Signals drive every view, so zone.js is dead weight.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Lets /reports/:id arrive as a component input rather than an ActivatedRoute subscription.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Cross-fade between pages. Browsers without the API simply swap.
      withViewTransitions({ skipInitialTransition: true }),
    ),
    // Ready for the real backend; the mock service arrives in Step 2.
    provideHttpClient(withFetch()),
    { provide: TitleStrategy, useClass: VeritasTitleStrategy },
  ],
};
