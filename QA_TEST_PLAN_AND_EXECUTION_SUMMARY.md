# [Demo-4] QA Test Plan + Execution Summary

## Status

- **Session:** Demo-4
- **Step:** 7 — QA
- **Execution:** Complete with one automated failure
- **Publication:** Not performed
- **Scope:** Fixed-target documentation synchronization, CLI output, marker-bounded Markdown generation, secret redaction, generated HTML preview, and `resetDemo.js`.

## Reviewed inputs

- `REQUIREMENTS.md`
- `architecture.md`
- `design-review.md`
- `peer-code-review.md`
- `impl-plan.md`
- `package.json`
- `playwright.config.js`

## Test assets

- Demo-4 Gherkin scenarios: `demos/Demo-4/demo-4-qa.feature`
- Existing Gherkin inventory: `features/bookstore.feature`
- Demo-4 Playwright checks: `tests/e2e/demo4.spec.js`
- Existing unit suite: `tests/docSync.test.js`
- Existing Playwright checks: `tests/e2e/bookstore.spec.js` and `tests/e2e/demo3.spec.js`

All test cases are maintained in Gherkin feature files. Playwright and Node test files are executable automation for those behaviors.

## Scenarios and results

| Gherkin scenario / behavior | Evidence | Result |
| --- | --- | --- |
| Fixed target reports deterministic status and generated API docs | CLI scanned 2 JavaScript files and found 2 endpoints. `API_DOCS.md` listed `GET /api/books` and `POST /api/books`; the markerless README was reported blocked. | **Passed** |
| Custom target outside Demo-4 is rejected | `docSync.js` accepted a temporary custom target and returned status 0; no fixed-target rejection or sanitized scope error occurred. | **Failed** |
| Marked project preserves notes and creates missing docs | Temporary marked README preserved text before and after markers, retained the detected endpoint in generated Markdown, and API_DOCS was created. | **Passed** |
| Recognized secrets are absent from CLI and Markdown | Temporary source containing private DB, JWT, and API values produced no matching secret values in CLI or generated Markdown evidence. | **Passed** |
| Generated bookstore HTML preview displays the starter catalog | Browser test showed the Bookstore title and three starter catalog cards. | **Passed** |
| Reset restores catalog and preserves documentation | Reset restored three disk/UI books and left README/API_DOCS content unchanged. | **Passed** |

## Commands and execution

| Command | Result |
| --- | --- |
| `npm run test:unit` | **Passed** — 12 tests passed, 0 failed. |
| `node docSync.js ./bookstore-web-app` | **Passed** — scanned 2 JavaScript files, found 2 endpoints, blocked the markerless README, and left API_DOCS unchanged. |
| `npx playwright test tests/e2e/demo4.spec.js` | **5 passed, 1 failed** — the custom-target scope guard failed. |
| `npx playwright test` | **13 passed, 1 failed** across 14 existing and Demo-4 browser checks. |

## Failure details

### Custom target is accepted

- **Automated check:** `custom target outside Demo-4 is rejected`
- **Observed:** The CLI returned status 0 for a temporary folder and performed the sync outside `./bookstore-web-app`.
- **Expected:** A non-zero status and rejection of a target outside the fixed Demo-4 boundary.
- **Impact:** This confirms the Major architecture-scope finding in `peer-code-review.md`.
- **Remediation:** Enforce `./bookstore-web-app` or reject CLI target arguments, then add a passing regression check.

## Limitations

- The implementation does not render Markdown in the bookstore web UI; generated README/API_DOCS content was verified as files and via CLI/Markdown assertions.
- Atomic-write failure cleanup is implemented but no direct forced write/rename-failure test was added; this remains the Minor testing gap in `peer-code-review.md`.
- The fixed-target README currently lacks valid DOC-SYNC markers, so it is intentionally blocked and left unchanged.
- The custom-target check used a temporary fixture outside the repository for a negative scope check; no fixture implementation was retained.
- No Confluence publication was performed.
- This report records QA evidence only. No source implementation fixes were applied during Step 7.
