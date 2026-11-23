# [Demo-3] Automated Documentation Sync Architecture

## Component Diagram

```mermaid
flowchart LR
  U["Bookstore Storefront Manager\nCLI user"]
  CLI["Node.js Documentation Sync CLI\nTarget folder argument"]
  FS["Selected project folder\nFilesystem"]
  JS["JavaScript source files\n*.js"]
  DOC["Documentation files\nREADME.md and API_DOCS.md"]
  OUT["Console report"]
  READER["Bookstore visitor"]
  UI["Bookstore UI\nSearch and Add Book"]
  API["Catalog API\nGET/POST /api/books"]
  BOOKS[("data/books.json")]

  U -->|"folder path or no argument"| CLI
  CLI -->|"validate and enumerate"| FS
  FS -->|"project .js files"| JS
  JS -->|"source text"| CLI
  CLI -->|"redacted generated text"| DOC
  CLI -->|"scanned files and section updates"| OUT
  OUT -->|"human-visible report"| U
  READER --> UI
  UI -->|"search catalog"| API
  UI -->|"submit book details"| API
  API -->|"read and persist"| BOOKS
```

## Data-Flow Diagram

```mermaid
flowchart LR
  subgraph UserBoundary["User boundary"]
    A["Bookstore Storefront Manager"]
  end

  subgraph CLIBoundary["Local CLI process"]
    B["Argument and folder validation"]
    C["JavaScript scan"]
    D["Metadata extraction"]
    E["Secret redaction"]
    F["Deterministic documentation generation"]
    G["Marker-preserving file update"]
    H["Console reporting"]
  end

  subgraph ProjectBoundary["Selected project filesystem"]
    I[(".js source files")]
    J[("README.md")]
    K[("API_DOCS.md")]
  end

  A -->|"optional target folder"| B
  B -->|"default ./bookstore-web-app or validated custom path"| C
  C -->|"read source text"| I
  I -->|"export declarations, JSDoc, and HTTP routes"| D
  D -->|"raw extracted metadata"| E
  E -->|"[REDACTED] values"| F
  F -->|"generated README/API sections"| G
  G -->|"replace text only inside valid marker pairs"| J
  G -->|"replace text only inside valid marker pairs"| K
  G -->|"missing-file starter document"| J
  G -->|"missing-file starter document"| K
  G -->|"update status"| H
  H -->|"scanned files and updated sections"| A
```

## Design Decisions

- **Default target:** When no folder argument is supplied, the CLI selects `./bookstore-web-app`; a supplied path replaces that default.
- **Source selection:** Scan `.js` files recursively beneath the selected project folder, excluding `.git` and `node_modules`. The default project contains `server.js` and nested `public/app.js`; recursive scanning includes both.
- **Extraction:** The CLI reads source text and derives exported functions, JSDoc comments, and route metadata for `GET`, `POST`, `PUT`, and `DELETE`. Exact JSDoc fields and route formatting remain open pending clarification and are therefore not invented here.
- **Marker preservation:** Generated content replaces only text bounded by `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->`. Bytes outside a valid pair are not changed.
- **Missing documents:** Missing `README.md` or `API_DOCS.md` is created with a project-folder-based title and a valid marker pair, as required.
- **Existing documents without markers:** Never overwrite human-authored content. Leave an existing file without exactly one ordered marker pair unchanged and report a warning; do not count it as updated. A missing file is created with a starter title and marker pair.
- **Determinism:** Generated sections are derived in a stable order from unchanged source content so repeat runs produce the same result.
- **Secret boundary:** Redaction occurs before generation, documentation writes, and console reporting. No original secret value is stored or emitted.

## Interfaces

- **CLI input:** optional positional project-folder path; omitted value means `./bookstore-web-app`.
- **Source interface:** recursive local reads of `.js` files in the selected target folder, excluding `.git` and `node_modules`.
- **Documentation interface:** local reads and writes to `README.md` and `API_DOCS.md` in the selected target folder.
- **Marker contract:** both marker lines must exist and form a valid start/end pair before in-marker content is replaced.
- **Report interface:** local console text lists processed files and documentation sections updated, skipped, or created.
- **Representative redaction contract:** `DB_PASSWORD`, `JWT_SECRET`, and `API_TOKEN` values are represented as `[REDACTED]`.
- **Target-folder outcomes:** A missing/non-directory target returns a clear error and nonzero exit. An existing target with no `.js` files returns a clear empty-scan report and zero exit; missing documentation files may still be initialized.

## Bookstore Search and Add Book Extension

- The existing browser search remains case-insensitive across title, author, and category.
- The Add Book form accepts a title, author, and category and sends them to `POST /api/books`.
- The local catalog API validates required fields and length limits, then persists valid books to `data/books.json`.
- After a successful add, the UI refreshes the catalog while retaining the current search query. API validation errors are presented to the user.

## Failure Handling

- Missing or empty target folders return a clear report without an unhandled exception. The process exit code for these conditions is not specified and must be decided before implementation.
- Scan or generation errors stop document updates and return a clear error report.
- Documentation writes use a completed generated result followed by a safe local replacement strategy so a failed write does not leave partially written documentation.
- Read, parse, or filesystem failures identify the affected file or documentation section without exposing secret values.
- If a valid marker pair is unavailable in an existing document, the CLI skips that file and warns the user rather than damaging human-authored content.
- If a source or environment value contains one of the named secrets, no original value appears in generated docs or the report.
