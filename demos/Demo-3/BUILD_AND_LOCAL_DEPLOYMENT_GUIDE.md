# [Demo-3] Build & Local Deployment Guide

## Status

- **Step:** 6 — Local deployment
- **Environment:** Local workstation only
- **Server URL:** `http://localhost:3000`
- **Deployment status:** Local server started and verified
- **Release status:** **Not release-ready** because the prior Step-5 code-review Blocker remains unresolved

## Repository state

The repository currently has working-tree changes and untracked Demo-3 implementation/test artifacts. The active branch was `main`. These artifacts include implementation and review files under `demos/Demo-3/` and the existing modified bookstore application files. No unrelated files were overwritten for this step.

## Build and verification

This Node application does not declare a separate build step. The server is a dependency-light Node process in `bookstore-web-app/server.js`.

| Check | Command | Verified result |
|---|---|---|
| Unit tests | `npm run test:unit` | Passed: 10 tests passed, 0 failed, including Mermaid-to-SVG rendering |
| Bookstore browser/API tests | `npx playwright test tests/e2e/bookstore.spec.js` | Passed: 4 tests passed, 0 failed in 19.2 seconds |
| Port check | PowerShell `Get-NetTCPConnection -LocalPort 3000 -State Listen` | Port 3000 was free before startup |
| Local server start | `npm start --prefix bookstore-web-app` | Started: `Bookstore web app listening at http://localhost:3000` |
| Homepage readiness | `Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing` | HTTP 200; `text/html; charset=utf-8` |
| Catalog readiness | `Invoke-RestMethod -Uri 'http://localhost:3000/api/books'` | HTTP/API response returned 3 starter books |

The Playwright configuration will reuse an existing local server and otherwise start `npm start --prefix bookstore-web-app`.

## Local deployment procedure

1. From the repository root, confirm port 3000 is available:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
   ```
2. If port 3000 is free, start the local server:
   ```powershell
   npm start --prefix bookstore-web-app
   ```
3. Open `http://localhost:3000/`.
4. Verify the API:
   ```powershell
   Invoke-RestMethod -Uri 'http://localhost:3000/api/books'
   ```
5. Stop the server after verification only if this local process was started for this deployment.

No shared, staging, or production deployment was performed.

## Mermaid-to-Confluence diagrams

- Mermaid rendering uses the local `@mermaid-js/mermaid-cli` dependency; diagram source is not sent to an external rendering service.
- Ensure Puppeteer's `chrome-headless-shell` browser is installed. On workstations where npm install scripts are blocked, run:
  ```powershell
  npx puppeteer browsers install chrome-headless-shell
  ```
- `scripts/confluencePublisher.js` renders Mermaid code fences to SVG, uploads them as page attachments, and embeds them in Confluence storage XHTML. The publisher still requires explicit publication approval and the `--approved` flag.

## Operational observations

- Root homepage: HTTP 200.
- `GET /api/books`: returns the three starter catalog entries.
- Search and Add Book browser checks passed.
- API validation rejects missing required fields.
- The catalog remains at 3 starter entries after the focused Playwright run.
- The server process was left running after verification.

## Open findings from the prior Step-5 code review

The implementation is locally functional, but the following findings prevent release-ready status:

1. **Blocker — quoted secret-key redaction leak:** `docSync.js:15-18` does not redact quoted object keys such as `"DB_PASSWORD": "value"`; a full CLI probe confirmed possible source-value leakage into `API_DOCS.md`.
2. **Major — route pairing:** `docSync.js:130-148` can associate unrelated adjacent condition blocks across an arbitrary 200-character lookahead, producing an incorrect route such as `GET /write`.
3. **Major — CommonJS export extraction:** `docSync.js:90-104` misses named functions assigned through forms such as `exports.lookup = function lookup(...)`.
4. **Major — markerless README exit status:** `docSync.js:277,293` may return exit code 0 after skipping a markerless existing README, so automation cannot distinguish incomplete synchronization from success.
5. **Test coverage gap:** The passing suite does not cover the quoted-key leak, cross-block route pairing, `exports.name = function` extraction, or nonzero status for skipped docs.
6. **Dependency and security follow-up:** The dependency review found no runtime dependencies and identified `@playwright/test@1.65.1` as development-only, but a fresh package advisory audit was not run.

These findings require implementation fixes and regression checks before the release could be considered ready. No fixes were applied in Step 6.
