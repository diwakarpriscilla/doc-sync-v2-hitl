# [Demo-4] Implementation Plan

## Scope

Implement the approved Demo-4 documentation synchronization behavior for the default
`./bookstore-web-app` target. Keep the existing Bookstore Web App behavior intact.

Out of scope:

- Confluence publication
- Git commits or pull requests
- Custom target-folder selection
- Whole-file overwrites
- Additional secret names beyond the repository's existing `DB_PASSWORD`,
  `JWT_SECRET`, and `API_TOKEN` detection set

## Dependency-ordered tasks

1. **Lock the Demo-4 behavior and status model**
   - Preserve `./bookstore-web-app` as the default target.
   - Keep `README.md` and `API_DOCS.md` as the two documentation outputs.
   - Define terminal outcomes as `created`, `updated`, `unchanged`, or `blocked`.
   - Treat a missing target as a sanitized non-zero failure.

2. **Complete marker-safe rendering**
   - Validate exactly one start marker and exactly one end marker in existing files.
   - Preserve every byte before the start marker and after the end marker.
   - Replace only content between the marker pair.
   - Preserve and report marker-invalid existing files as `blocked`.
   - Create missing files with a title and one valid marker pair.

3. **Implement unchanged-content detection**
   - Build the complete generated marker section before writing.
   - Compare it byte-for-byte with the existing marker section.
   - Report `unchanged` and skip the write when the generated section is identical.
   - Report `updated` only when a valid marked section differs.

4. **Strengthen discovery and extraction**
   - Recursively discover `.js` files below the target folder.
   - Exclude `.git` and `node_modules`.
   - Sort discovered files and extracted records deterministically.
   - Detect `GET`, `POST`, `PUT`, and `DELETE` routes.
   - Detect exported functions and JSDoc-documented functions.

5. **Define deterministic documentation output**
   - Render the API overview in `README.md`.
   - Render endpoint and JavaScript-function tables in `API_DOCS.md`.
   - Emit stable empty-state text when no endpoints or functions are found.
   - Include source file information for endpoints and functions.

6. **Preserve secret-safe output**
   - Redact values for `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN`.
   - Replace recognized secret values with `[REDACTED]`.
   - Apply redaction before generated Markdown is written or CLI output is produced.
   - Never add credential values to logs or test fixtures.

7. **Implement safe reporting and writes**
   - Report the target, JavaScript file count and paths, endpoint/function counts,
     and each document's result.
   - Exit successfully for an empty JavaScript folder while creating missing docs.
   - Exit non-zero with an actionable sanitized error for missing or invalid targets.
   - Continue using temporary-file plus rename writes for created or changed files.
   - Remove temporary files after write failures.

8. **Update demo reset behavior**
   - In [resetDemo.js](resetDemo.js), restore starter catalog data and Demo-4
     documentation state without overwriting manual notes outside marker sections.
   - Avoid restoring an invalid markerless README as if it were generated output.

9. **Add focused unit coverage**
   - Update [tests/docSync.test.js](tests/docSync.test.js) for the final `created`,
     `updated`, `unchanged`, and `blocked` status behavior.
   - Cover missing and duplicate marker pairs.
   - Verify byte-for-byte preservation outside a valid marker pair.
   - Verify missing-document creation and empty-target behavior.
   - Verify redaction and absence of secret values in files and CLI output.

10. **Run validation**
    - Run `npm run test:unit`.
    - Run `node docSync.js ./bookstore-web-app`.
    - Inspect `bookstore-web-app/README.md` and
      `bookstore-web-app/API_DOCS.md`.
    - Confirm the generated output and status report match the acceptance criteria.

## Files expected to change

- `docSync.js`
- `resetDemo.js`
- `tests/docSync.test.js`
- `bookstore-web-app/README.md`
- `bookstore-web-app/API_DOCS.md`

## Acceptance check

Implementation is complete only when:

- The default target is `./bookstore-web-app`.
- Missing documentation files are created.
- Existing manual text outside valid markers is preserved.
- Invalid marker pairs are blocked rather than overwritten.
- Repeated unchanged scans report `unchanged` and do not rewrite files.
- Supported endpoints and functions are documented deterministically.
- Recognized secret values never appear in generated files or CLI output.
- The unit suite passes.
