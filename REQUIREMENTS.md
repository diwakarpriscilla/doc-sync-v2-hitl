# Demo-4 Requirements: Automated Documentation Sync

## Repository and story context

Demo-4 is a human-in-the-loop documentation synchronization workflow in the `doc-sync-v2-hitl` repository. The existing implementation and tests support scanning the `./bookstore-web-app` project, generating documentation for HTTP endpoints and JavaScript functions, updating marked sections in documentation files, and publishing approved documentation to Confluence through a repository helper.

This requirements document preserves the repository's existing documentation-sync objective and makes the selected Demo-4 behavior explicit. It does not authorize architecture work, implementation, publishing, commits, or pull requests.

## Scope

### In scope

- Scan the default project folder `./bookstore-web-app`.
- Detect JavaScript source files while excluding `.git` and `node_modules`.
- Generate documentation for supported HTTP endpoints and exported or JSDoc-documented JavaScript functions.
- Create `README.md` or `API_DOCS.md` automatically if either file is missing.
- Generate API documentation in a deterministic, repeatable format.
- Update only content between `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` markers.
- Redact recognized passwords and API keys as `[REDACTED]`.
- Preserve repository context, manual notes, and text outside protected marker sections.
- Provide measurable validation and acceptance evidence for generated documentation.

### Out of scope

- Scanning a custom project folder.
- Overwriting an entire documentation file.
- Publishing changes to Confluence in this step.
- Creating commits or pull requests.
- Changing production application behavior unrelated to documentation synchronization.
- Inventing or exposing credentials, tokens, secrets, or confidential values.

## Resolved Demo-4 decisions

| Question | Selected option | Resolved behavior |
| --- | --- | --- |
| Target Project Folder | **A** | Scan `./bookstore-web-app`. |
| Missing Documentation Files | **A** | Create missing `README.md` and/or `API_DOCS.md` automatically. |
| Protecting Manual Notes | **A** | Update only text inside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` markers. |
| Security & Secret Handling | **A** | Redact passwords and API keys as `[REDACTED]`. |

User selections: **All A's**.

## Functional requirements

1. The sync process shall accept `./bookstore-web-app` as the Demo-4 target project folder.
2. The process shall discover source files beneath the target folder and exclude `.git` and `node_modules`.
3. The process shall detect supported HTTP endpoints for `GET`, `POST`, `PUT`, and `DELETE` routes.
4. The process shall detect exported JavaScript functions and JSDoc-documented functions.
5. The generated API documentation shall include endpoint method, path, and source file information.
6. The generated README documentation shall include a generated API overview.
7. If `README.md` is missing, the process shall create it with a title, marker pair, and generated content.
8. If `API_DOCS.md` is missing, the process shall create it with a title, marker pair, and generated content.
9. For an existing marked file, the process shall replace only content between the start and end markers.
10. The process shall preserve all content before the start marker and after the end marker.
11. If one or both markers are missing from an existing file, the process shall report an actionable warning and shall not overwrite the file.
12. Passwords and API-key values found in source text shall be represented as `[REDACTED]` in generated documentation.
13. Secret-key names used for detection shall not be removed from the documentation or generated values outside the secret value.
14. The process shall remain deterministic: repeated scans of unchanged source shall produce the same generated content.
15. The process shall distinguish created, updated, unchanged, and blocked documentation results.
16. No Confluence write, Git commit, or pull request is permitted as part of Step 1.

## Non-functional requirements

1. Source scanning and documentation rendering shall be repeatable and auditable.
2. Generated documentation shall not contain recognized passwords or API-key values.
3. Operations shall fail safely and provide clear, actionable errors.
4. Existing application behavior and manual text outside marker sections shall remain unchanged.
5. File updates shall be scoped to the configured project folder and documentation files.
6. Demo-4 requirements shall be explicit and reviewable before later workflow steps begin.

## Assumptions

- The existing Confluence user story defines the documentation synchronization objective and human approval workflow.
- `./bookstore-web-app` is the repository-relative Demo-4 target.
- `README.md` and `API_DOCS.md` are the documentation outputs for the target project.
- Marker-based synchronization is the correct preservation strategy when markers are present.
- Human-authored content outside markers is not to be modified automatically.
- Recognized secret assignments include password and API-key-style values handled by the existing redaction logic.
- Confluence credentials remain outside source files and generated documentation.

## Measurable acceptance criteria

1. Running a Demo-4 scan against `./bookstore-web-app` produces or identifies the target documentation outputs without scanning repository-wide files outside that folder.
2. A missing `README.md` is created automatically and contains exactly one valid start marker and exactly one valid end marker.
3. A missing `API_DOCS.md` is created automatically and contains exactly one valid start marker and exactly one valid end marker.
4. For an existing marked file, text outside `<!-- DOC-SYNC-START -->` and `<!-- DOC-SYNC-END -->` remains byte-for-byte unchanged after synchronization.
5. Generated marker content accurately lists each detected supported endpoint with method, path, and source file.
6. Repeated synchronization of unchanged source produces no changed file content and a deterministic result.
7. Any recognized password or API-key value is emitted as `[REDACTED]`; no original matching secret value is present in the generated output.
8. An existing file lacking a complete marker pair is not overwritten and produces an actionable warning.
9. The Demo-4 result identifies `created`, `updated`, `unchanged`, or `blocked` status for each documentation file.
10. Step 1 creates or updates only `requirements.md` and does not create a commit, pull request, Confluence publication, or implementation change.
