# [Demo-4] Release Notes

## Release summary

Demo-4 provides a human-in-the-loop documentation synchronization workflow for the `./bookstore-web-app` target.

Implemented and verified behavior includes:

- Recursive JavaScript discovery with `.git` and `node_modules` excluded.
- Detection of `GET`, `POST`, `PUT`, and `DELETE` HTTP routes.
- Detection of exported and JSDoc-documented JavaScript functions.
- Deterministic README and API documentation rendering.
- Automatic creation of missing README and API documentation files.
- Marker-bounded updates that preserve manual text outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`.
- `[REDACTED]` handling for recognized `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` values.
- `created`, `updated`, `unchanged`, and `blocked` result reporting.
- Unit and Playwright coverage for discovery, marker behavior, redaction, reset behavior, and browser preview.

## Validation summary

- `npm run test:unit`: 12 passed, 0 failed.
- Fixed-target CLI: 2 JavaScript files scanned; 2 endpoints found; `README.md` blocked; `API_DOCS.md` unchanged.
- Demo-4 Playwright run: 5 passed, 1 failed.
- Full Playwright run: 13 passed, 1 failed across 14 checks.
- Marker, redaction, missing-document creation, reset, and bookstore HTML preview probes passed.

The one automated failure confirms that the CLI accepts custom target arguments. The peer review identified this as a Major scope issue. It remains an open limitation and is not reported as resolved.

## Known limitations

- The fixed `./bookstore-web-app` boundary is not enforced by rejecting custom CLI target arguments.
- The fixed-target `README.md` currently lacks a complete DOC-SYNC marker pair and is therefore blocked.
- Atomic write/rename cleanup is implemented but lacks a direct forced-failure test.
- Markdown is not rendered into the bookstore web UI; generated documentation is verified through CLI and file assertions.
- Live Confluence publication and merge status are not represented as successful until separately approved and confirmed.

## Deployment and release

Use `BUILD_AND_LOCAL_DEPLOYMENT_GUIDE.md` for the local-only procedure. The repository deploys no shared or production service in this workflow.

External release actions—Confluence publication, branch creation, commit, push, pull request creation, and merge—remain approval-gated and require separate explicit confirmation.
