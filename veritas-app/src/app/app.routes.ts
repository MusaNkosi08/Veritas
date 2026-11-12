import { Routes } from '@angular/router';

// Every feature is lazy. A professor opening a single shared report
// link should not download the submission wizard.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reports' },
  {
    path: 'submit',
    title: 'Submit',
    loadComponent: () =>
      import('./features/submit/submit-wizard.component').then((m) => m.SubmitWizardComponent),
  },
  {
    path: 'reports',
    title: 'Reports',
    loadComponent: () =>
      import('./features/reports/reports-dashboard.component').then(
        (m) => m.ReportsDashboardComponent,
      ),
  },
  {
    path: 'reports/:id',
    title: 'Provenance Report',
    loadComponent: () =>
      import('./features/reports/report-detail/report-detail.component').then(
        (m) => m.ReportDetailComponent,
      ),
  },
  {
    path: 'methodology',
    title: 'Methodology',
    loadComponent: () =>
      import('./features/methodology/methodology.component').then((m) => m.MethodologyComponent),
  },
  {
    path: 'account',
    title: 'Account',
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent),
  },
  {
    path: '**',
    title: 'Not found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
