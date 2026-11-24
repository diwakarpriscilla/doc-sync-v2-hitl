# [Demo-5] Build & Local Deployment Guide

## Status

- **Session:** Demo-5
- **Environment:** Local workstation only
- **Local URL:** `http://localhost:3000`
- **Deployment mode:** Local verification only
- **Confluence publication:** Not performed until Step 8 approval

## Prerequisites

- Windows 10 or later
- Node.js 18 or later
- Git
- Repository dependencies installed locally

## Build

This repository does not require a separate compiled build. Validate the Node.js application and helper directly:

```powershell
npm run test:unit
npm run test:e2e
node docSync.js ./bookstore-web-app
node --check scripts\confluencePublisher.js
```

## Local deployment

1. Run `npm run test:unit`; all 10 Node tests must pass.
2. Run `npm run test:e2e`; all 8 Playwright tests must pass.
3. Run `node docSync.js ./bookstore-web-app`; verify the CLI exits successfully.
4. Confirm `.env` is ignored by Git and `node_modules/` is not tracked.
5. Start the local bookstore server:

```powershell
npm start --prefix bookstore-web-app
```

6. Open `http://localhost:3000/`.
7. Verify `GET http://localhost:3000/api/books`.
8. Stop the server with `Ctrl+C` after verification if it was started manually.

## Verification results

- 10 Node unit tests pass, 0 fail.
- 8 Playwright tests pass, 0 fail.
- `node docSync.js ./bookstore-web-app` exits successfully.
- The CLI scans 2 JavaScript files, updates the marker-bounded `API_DOCS.md`, and preserves `README.md` because it has no valid marker pair.
- `node --check scripts\confluencePublisher.js` passes.
- `.env` remains ignored and `node_modules/` remains excluded from Git.
- The live catalog is restored to 3 starter books after browser validation.

## Local stop and rollback

Stop the local server with `Ctrl+C`. No shared, staging, or production environment was modified. No live Confluence content was changed.
