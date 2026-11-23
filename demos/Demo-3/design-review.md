# [Demo-3] Architecture Design Review

## Review scope

Reviewed `demos/Demo-3/architecture.md` against `demos/Demo-3/requirements.md` and the selected project tree, with focus on security leaks, missing folders/files, and edge cases. No implementation exists for this CLI yet, so implementation behavior was not inferred.

## Summary

- **Confirmed security leaks:** None found in the reviewed architecture or requirements text.
- **Required target folder:** `bookstore-web-app/` exists and contains `server.js` plus nested `public/app.js`.
- **Missing documentation file:** `bookstore-web-app/API_DOCS.md` is not present in the current repository tree; the requirements require creating it.
- **Actionable open design questions:** Scan depth, existing documentation without markers, and exit-code behavior for missing/empty folders need decisions before implementation.

## Findings

### Minor — Scan depth is unresolved and the current target has nested JavaScript

- **Evidence:** `demos/Demo-3/requirements.md`, Open Question 1; `demos/Demo-3/architecture.md`, Source selection; repository files `bookstore-web-app/server.js` and `bookstore-web-app/public/app.js`.
- **Impact:** A direct-only scan would omit `public/app.js`, so JavaScript functions in the default project would not be considered.
- **Recommendation:** Decide whether to scan recursively before implementation. The architecture was updated to leave this choice explicitly unresolved rather than present direct-only scanning as approved.

### Minor — Existing documentation without valid markers has no approved repair behavior

- **Evidence:** `demos/Demo-3/requirements.md`, Assumptions and Open Question 2; `demos/Demo-3/architecture.md`, Existing documents without markers.
- **Impact:** Appending markers may change protected human-authored documents; skipping may leave documentation stale.
- **Recommendation:** Keep the safe no-overwrite behavior provisional and clarify whether to append a marked section or skip with a warning. The architecture now labels this as unresolved and says a skip must not be reported as a successful update.

### Info — Missing/empty-folder exit status is unspecified

- **Evidence:** `demos/Demo-3/requirements.md`, Functional requirement 10 and Acceptance Criterion 7; `demos/Demo-3/architecture.md`, Failure Handling.
- **Impact:** Automation cannot distinguish a valid empty scan from a missing target if both return success.
- **Recommendation:** Decide whether missing folders and empty folders should return different exit codes. The architecture now records the exit-code decision as open.

## Missing-folder and edge-case audit

- The selected `bookstore-web-app/` folder exists; its JavaScript includes a nested file under `public/`.
- `README.md` exists in the selected folder; `API_DOCS.md` is absent and is required to be created by the CLI.
- Requirements cover an empty or missing target, valid marker preservation, and secret redaction. Implementation tests should separately exercise invalid/missing marker pairs, files with no `.js` sources, and ensuring secrets never enter either generated files or console output.
- No confirmed secret value or credential leak was found in the reviewed architecture and requirements.

## Architecture changes made

Updated `demos/Demo-3/architecture.md` to:

1. Mark scan depth as unresolved and call out the nested `public/app.js` evidence.
2. Clarify that markerless existing documents are not overwritten and that the skip behavior is provisional, not an approved final policy.
3. Record exit-code behavior for missing/empty folders as an open decision.

## Conclusion

Architecture is aligned with the approved safety requirements on redaction, marker-bounded updates, creation of missing docs, and safe handling of missing/empty folders. Resolve the three open decisions above before implementation relies on those behaviors.
