# [Demo-3] QA Test Plan + Execution Summary

## Status

- **Step:** 5 — QA
- **Execution:** Complete
- **Browser mode:** Headed (`--headed`)
- **Publication:** Not performed
- **Scope:** Demo-3 documentation sync CLI, generated Markdown files, bookstore HTML page, Search & Add Book flow, and `resetDemo.js`.

## Test assets

- Gherkin scenarios: `demos/Demo-3/demo-3-qa.feature`
- Existing bookstore Gherkin scenarios: `features/bookstore.feature`
- Playwright checks: `tests/e2e/demo3.spec.js` and `tests/e2e/bookstore.spec.js`

All test cases are maintained in Gherkin feature files; the Playwright files are executable automation for those behaviors.

## Scenarios and results

| Gherkin scenario / behavior | Playwright evidence | Result |
| --- | --- | --- |
| CLI reports a custom scan and creates Markdown API documentation | Captured CLI output reported the scanned `server.js`, one endpoint, updated `README.md`, and created `API_DOCS.md`; generated Markdown contained the endpoint and preserved notes outside the README markers. The fixture was temporary and removed after the check. | **Passed** |
| Generated bookstore HTML preview displays the starter catalog | Browser showed the Bookstore title, landing heading, and three starter book cards. | **Passed** |
| Reader adds a book and finds it with catalog search | Added a book through the form, searched its title, and observed only the matching card. | **Passed** |
| `resetDemo.js` restores the catalog after a book is added | Added a temporary book, ran the reset script, reloaded the page, and verified the three starter books in both the UI and `data/books.json`. | **Passed** |
| Existing bookstore homepage, search, add, and API validation scenarios | Existing Playwright checks ran in the same headed suite; all four passed. | **Passed** |

## Commands and execution

| Command | Result |
| --- | --- |
| `npx playwright test --headed` | **Passed** — 8 tests passed, 0 failed, in 43 seconds. Ran with `playwright.config.js`; its web server started `npm start --prefix bookstore-web-app` at `http://localhost:3000`. |
| `npm run test:unit` | **Passed** — 8 tests passed, 0 failed. |

## Failures and limitations

- **Automated test failures:** None observed. Peer code review findings, including one Blocker, are listed below.
- All expected targets were present, including `docSync.js` and `resetDemo.js`; no fixture or implementation addition was needed.
- The bookstore provides a browser-rendered HTML interface but no in-app Markdown-rendering preview. The CLI-generated Markdown was verified from the generated `README.md` and `API_DOCS.md` files in the Playwright check; visual rendering of Markdown in a browser was not applicable to the current app.
- The temporary CLI project was created outside the repository and removed after the run. The reset flow restored the starter catalog.
- This report was not published to Confluence.

## Seven-point peer code review

Reviewed `docSync.js` and the bookstore server/UI changes against the Demo-3 requirements and architecture. The browser and unit test runs passed, but the code review found issues that should be resolved before treating the implementation as release-ready.

| Checklist area | Result |
|---|---|
| **Correctness** | **Major:** `docSync.js:130-148` searches up to 200 characters ahead when pairing Node HTTP methods and paths. A probe with separate GET and POST condition blocks incorrectly produced `GET /write`. **Major:** `docSync.js:90-104` does not extract a named function assigned as `exports.lookup = function lookup(...)`, a common CommonJS export form. |
| **Security** | **Blocker:** `docSync.js:15-18` does not redact quoted object keys such as `"DB_PASSWORD": "value"`. A full CLI probe confirmed that such a value in an extracted JSDoc description is written into `API_DOCS.md`, violating the secret-redaction requirement. |
| **Error Handling** | **Major:** `docSync.js:277,293` returns exit code 0 even when a markerless existing README is skipped. Although a warning is printed, automated callers can interpret the incomplete sync as success. |
| **Test Coverage** | Existing tests passed, but they do not cover the quoted-key redaction leak, cross-block route pairing, `exports.name = function` extraction, or nonzero status for skipped docs. Add regression cases for these behaviors. |
| **Code Clarity** | The endpoint regex's arbitrary 200-character lookahead makes route association difficult to reason about; this contributes to the correctness issue above. |
| **DRY Principle** | No actionable duplication found in the reviewed scope. |
| **Dependency Safety** | `@playwright/test@1.65.1` is the only direct dependency and is development-only; the lockfile pins the resolved version. No runtime package dependencies were found. A fresh advisory audit was not run for this review. |

### Review evidence and recommendations

1. **Blocker — quoted secret keys can leak:** Extend redaction to handle quoted and unquoted key/value forms, then verify the complete CLI output and both generated docs never contain the source value.
2. **Major — false route association:** Replace the broad cross-block lookahead with route extraction scoped to a single condition/block or a parser; add a regression case for adjacent unrelated conditions.
3. **Major — exported functions omitted:** Support common CommonJS function assignments such as `exports.lookup = function lookup(...)`; add an extraction test.
4. **Major — skipped docs return success:** Aggregate skipped-document outcomes and use a nonzero exit status when required documentation was not updated; test the CLI exit code.

No implementation fixes were applied as part of this QA/review run. These findings are recorded for approval and follow-up.
