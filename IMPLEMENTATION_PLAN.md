# Automated Documentation Sync Implementation Plan

## 1. Add the configuration model

Create `src/doc_sync/config.py` to load mapping and Confluence settings from environment variables and a repository configuration file.

Expected behavior:

- Reject missing required settings before an external API call.
- Reject secrets embedded in repository configuration.
- Support an explicit `--dry-run` mode.

## 2. Add change discovery

Create `src/doc_sync/discovery.py` to identify changed documentation files from Git or pull request input.

Expected behavior:

- Read a source revision and changed-file list.
- Filter recognized documentation files.
- Produce a deterministic ordered work set.

## 3. Add mapping and rendering

Create:

- `src/doc_sync/mapping.py`
- `src/doc_sync/render.py`

The mapping module resolves repository paths to Confluence space and page identifiers. The rendering module converts approved Markdown content into Confluence storage format.

## 4. Add Confluence operations

Create `src/doc_sync/confluence.py` with create, update, and lookup operations.

Expected behavior:

- Use the Confluence REST API.
- Use API credentials only from environment variables or repository secrets.
- Return sanitized errors and preserve page-level outcomes.

## 5. Add reporting and CLI entry point

Create:

- `src/doc_sync/report.py`
- `src/doc_sync/__main__.py`

The CLI supports:

- `--dry-run`
- `--source-revision`
- `--changed-files`
- `--mapping-file`
- `--report-file`

## 6. Add tests

Create focused tests for configuration, discovery, mapping, rendering, dry-run behavior, and API error handling.

Tests must verify that:

- Dry-run mode performs no external writes.
- Missing configuration fails before API access.
- Source revisions and page URLs are included in reports.
- Partial failures are reported independently.

## 7. Add workflow integration

Create `.github/workflows/documentation-sync.yml` only after implementation and tests are approved.

The workflow will invoke dry-run validation and require an environment approval step before synchronization.
