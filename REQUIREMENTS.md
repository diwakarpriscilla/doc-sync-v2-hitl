# [Demo-5] Automated Documentation Sync Requirements

## User story

As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation stays accurate after code changes without manual editing.

## Scope

Build a Node.js CLI that:

- Scans a selected project folder for JavaScript files.
- Extracts exported functions, JSDoc comments, and HTTP API endpoints.
- Updates `README.md` and `API_DOCS.md`.
- Preserves human-authored content outside generated sections.
- Redacts sensitive values before writing or displaying report information.

## Selected decisions

1. **Target project folder:** Use `./bookstore-web-app` by default.
2. **Missing documentation:** Automatically create `README.md` and `API_DOCS.md` when absent.
3. **Manual notes:** Update only content between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`; preserve content outside the marker pair.
4. **Security:** Redact passwords and API keys as `[REDACTED]`.

## Functional requirements

1. Use `./bookstore-web-app` when no target folder is supplied.
2. Accept a custom target folder supplied by the user.
3. Scan `.js` files in the selected target folder, including nested project folders.
4. Extract exported functions, JSDoc comments, and HTTP endpoints that use `GET`, `POST`, `PUT`, and `DELETE`.
5. Generate deterministic documentation sections for discovered functions and endpoints.
6. Update `README.md` and `API_DOCS.md` only inside valid `<!-- DOC-SYNC-START -->` / `<!-- DOC-SYNC-END -->` marker pairs.
7. Preserve all bytes outside a valid marker pair.
8. If `README.md` or `API_DOCS.md` is missing, create the file automatically with a project title and a valid marker pair.
9. Redact passwords and API keys, including values for names such as `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`, before writing documentation or producing console output.
10. Print a clear report that identifies scanned files and the documentation sections updated or skipped.
11. Handle missing, empty, or unreadable target folders safely and return a clear non-zero or reported failure as appropriate.

## Non-functional requirements

1. The CLI must run locally with Node.js.
2. Documentation output must be deterministic when source inputs are unchanged.
3. Scanning or generation failures must not leave partially written documentation.
4. Secrets must not be written to documentation or printed in console output.
5. Existing repository behavior outside the requested implementation must remain unchanged.

## Assumptions

- Documentation files are located in the selected target folder.
- A missing documentation file may be initialized with the project folder name as the title.
- Existing documentation files without a valid marker pair are not overwritten and are reported as skipped.
- Endpoint metadata is represented in a human-readable Markdown list.

## Open questions

1. None of the four requirements selections remain unresolved.
2. The exact JSDoc fields to extract beyond descriptions, parameters, and return values are not specified by the story.

## Measurable acceptance criteria

1. Running the CLI without a folder argument scans `./bookstore-web-app`.
2. Supplying a custom folder path causes that folder to be used instead.
3. JavaScript `.js` files in the selected folder and nested folders are reported as scanned.
4. Generated documentation identifies discovered exported functions and JSDoc details.
5. Generated documentation identifies discovered `GET`, `POST`, `PUT`, and `DELETE` endpoints.
6. For a valid marker pair, bytes before the start marker and after the end marker remain unchanged.
7. A missing `README.md` or `API_DOCS.md` is created with a starter title and valid marker pair.
8. Password and API-key values do not appear in generated documentation or console output and are represented as `[REDACTED]`.
9. A missing or empty target folder produces a clear report and does not cause an unhandled exception.
10. The console report names each scanned file and each documentation section updated or skipped.
