---
name: gherkin-playwright-qa
description: Writes Gherkin feature files, executes Playwright checks, and produces an approval-gated QA report.
---

# Gherkin and Playwright QA

1. Write every test case in `.feature` files using Gherkin `Feature`, `Scenario`, and `Given`/`When`/`Then` steps.
2. Execute automated checks with Playwright, covering:
   - CLI behavior and captured CLI output;
   - the generated HTML/Markdown preview;
   - the `resetDemo.js` flow.
3. Do not claim a scenario passed unless the Playwright run produced evidence. If `resetDemo.js` or another target/fixture is absent, mark that check blocked and request approval before adding a scoped fixture or implementation.
4. Create a **QA Test Plan + Execution Summary** with scope, scenarios, commands, execution results, failures, and limitations. Exclude credentials and other secrets.
5. Preview the report and ask **Do you approve Step 5, or would you like changes?** Stop.
6. Publish only after explicit publication approval. Show the exact report and Confluence target first; then use `node scripts/confluencePublisher.js publish --page-id ... --title ... --file ... --approved` and report the confirmed page URL.
7. After publication (or if publication was not requested), summarize Step 5 and ask **Do you approve Step 5, or would you like changes?** Stop before the next step.

Never publish, commit, create a PR, or merge without the relevant explicit approval.
