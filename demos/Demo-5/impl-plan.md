# [Demo-5] Implementation Plan

## Scope

1. Implement the documentation-sync CLI described by the approved root requirements.
2. Complete the Search and Add Book UI updates in the bookstore web app.
3. Preserve human-authored documentation and redact sensitive values.
4. Run focused unit, browser, and documentation-sync validation.

## Dependency order

### 1. Baseline and test contract

- Confirm the existing `docSync.js`, bookstore UI, API, reset script, and tests are the implementation baseline.
- Keep any behavior already covered by `tests/docSync.test.js` unless the implementation is incomplete or inconsistent.
- Add focused tests only for behavior not already verified.

### 2. Documentation-sync CLI

- In `docSync.js`, preserve recursive `.js` discovery, sorted paths, exported/JSDoc function extraction, supported HTTP endpoint extraction, and secret redaction.
- Preserve marker-bounded updates for `README.md` and `API_DOCS.md`.
- Preserve missing-document creation, markerless-document skipping, clear missing-target errors, atomic writes, and deterministic console reporting.
- Do not change credential handling or external Confluence behavior in this CLI step.

### 3. Search UI

- Verify `bookstore-web-app/public/index.html`, `app.js`, and `styles.css` provide an accessible search control.
- Keep filtering case-insensitive across title, author, and category.
- Preserve the current search result while adding a book or reloading the catalog.
- Add or adjust Playwright assertions only if the current UI leaves Search behavior untested.

### 4. Add Book UI and API

- Verify `POST /api/books` validates required title, author, and category values and optional `isNewArrival`.
- Preserve atomic persistence to `bookstore-web-app/data/books.json`.
- Verify the form posts JSON, clears on success, reports clear validation/API errors, and refreshes the catalog.
- Preserve catalog state and avoid unrelated visual or baseline changes.

### 5. Reset behavior

- Preserve `resetDemo.js` as a targeted reset of the three starter books.
- Keep documentation files and unrelated repository files unchanged during reset.
- Retain Playwright coverage that proves reset isolation and does not run automatically during normal browser tests.

### 6. Verification

- Run `node --test tests/docSync.test.js tests/confluencePublisher.test.js`.
- Run `node docSync.js ./bookstore-web-app`.
- Run the smallest relevant Playwright suite for Search and Add Book behavior.
- Inspect generated documentation for secret absence and marker preservation.
- Confirm there are no unrelated tracked changes.

## Files expected to change

- `docSync.js` - documentation-sync fixes or corrections, if verification identifies them.
- `bookstore-web-app/public/index.html` - Search and Add Book markup, only if required.
- `bookstore-web-app/public/app.js` - filtering and Add Book behavior, only if required.
- `bookstore-web-app/public/styles.css` - Search/Add Book presentation, only if required.
- `bookstore-web-app/server.js` - catalog API validation or persistence, only if required.
- `tests/docSync.test.js` - focused regression coverage, only if a requirement gap exists.
- `tests/e2e/bookstore.spec.js` - Search and Add Book browser coverage, only if required.
- `features/bookstore.feature` - scenario coverage, only if required.
- `demos/Demo-5/impl-plan.md` - this implementation plan.
- Generated marker content in `bookstore-web-app/README.md` and `bookstore-web-app/API_DOCS.md` may change only when running the CLI.

## Acceptance checkpoints

1. `node docSync.js ./bookstore-web-app` exits successfully and reports recursive files and updated/skipped document sections.
2. `API_DOCS.md` remains marker-bounded and contains supported endpoints.
3. `README.md` remains marker-safe and human-authored content remains unchanged.
4. Secret values do not appear in generated documentation or CLI output.
5. Search filters title, author, and category and reports the result count.
6. Add Book validates required fields, persists valid books, refreshes the catalog, and reports errors without losing the search query.
7. Unit and browser checks pass for the implemented behavior.
