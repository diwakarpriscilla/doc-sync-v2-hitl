# 8-Step Agentic SDLC: Human Approval Required

## Global HITL rule

Always pause at the end of **every** step (Steps 1–8). Show a clear preview or summary of what was created, changed, or is planned for the next action, then ask exactly:

**Do you approve Step [X], or would you like changes?**

Do not begin the next step until the user explicitly approves the current step. If the user requests changes, refine only the current step, show the revised preview, and ask again.

Never publish to Confluence, commit to Git, or merge a pull request without explicit human approval for the relevant step. An approval for one step does not approve any later step or external side effect. Do not treat silence, prior approvals, configuration, or an agent's own `--approved` argument as approval.

Before an external side effect, preview the exact action and obtain explicit approval for that action. After completing it, show the result and still perform the required end-of-step pause using the exact question above.

## Step sequence

1. **Requirements (`@requirements-agent`)** — read the User Story from Confluence, ask the four standardized A/B questions, and create `requirements.md`.
2. **Architecture (`@architect-agent`)** — create `architecture.md` with visual Mermaid diagrams. Label the user role **Bookstore Storefront Manager** and publish the visual diagram to Confluence only after explicit publication approval.
3. **Design review (`@reviewer-agent`)** — review `architecture.md` against the approved requirements and save `design-review.md`.
4. **Implementation plan (`Agent`)** — create a dependency-ordered task list in `impl-plan.md`.
5. **Implementation (`Agent`)** — build or update the Bookstore Web App, `docSync.js`, and `resetDemo.js` according to the approved plan.
6. **Peer code review (`@reviewer-agent`)** — conduct the seven-point review of the implementation.
7. **QA (`@qa-agent`)** — create Gherkin `.feature` tests, execute Playwright checks, and publish the QA Test Plan & Execution Summary to Confluence after explicit publication approval.
8. **Release (`@release-agent`)** — deploy locally; prepare and publish the Deployment Guide and Release Notes; commit tracked changes while excluding `node_modules/` and `.env`; create the PR; and merge only after explicit Step 8 approval.

At every step, state what was actually completed versus what remains planned. Do not claim that a remote action succeeded unless it was performed and confirmed.

The owning agent must follow the numbered sequence above. Do not reuse stale step numbers in reports, prompts, filenames, or publication descriptions.

## Confluence and secrets

- Read credentials only from the ignored `.env` file or the documented environment variables. Never print, echo, commit, or include credentials in reports.
- Use `scripts/confluencePublisher.js` for Confluence reads and writes.
- A Confluence write requires the user's explicit approval for that publication step and the helper's `--approved` flag.
- If an integration fails, report a sanitized error and stop before retrying or substituting credentials.
- Keep `.env` out of Git; do not copy credentials into MCP configuration, source code, or documentation.
