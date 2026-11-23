# [Demo-3] Implementation Plan

## Scope

1. Implement `docSync.js` for the approved documentation-sync requirements.
2. Extend the bookstore UI with search and an Add Book form backed by the local books API.
3. Add automated unit and browser coverage and run the CLI against `./bookstore-web-app`.

## Implementation decisions

- **Recursive scan:** Search the selected folder and its subfolders for `.js` files, excluding dependency and VCS directories. The default project has `public/app.js`, so direct-only scanning would omit relevant source.
- **Generated functions:** Include exported named functions and named functions with JSDoc. Include JSDoc summary, `@param` name/type, and `@returns` text when present.
- **Endpoint output:** Record supported HTTP method, literal route path, source file, and handler context when statically recognizable. Sort output deterministically.
- **Markerless existing docs:** Preserve the entire existing file, skip its generated section, and print a warning. A missing file is created with a starter title and marker pair. Do not silently add markers to an existing human-authored file.
- **Target-folder outcomes:** A missing or unreadable folder prints a sanitized error and exits nonzero. An existing folder with no JavaScript files prints a clear empty-scan report and exits successfully; missing docs can still be initialized.
- **Writes:** Finish scanning and generation before writes. Write each document through a temporary file and atomic rename.
- **Search and Add Book UI:** Keep search case-insensitive across title, author, and category. Add a form for title, author, and category; submit to `POST /api/books`, validate server-side, persist to `data/books.json`, and refresh the visible catalog without losing the search query.
- **Add-book validation:** Require non-empty title, author, and category with reasonable length limits. Return clear JSON validation errors; do not write invalid data.

## Files and tests

- `docSync.js` — recursive scanner, extraction, redaction, deterministic Markdown, marker-safe document updates, and console report.
- `bookstore-web-app/server.js` — validated catalog POST endpoint and safe persistence.
- `bookstore-web-app/public/index.html`, `public/app.js`, `public/styles.css` — accessible Add Book form and maintained search UI.
- `tests/docSync.test.js` — scanner, marker preservation, redaction, missing/empty targets, and deterministic output.
- `tests/e2e/bookstore.spec.js` and `features/bookstore.feature` — browser tests for search, add, and validation.

## Validation

1. Run `node --test tests/docSync.test.js`.
2. Run the Playwright browser suite against the configured local server.
3. Run `node docSync.js ./bookstore-web-app`; confirm it reports the recursive scan, creates `API_DOCS.md`, preserves the existing markerless `README.md`, and emits no secret values.
