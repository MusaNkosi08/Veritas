# Veritas

Academic Authorship Verification Suite. Angular 20, standalone components, signals, zoneless.

## Requirements

Node 20.19 or newer (`node -v` to check).

## Run it

```bash
npm install
npm start
```

Then open http://localhost:4200.

### Windows PowerShell: "running scripts is disabled"

PowerShell blocks `npm.ps1` by default. Either call the `.cmd` version directly:

```powershell
npm.cmd install
npm.cmd start
```

or allow signed scripts for your user once (no admin rights needed):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Build

```bash
npm run build
```

Output goes to `dist/veritas/browser`.

## First run

The archive starts empty. Use "Load three sample reports" on the Reports page
(or on Account) to see one report from each part of the spectrum, or commission
your own through Submit.

## Notes on the mock engine

- All heuristics live in `src/app/core/analysis/` as plain functions. Same input,
  same report.
- Reference bands are provisional and say so in every report.
- Draft velocity is simulated, labelled as such, and never feeds the verdict.
- Curly quotes, em dashes and similar autocorrect characters are listed but carry
  no weight. Hidden characters and leftover Markdown are weighted.
- Students who declare an additional language are held at Inconclusive unless a
  baseline is supplied; texts under 300 words are always Inconclusive.

## Swapping in the real backend

Replace the body of `AuthorshipAnalysisService.analyze()` with an
`HttpClient.post` call. Revive `submittedAt` and audit `at` fields into `Date`
objects, as `ReportStore` already does for localStorage.

## Structure

- `src/styles/` design tokens and mixins
- `src/app/core/` shell layout, routing, services, analysis heuristics
- `src/app/shared/` UI primitives used across features
- `src/app/features/` one folder per route
