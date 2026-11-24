# Automated Documentation Sync Architecture

## Component diagram

```mermaid
flowchart TB
  MANAGER[Bookstore Storefront Manager] -->|runs node docSync.js and optional folder| CLI[Node.js CLI]
  CLI -->|target folder| SCAN[Recursive JavaScript scanner]
  SCAN -->|sorted .js file paths| EXTRACT[Function, JSDoc, and endpoint extractor]
  EXTRACT -->|discovered metadata| REDACT[Sensitive-value redactor]
  REDACT -->|safe metadata| GENERATE[Deterministic Markdown generator]
  GENERATE -->|README and API_DOCS content| MARKERS[Marker-aware document updater]
  MARKERS -->|atomic file writes| DOCS[(README.md and API_DOCS.md)]
  MARKERS -->|updated or skipped outcomes| REPORT[Console report]
  TARGET[Selected project folder] -. contains .-> SCAN
  TARGET -. contains .-> DOCS
```

## Data-flow diagram

```mermaid
flowchart TD
  MANAGER[Bookstore Storefront Manager] -->|default or custom folder| CLI[Local Node.js CLI]
  subgraph LOCAL[Local machine boundary]
    CLI -->|folder path| SCAN[Recursive .js scan]
    TARGET[(Selected project source files)] -->|nested JavaScript files| SCAN
    SCAN -->|sorted file paths and source text| EXTRACT[Extract exports, JSDoc, and GET POST PUT DELETE routes]
    EXTRACT -->|function and endpoint metadata| REDACT[Redact DB_PASSWORD JWT_SECRET API_TOKEN values]
    REDACT -->|redacted metadata| RENDER[Generate deterministic Markdown sections]
    RENDER -->|README and API_DOCS sections| UPDATE[Preserve content outside valid markers]
    EXISTING[(Existing README.md and API_DOCS.md)] -->|existing bytes and marker pairs| UPDATE
    UPDATE -->|new or updated files| OUTPUT[(README.md and API_DOCS.md)]
    UPDATE -->|updated or skipped status| REPORT[Console report]
    REPORT -->|scanned files and section outcomes| MANAGER
  end
```

## Design decisions

- The CLI runs locally with Node.js. `node docSync.js [targetFolder]` accepts an optional target; absent one, it scans `./bookstore-web-app`.
- Scanning is recursive for `.js` files and excludes `.git` and `node_modules`; sorted paths make output ordering deterministic.
- Extraction records exported or JSDoc-documented functions, their supported JSDoc details, and `GET`, `POST`, `PUT`, and `DELETE` endpoints.
- Generated sections update only between one valid `<!-- DOC-SYNC-START -->` / `<!-- DOC-SYNC-END -->` pair. Missing documentation files receive a title and marker pair; files with invalid markers are preserved and skipped.
- Password and API-key values for `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` are redacted before generated documentation or console reporting. No remote service is part of this flow.

## Interfaces

- **CLI:** `node docSync.js [targetFolder]`; optional folder path or repository-default `./bookstore-web-app`.
- **Inputs:** Nested `.js` source files in the chosen project folder; optional existing `README.md` and `API_DOCS.md`.
- **Outputs:** Generated function and endpoint sections in `README.md` and `API_DOCS.md`, plus a console report of scanned files and updated or skipped sections.
- **Internal boundaries:** Scanner returns sorted file paths; extractor returns function/endpoint metadata; generator formats Markdown; marker updater preserves human-authored regions and writes generated content.

## Failure handling

- A missing or non-directory target returns a clear error and non-zero status before documentation is changed.
- Read, extraction, generation, and write errors are reported without printing unredacted generated values. Generated contents are prepared before writes; each output file is written through a temporary file and rename.
- Missing, empty, or unreadable folders are handled with a clear report; an empty valid folder produces deterministic empty-section messages.
- A documentation file with a missing, duplicated, or reversed marker pair is left unchanged and reported as skipped. Failures do not trigger remote writes.
