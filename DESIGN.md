# Automated Documentation Sync Design

## Architecture

The implementation is split into deterministic stages:

1. **Change discovery** scans the pull request diff for documentation files.
2. **Mapping** resolves each source file to a Confluence page and namespace.
3. **Rendering** converts repository Markdown into Confluence-compatible storage format.
4. **Validation** checks required configuration and performs dry-run output.
5. **Synchronization** creates or updates pages after explicit approval.
6. **Reporting** records source revision, page URL, and outcome.

## Proposed repository layout

- `src/doc_sync/` - implementation modules
- `src/doc_sync/config.py` - environment and mapping configuration
- `src/doc_sync/discovery.py` - changed-document detection
- `src/doc_sync/render.py` - Markdown rendering
- `src/doc_sync/confluence.py` - Confluence API operations
- `src/doc_sync/report.py` - structured sync reporting
- `tests/` - unit and integration tests
- `.github/workflows/documentation-sync.yml` - workflow entry point

## External integration

Confluence integration will use REST API credentials supplied by repository secrets:

- `CONFLUENCE_BASE_URL`
- `CONFLUENCE_EMAIL`
- `CONFLUENCE_API_TOKEN`
- `CONFLUENCE_SPACE_KEY`

Secrets must not be committed or included in logs.

## Control flow

```text
Pull request diff
  -> discover documentation files
  -> load source-to-page mapping
  -> render and validate content
  -> dry-run report
  -> explicit approval checkpoint
  -> create or update Confluence pages
  -> write sync report
```

## Failure handling

- Missing configuration fails before external operations.
- Invalid rendering or mapping fails before writes.
- API failures produce a non-zero exit code and sanitized error details.
- Partial synchronization reports each page-level success and failure.

## Approval boundary

This design is informational until approved. It does not create remote resources, commit changes, or open a pull request.
