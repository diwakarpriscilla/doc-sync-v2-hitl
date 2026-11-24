# [Demo-4] Architecture Design Review

## Review scope

Reviewed the repository-root `REQUIREMENTS.md` (the approved Demo-4 requirements; filename is uppercase on this repository) and repository-root `architecture.md` against the Demo-4 scope, Mermaid diagrams, interfaces, failure handling, and repository evidence. The review covered requirements traceability, target and file boundaries, marker preservation, secret handling, deterministic output, status reporting, testability, and edge cases.

The matching root architecture is the active Demo-4 design. Repository evidence reviewed includes `docSync.js`, `tests/docSync.test.js`, `package.json`, and the `bookstore-web-app/` tree.

## Summary

- Requirements generally map to the architecture: fixed target, recursive `.js` discovery exclusions, supported routes/functions, marker-based writes, redaction, deterministic rendering, and safe failure behavior are represented.
- One blocker-level ambiguity remains resolved through the minimal architecture correction below: unchanged results require byte/content comparison rather than reporting every rewrite as `updated`.
- One minor gap remains open: the requirements do not define an exact set of all password/API-key patterns beyond recognized assignments. The architecture now names the repository's existing configured secret names while avoiding an invented broader pattern.
- No confirmed credential leak was found in the requirements or architecture text.

## Findings

### Blocker — Unchanged status lacked an implementation-independent detection rule

- **Evidence:** `REQUIREMENTS.md`, Functional requirement 15 and Acceptance criterion 6; `architecture.md`, `Deterministic rendering`, `Explicit status reporting`, and `Repeated unchanged scans` in Failure handling.
- **Impact:** A design that says unchanged content is possible but does not define when unchanged is detected cannot guarantee deterministic no-change behavior or prevent unnecessary rewrites.
- **Recommendation:** Compare the final valid marker section with the generated content; report `unchanged` and skip the write only when it is byte-identical. Preserve `created`, `updated`, and `blocked` for the other states.
- **Disposition:** Corrected in `architecture.md` under Design decisions.

### Minor — README/API_DOCS content responsibilities were implicit

- **Evidence:** `REQUIREMENTS.md`, Functional requirements 5-8; `architecture.md`, Component diagram, Interfaces, and generated marker-content descriptions.
- **Impact:** The architecture did not explicitly distinguish README's API overview from API_DOCS's endpoint/function tables, so an implementer could omit required README or detailed API content.
- **Recommendation:** State the README and API_DOCS output shape explicitly.
- **Disposition:** Corrected in `architecture.md` under Design decisions.

### Minor — Secret-name coverage was too generic for auditable traceability

- **Evidence:** `REQUIREMENTS.md`, Functional requirements 12-13 and Assumptions; `architecture.md`, Secret-safe output and redaction data flow.
- **Impact:** "Recognized" assignments could be interpreted differently unless the repository's configured names are identified.
- **Recommendation:** Bind the design to the repository's existing `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` detection names, while preserving the names and redacting only values.
- **Disposition:** Corrected in `architecture.md` under Design decisions.

### Info — Existing blocked-document and status vocabulary should remain exact

- **Evidence:** `REQUIREMENTS.md`, Functional requirement 15 and marker requirements; `architecture.md`, missing/duplicate/reversed marker handling.
- **Impact:** The prior `blocked/skipped` combined label was less explicit than the requirements' `blocked` status.
- **Recommendation:** Use `blocked` for marker-invalid existing files and retain `skipped` only as prose for the no-write action if needed.
- **Disposition:** Corrected in `architecture.md` under Design decisions.

## Repository evidence verification

- `docSync.js` defines `DEFAULT_TARGET` as `./bookstore-web-app`, recursively discovers `.js` files, excludes `.git` and `node_modules`, extracts supported routes and functions, and uses marker-bounded rendering.
- `docSync.js` uses `[REDACTED]` for configured secret assignments and an atomic temporary-file write followed by rename.
- `tests/docSync.test.js` exercises discovery/exclusion, marker preservation, missing markers, file creation, redaction, and missing targets.
- The existing implementation currently does not distinguish unchanged marked content; this is a testability/status gap rather than evidence to expand Step 3 scope or implement it.

## Open questions

1. Should future secret recognition add names beyond `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`, or should those remain the configured recognized set for Demo-4?
2. Is there any source syntax for routes or functions not covered by the existing architecture that must be considered in implementation acceptance?

## Conclusion

The architecture is aligned with the Demo-4 requirements after minimal corrections to status semantics, README/API_DOCS responsibilities, secret-name traceability, and exact blocked-status terminology. No additional architecture blockers are found. Step 3 is complete; implementation remains out of scope.
