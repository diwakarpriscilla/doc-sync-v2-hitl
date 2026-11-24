# [Demo-4] Build & Local Deployment Guide

## Scope

This guide describes local validation and local deployment of the Demo-4 automated documentation synchronization workflow in the `doc-sync-v2-hitl` repository. It does not authorize Confluence publication, a Git commit or push, a pull request, or merge.

The fixed Demo-4 target is `./bookstore-web-app`. The workflow discovers JavaScript source files, excludes `.git` and `node_modules`, extracts supported HTTP routes and JavaScript functions, redacts recognized secret values, and updates only valid `DOC-SYNC` marker sections.

## Prerequisites

- Windows 10 or later
- Node.js 18 or later
- npm
- Git
- Playwright Chromium browser
- Repository dependencies installed from `package-lock.json`
- `.env` kept locally and excluded by Git for any Confluence command

## Build

Demo-4 has no compiled application build. Install dependencies and validate repository syntax and test behavior:

```powershell
npm install
npm run test:unit
node --check docSync.js
node --check resetDemo.js
node --check scripts/confluencePublisher.js
node docSync.js ./bookstore-web-app
```

The unit command runs Node's test runner for `tests/docSync.test.js` and `tests/confluencePublisher.test.js`.

## Local deployment

The local deployment target is the repository's `./bookstore-web-app` folder. Deploy locally by running the sync CLI:

```powershell
node docSync.js ./bookstore-web-app
```

Inspect the resulting status report and these files:

- `bookstore-web-app/README.md`
- `bookstore-web-app/API_DOCS.md`

The fixed-target validation environment produced:

- 2 JavaScript files scanned
- 2 supported endpoints: `GET /api/books` and `POST /api/books`
- 0 JavaScript functions
- `README.md`: blocked because the file lacks a valid `DOC-SYNC` marker pair
- `API_DOCS.md`: unchanged

`README.md` is intentionally preserved and not overwritten when its marker pair is invalid. `API_DOCS.md` remains unchanged when generated marker content is byte-identical.

## Verification

Run unit and browser validation from the repository root:

```powershell
npm run test:unit
npx playwright test tests/e2e/demo4.spec.js
```

Verified evidence:

- Unit suite: 12 passed, 0 failed.
- Demo-4 Playwright execution: 5 passed, 1 failed.
- Full Playwright suite: 13 passed, 1 failed across 14 checks.
- The generated API documentation contains `GET /api/books` and `POST /api/books`.
- Known `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` values were redacted as `[REDACTED]`.
- Temporary-folder marker probes preserved text outside the marker pair and created missing API documentation.
- Reset behavior restored starter catalog data and left documentation unchanged.

The remaining automated failure is the custom-target scope guard: `docSync.js` currently accepts a target argument instead of enforcing or rejecting targets outside `./bookstore-web-app`. This matches the Major scope finding in `peer-code-review.md` and is not treated as a successful release gate.

## Start and stop locally

For the browser preview, use the repository's existing Playwright configuration or serve the static app according to local repository instructions. Stop any local preview process with `Ctrl+C`.

The sync CLI does not start a shared or production service. Its local deployment modifies only documentation under `./bookstore-web-app` and only between valid DOC-SYNC markers.

## Rollback

Stop the sync CLI and any local preview process. Restore only repository documentation or test state using Git or the reviewed repository reset workflow. Do not restore secrets or overwrite `.env` or `node_modules/`.

No Confluence publication, remote deployment, Git branch or commit, push, or pull request is performed by this guide.
