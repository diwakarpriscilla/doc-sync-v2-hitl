# [Demo-5] QA Test Plan and Execution Summary

## Status

- **Step:** 7 - QA
- **Execution:** Complete
- **Browser mode:** Headed (`--headed`)
- **Publication:** Not performed; awaiting Step 7 approval
- **Scope:** Demo-5 documentation-sync CLI, generated Markdown, bookstore HTML preview, Search and Add Book behavior, API validation, unit checks, and isolated `resetDemo.js` behavior.

## Test assets

- Gherkin scenario file: `demos/Demo-5/demo-5-qa.feature`
- Existing application Gherkin scenarios: `features/bookstore.feature`
- Playwright checks: `tests/e2e/bookstore.spec.js` and `tests/e2e/demo3.spec.js`
- Unit checks: `tests/docSync.test.js` and `tests/confluencePublisher.test.js`

All test cases are maintained in Gherkin feature files. The Playwright and Node test files provide executable automation for those behaviors.

## Scope

The QA run verifies:

1. Node unit tests for documentation sync and Confluence approval guards.
2. The documentation-sync CLI against the bookstore application.
3. Console CLI output and generated `README.md` / `API_DOCS.md` content.
4. The headed browser-rendered bookstore HTML preview.
5. Homepage catalog rendering, title, and baseline banner.
6. Case-insensitive title, author, and category search behavior.
7. Add Book persistence and featured-new-arrival behavior.
8. Missing-category API validation.
9. `resetDemo.js` execution only in an isolated temporary Playwright fixture.

The live audience catalog was restored manually before and after browser validation. Automated Playwright reset coverage used only a temporary copy.

## Gherkin scenarios and results

| Gherkin scenario / behavior | Actual Playwright or unit evidence | Result |
| --- | --- | --- |
| Unit checks pass for documentation sync and publication guards | `npm run test:unit` reported 10 passed and 0 failed. | **Passed** |
| CLI reports a custom scan and creates Markdown API documentation | The headed suite captured CLI output, created/updated temporary Markdown, verified the `/api/preview` endpoint, and preserved README text outside markers. | **Passed** |
| Generated bookstore HTML preview displays the starter catalog | The headed homepage check showed the Bookstore title, baseline banner, landing heading, and baseline cards. | **Passed** |
| Catalog search includes title, author, and category | Atomic and Creativity searches passed in the existing headed Playwright suite; each returned the expected single result. | **Passed** |
| A reader adds a featured book without losing persistence | The headed Playwright add-book check added The Pragmatic Programmer, observed the Featured / New Arrival badge, confirmed reload persistence, and confirmed 4 catalog entries. | **Passed** |
| Missing category submission is rejected | Playwright received HTTP 400 and the `category is required.` JSON error. | **Passed** |
| Automated reset remains isolated from the live catalog | The Playwright reset test copied `resetDemo.js`, replaced only its temporary copy's catalog, restored 3 entries, preserved temporary README content, and removed the fixture. The live catalog was restored manually after browser validation. | **Passed** |

## Commands and actual execution

| Command | Actual result |
| --- | --- |
| `node resetDemo.js` | **Passed** - manual live-catalog restoration ran before validation and reported 3 starter books restored; documentation files were preserved. |
| `npm run test:unit` | **Passed** - 10 tests passed, 0 failed, 0 skipped. |
| `node docSync.js ./bookstore-web-app` | **Passed** - exit status 0; scanned 2 JavaScript files, discovered 2 GET/POST endpoints and 0 functions, updated `API_DOCS.md`, and preserved the markerless `README.md` with a clear warning. |
| `npx playwright test --headed` | **Passed** - 8 tests passed, 0 failed, completed in 49.0 seconds using the Playwright web server at `http://localhost:3000`. |

## CLI and Markdown preview evidence

CLI output for the live app reported:

- Target folder: `bookstore-web-app`
- Scanned 2 JavaScript files: `public/app.js` and `server.js`
- Discovered 2 endpoints and 0 functions
- `README.md` was preserved and skipped because it has no valid DOC-SYNC marker pair
- `API_DOCS.md` was updated

The generated `bookstore-web-app/API_DOCS.md` preview contains:

- Marker-bounded generated content
- `GET /api/books` from `server.js`
- `POST /api/books` from `server.js`
- A clear "No exported or JSDoc-documented functions found." result

The temporary CLI Playwright fixture verified generated Markdown separately, including `/api/preview`, and verified README human notes remained outside the generated markers.

## Failures

- **Automated test failures:** None observed.
- **Application or fixture failures:** None observed.
- No scoped fixture or implementation was added because all expected QA targets and fixtures were present.

## Limitations

- The bookstore is a browser-rendered HTML application and does not provide an in-app Markdown rendering surface. Markdown was inspected directly from the generated `README.md` and `API_DOCS.md` files and through temporary Playwright CLI fixtures.
- The Playwright suite ran with 2 workers; browser tests were fully directed by the repository's existing configuration and headed by `--headed`.
- Normal Playwright browser tests did not run `resetDemo.js`. The only reset automation used a temporary fixture and removed it afterward.
- The live catalog was manually restored after the headed suite, so the tested added featured book does not remain in the live catalog.
- No Confluence page was created or updated during this Step 7 QA execution.

## Preview metadata

- **Exact Confluence title:** `[Demo-5] Automated Documentation Sync - QA Test Plan and Execution Summary`
- **Parent page:** `User Story: Automated Documentation Sync (Bookstore API)` (page ID `8454160`)
- **Source file:** `demos/Demo-5/QA_TEST_PLAN_AND_EXECUTION_SUMMARY.md`
