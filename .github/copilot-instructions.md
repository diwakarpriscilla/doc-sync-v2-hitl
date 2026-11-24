# 8-Step Agentic SDLC: Human Approval Required

## Global HITL rule

At the end of **every** step (Steps 1–8), show a clear preview or summary of the current step's work and ask exactly:

**Do you approve Step [X], or would you like changes?**

Do not begin the next step until the user explicitly approves the current step. If the user requests changes, refine only the current step, show the revised preview, and ask again.

Never publish to Confluence, commit to Git, or merge a pull request without explicit human approval for the relevant step. An approval applies only to the current step and the exact actions previewed for it; it does not approve a later step or an unpreviewed side effect. Do not treat silence, prior approvals, configuration, or an agent's own `--approved` argument as approval.

Before an external side effect, preview the exact action and obtain explicit approval for that action. After completing it, show the result and still perform the required end-of-step pause using the exact question above.

## Strict manual handoff

When the user replies **`Approved`** to a step, approval applies only to that current step and its previewed actions. Finish that step, commit only that step's work, and do not start, invoke, or prepare the next step or agent.

After confirming the step's work and commit, stop completely and output exactly:

`Step [X] is complete. Please invoke the next agent from your playbook when ready.`

For Step 2 and Step 7, the step approval also authorizes the exact previewed Confluence publication. Publish that page before committing and stopping; do not request a second publication approval. For other external actions, keep their existing separate approval gates. A later-step approval never carries forward.

## Step sequence

1. **Requirements (`@requirements-agent`)** — read the User Story from Confluence, ask the four standardized A/B questions, and create `requirements.md`.
2. **Architecture (`@architect-agent`)** — create `architecture.md` with visual Mermaid diagrams. Label the user role **Bookstore Storefront Manager**. After Step 2 approval, publish `[Demo-x] Automated Documentation Sync - Architecture` to Confluence with the rendered Mermaid diagram image, then commit Step 2 and stop.
3. **Design review (`@reviewer-agent`)** — review `architecture.md` against the approved requirements and save `design-review.md`.
4. **Implementation plan (`Agent`)** — create a dependency-ordered task list in `impl-plan.md`.
5. **Implementation (`Agent`)** — build or update the Bookstore Web App, `docSync.js`, and `resetDemo.js` according to the approved plan.
6. **Peer code review (`@reviewer-agent`)** — conduct the seven-point review of the implementation.
7. **QA (`@qa-agent`)** — create Gherkin `.feature` tests and execute Playwright checks. After Step 7 approval, publish `[Demo-x] Automated Documentation Sync - QA Test Plan and Execution Summary` to Confluence, then commit Step 7 and stop.
8. **Release (`@release-agent`)** — deploy locally; prepare and publish the Deployment Guide and Release Notes; commit tracked changes while excluding `node_modules/` and `.env`; create the PR; and merge only after separate explicit merge approval.

At every step, state what was actually completed versus what remains planned. Do not claim that a remote action succeeded unless it was performed and confirmed.

The owning agent must follow the numbered sequence above. Do not reuse stale step numbers in reports, prompts, filenames, or publication descriptions.

## Confluence and secrets

- Read credentials only from the ignored `.env` file or the documented environment variables. Never print, echo, commit, or include credentials in reports.
- Use `scripts/confluencePublisher.js` for Confluence reads and writes.
- A Confluence write requires the user's explicit approval for that publication step and the helper's `--approved` flag.
- If an integration fails, report a sanitized error and stop before retrying or substituting credentials.
- Keep `.env` out of Git; do not copy credentials into MCP configuration, source code, or documentation.
