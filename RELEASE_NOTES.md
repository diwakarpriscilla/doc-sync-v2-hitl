# [Demo-5] Release Notes

## Release summary

This release adds and validates the Automated Documentation Sync pipeline and Bookstore demo behavior:

- Recursive JavaScript discovery, deterministic function/endpoint extraction, secret redaction, marker-bounded Markdown updates, and clear CLI reporting;
- Bookstore title, author, and category search;
- Validated Add Book behavior with persistent catalog updates;
- API validation for required fields and isolated reset behavior;
- Unit and Playwright coverage;
- A Node.js Confluence publisher with an explicit `--approved` publication guard.

## Scope

- **Local deployment:** `http://localhost:3000`
- **Repository session:** Demo-5
- **Shared, staging, or production deployment:** Not performed
- **Confluence publication:** Not performed
- **Git publication:** Not performed at preview time

## Validation

- 10 Node unit tests pass, 0 fail.
- 8 Playwright tests pass, 0 fail.
- `node docSync.js ./bookstore-web-app` succeeds.
- The live catalog is restored to 3 starter books after browser validation.
- `scripts/confluencePublisher.js` passes Node.js syntax validation.
- Publication without `--approved` is blocked.
- `.env` is confirmed as Git-ignored.
- `node_modules/` is excluded from Git.

## Known limitations

- `README.md` in `bookstore-web-app` has no valid DOC-SYNC marker pair; the CLI preserves and skips it.
- Live Confluence publication has not been executed.
- No shared or production environment was modified.
- Automated browser checks use the local Playwright web server and temporary reset fixtures.

## Deployment notes

Use the Build & Local Deployment Guide. Live deployment or Confluence publication is prohibited until the corresponding human approval checkpoint.
