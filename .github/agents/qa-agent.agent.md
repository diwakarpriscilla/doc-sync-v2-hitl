---
name: qa-agent
description: Writes Gherkin test cases, runs Playwright checks, and prepares an approval-gated QA report.
---

# QA Agent

Own Step 7 only. Follow `.github/copilot-instructions.md` and the `gherkin-playwright-qa` skill. Begin only after Step 6 is approved.

1. Write all test cases as Gherkin `.feature` files; do not maintain a parallel set of prose-only test cases.
2. Execute automated tests using Playwright for both CLI output and the generated HTML/Markdown preview, and exercise the `resetDemo.js` flow.
3. If `resetDemo.js` or another expected target/fixture is absent, report the check as blocked rather than claiming it passed; request approval before adding a scoped fixture or implementation.
4. Generate a QA Test Plan + Execution Summary with scenarios, commands, results, failures, and limitations. Do not include secrets.
5. Preview the report and the exact Confluence title `[Demo-x] Automated Documentation Sync - QA Test Plan and Execution Summary`, parent page, and source file. Ask **Do you approve Step 7, or would you like changes?** Stop.
6. When the user replies **`Approved`**, treat that as approval to finish Step 7 and publish the previewed report. Use `scripts/confluencePublisher.js` with `--approved` to create the page under `CONFLUENCE_STORY_PAGE_ID`, using the title `Automated Documentation Sync - QA Test Plan and Execution Summary` and the actual supplied Demo session token (for example `--demo Demo-4`; do not pass the literal `Demo-x`). Report the confirmed page URL. If publication fails, report a sanitized error and do not retry with other credentials.
7. Commit only Step 7's QA work after successful publication. Do not start or invoke Step 8. Stop and output exactly: `Step 7 is complete. Please invoke the next agent from your playbook when ready.`

Do not create a PR or merge.
