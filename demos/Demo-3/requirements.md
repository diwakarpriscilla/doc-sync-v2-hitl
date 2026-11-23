# [Demo-3] Automated Documentation Sync Requirements

## User story

As a Backend Engineering Lead, I want an automated CLI tool that scans JavaScript/Node.js route and service files and updates `API_DOCS.md` and `README.md`, so that endpoint documentation stays accurate after code changes without manual editing.

## Scope

Build a Node.js CLI that scans a selected project folder for JavaScript files, extracts exported functions, JSDoc comments, and HTTP API endpoints, and updates documentation in that project folder while preserving human-authored notes and redacting secrets.

## Functional requirements

1. Use `./bookstore-web-app` as the default project folder; allow a custom target folder.
2. Scan `.js` files in the selected target folder.
3. Extract exported functions, JSDoc comments, and HTTP API endpoints using the `GET`, `POST`, `PUT`, and `DELETE` methods.
4. Update `README.md` and `API_DOCS.md` in the selected project folder.
5. Restrict generated-content updates to text between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` markers.
6. Preserve human-authored content outside the marker range unchanged.
7. Create a missing documentation file automatically with a starter title and generated-content markers.
8. Redact sensitive environment values, including `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`, as `[REDACTED]` before writing documentation or printing report output.
9. Print a clear console report identifying scanned files and updated documentation sections.
10. Handle missing or empty target folders safely and report the condition clearly.

## Non-functional requirements

- Implement the CLI in Node.js and support local execution.
- Produce deterministic documentation for unchanged source files.
- Avoid leaving partially written documentation if scanning or generation fails.
- Do not print or store the original values of secrets found in source files.

## Assumptions

- Documentation files are located in the selected target folder.
- When a documentation file is missing, its starter title can be based on the project folder name.
- If an existing documentation file lacks the marker pair, the CLI must not overwrite its human-authored content; the required repair behavior needs clarification before implementation.

## Open questions

1. Should the scan include nested subfolders or only files directly inside the selected target folder?
2. If an existing document has neither marker, should the CLI append a marked generated section or skip that file with a warning?
3. The story does not define the exact extracted JSDoc fields or endpoint metadata format; what fields should generated sections contain beyond function and endpoint documentation?

## Measurable acceptance criteria

1. Running the CLI without a folder argument selects `./bookstore-web-app`; a supplied path selects that folder instead.
2. The scan considers JavaScript `.js` files in the selected folder and reports which files it processed.
3. Generated docs include discovered exported functions, JSDoc comments, and endpoints for `GET`, `POST`, `PUT`, and `DELETE`.
4. For documents containing a valid marker pair, only the content inside the markers is changed; bytes before and after the pair remain unchanged.
5. If `README.md` or `API_DOCS.md` is absent, it is created with a starter title and one valid marker pair.
6. Values associated with `DB_PASSWORD`, `JWT_SECRET`, or `API_TOKEN` do not appear in generated documentation or console output; each is represented as `[REDACTED]`.
7. A missing or empty target folder results in a clear report and no unhandled exception.
8. The console report names scanned files and updated documentation sections.
