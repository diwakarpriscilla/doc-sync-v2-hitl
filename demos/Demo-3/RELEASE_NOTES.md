# [Demo-3] Release Notes

## Status

- **Release scope:** Demo-3 documentation sync CLI and bookstore enhancements
- **Deployment mode:** Local verification only
- **Local URL:** `http://localhost:3000`
- **Release state:** **Not release-ready**

## Summary

The repository contains local Demo-3 implementation and test artifacts for:

- Recursive JavaScript discovery and documentation sync behavior in `docSync.js`
- Marker-preserving updates for generated documentation
- Secret-redaction checks
- Bookstore homepage, catalog search, Add Book flow, and API validation
- Local Mermaid-to-SVG rendering and Confluence attachment embedding for architecture diagrams
- Unit and Playwright test coverage

The local bookstore server was started successfully on port 3000. The homepage, catalog API, unit suite, and focused bookstore browser suite all passed in the current repository state.

## Verified behavior

| Area | Result |
|---|---|
| Homepage | HTTP 200 with HTML content |
| Catalog API | `GET /api/books` returned 3 starter books |
| Unit tests | 11 passed, 0 failed, including Mermaid SVG rendering and attachment handling |
| Bookstore browser/API tests | 4 passed, 0 failed |
| Catalog after browser checks | Three starter books remained |

Commands verified:

- `npm run test:unit`
- `npx puppeteer browsers install chrome-headless-shell` (local renderer setup when npm install scripts are blocked)
- `npx playwright test tests/e2e/bookstore.spec.js`
- `npm start --prefix bookstore-web-app`
- `Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing`
- `Invoke-RestMethod -Uri 'http://localhost:3000/api/books'`

## Prior Step-5 code-review blocker

**Blocker — secret redaction:** `docSync.js:15-18` does not redact quoted object keys such as `"DB_PASSWORD": "value"`. A full probe confirmed that the source value can be written into generated API documentation. This requirement gap remains unresolved and must be fixed before release.

## Other open findings

- **Major:** false route association can produce a route by looking across adjacent condition blocks.
- **Major:** CommonJS named function assignments such as `exports.lookup = function lookup(...)` are not extracted.
- **Major:** markerless existing README handling can return success despite skipping the required update.
- **Test coverage:** add regressions for quoted-key redaction, cross-block routes, CommonJS export extraction, and nonzero skipped-document outcomes.
- **Dependency audit:** the latest install-time audit reported 0 vulnerabilities across 196 packages. This does not resolve the application-level findings above.

The quoted-key redaction, route-pairing, CommonJS extraction, and markerless-document findings remain unresolved.

## Confluence architecture diagrams

The publisher now renders Mermaid fenced blocks locally as SVG, uploads the images as Confluence page attachments, and embeds them in storage-format XHTML. Publication remains approval-gated; the updated `[Demo-3]` Architecture page has not been republished.

## Deployment and publication status

- Deployed locally only.
- No Confluence write was performed.
- User-confirmed commit `897ea6c` is on local `main`; `demo-baseline` points to it.
- Local `main` is five commits ahead of `origin/main`.
- Follow-up deployment/release document and publisher test changes remain uncommitted.
- No push, pull request, or merge was performed.
- No merge was performed.
- The server process remains available at `http://localhost:3000`.

## Release recommendation

Do **not** mark this change release-ready until the Blocker and Major findings are corrected and the relevant regressions pass. This document describes verified local behavior only.
