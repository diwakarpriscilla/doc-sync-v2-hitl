# Automated Documentation Sync Architecture

## Component diagram

```mermaid
flowchart LR
  PR[Approved pull request] --> GIT[Git change discovery]
  GIT --> MAP[Source-to-page mapping]
  MAP --> RENDER[Markdown to Confluence storage]
  RENDER --> DRY[Dry-run report]
  DRY --> HITL{Human approval}
  HITL -->|Approved| CONF[Confluence REST API]
  HITL -->|Changes| MAP
  CONF --> PAGE[Confluence page]
  CONF --> REPORT[Sync report]
```

## Data-flow diagram

```mermaid
flowchart TD
  USER[Repository maintainer] -->|changed files| GIT[Git repository]
  GIT -->|document paths and revision| DISC[Change discovery]
  DISC -->|source paths| MAP[Mapping service]
  MAP -->|target page metadata| RENDER[Renderer]
  RENDER -->|storage content| PLAN[Dry-run plan]
  PLAN -->|preview| USER
  USER -->|explicit approval| CONF[Confluence REST API]
  CONF -->|page URL and status| REPORT[JSON report]
```

## Components

- **Change discovery** filters Markdown files and produces a stable work list.
- **Mapping** resolves repository paths to Confluence page targets.
- **Renderer** converts Markdown content for Confluence storage format.
- **Confluence client** authenticates with `.env` or repository environment secrets.
- **Reporting** records source revision, target, status, and confirmed page URL.
- **HITL boundary** prevents writes and Git operations until the corresponding approval is recorded.

## Failure handling

Missing configuration and mappings fail before network operations. API failures return sanitized errors and non-zero exit status. Partial page outcomes remain isolated in reports.
