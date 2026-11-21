# Build and Local Deployment Guide

## Prerequisites

- Windows 10 or later
- Python 3.9 or later
- Node.js 18 or later
- Git

## Build

This repository does not require a compiled build. The Python package and Node.js helper can be validated directly.

```powershell
python -m unittest discover -s tests -v
node --check scripts\confluencePublisher.js
```

## Local deployment

1. Run the unit tests.
2. Confirm `.env` is ignored by Git.
3. Run the sync CLI in dry-run mode with a temporary mapping file:

```powershell
python -m src.doc_sync.__main__ `
  --dry-run `
  --source-revision local `
  --changed-files '["README.md"]' `
  --mapping-file mapping.json `
  --report-file .sync-report.json
```

The mapping file should contain a source path key and Confluence target:

```json
{
  "README.md": {
    "title": "Repository Readme",
    "page_id": "PAGE_ID"
  }
}
```

For local validation, set `CONFLUENCE_*` variables only if live publishing is required. Dry-run mode does not read or require Confluence credentials.

## Verification

- Unit test exit code is `0`.
- The Node.js helper passes `node --check`.
- Dry-run creates a JSON report and makes no Confluence API request.
- `.env` remains excluded from Git.

## Local stop and rollback

Stop with `Ctrl+C` for an interactive process. No Confluence content or Git state is modified by local deployment. Remove generated local reports and temporary mappings if they are not needed.
