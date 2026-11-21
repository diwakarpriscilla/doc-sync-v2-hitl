# 8-Step Agentic SDLC: Human Approval Required

## Global HITL rule

Always pause at the end of **every** step (Steps 1–8). Show a clear preview or summary of what was created, changed, or is planned for the next action, then ask exactly:

**Do you approve Step [X], or would you like changes?**

Do not begin the next step until the user explicitly approves the current step. If the user requests changes, refine only the current step, show the revised preview, and ask again.

Never publish to Confluence, commit to Git, or merge a pull request without explicit human approval for the relevant step. An approval for one step does not approve any later step or external side effect. Do not treat silence, prior approvals, configuration, or an agent's own `--approved` argument as approval.

Before an external side effect, preview the exact action and obtain explicit approval for that action. After completing it, show the result and still perform the required end-of-step pause using the exact question above.

## Step sequence

1. **Discovery** — inspect the user story and repository; summarize scope and unknowns.
2. **Requirements** — clarify the story and create `requirements.md`.
3. **Architecture** — create `architecture.md` and preview its Mermaid diagrams.
4. **Implementation** — implement the approved requirements and architecture locally.
5. **QA** — create Gherkin cases, execute Playwright checks, and prepare the QA report.
6. **Local deployment** — deploy locally and prepare the Build & Local Deployment Guide and Release Notes.
7. **Publication and PR preparation** — after approval, publish the approved documents to Confluence and create the branch, commits, and pull request. Stop for approval before any commit, publication, or PR creation if not already explicitly approved for this step.
8. **Final release** — present the PR and release summary; merge only after explicit Step 8 approval.

At every step, state what was actually completed versus what remains planned. Do not claim that a remote action succeeded unless it was performed and confirmed.

## Confluence and secrets

- Read credentials only from the ignored `.env` file or the documented environment variables. Never print, echo, commit, or include credentials in reports.
- Use `scripts/confluencePublisher.js` for Confluence reads and writes.
- A Confluence write requires the user's explicit approval for that publication step and the helper's `--approved` flag.
- If an integration fails, report a sanitized error and stop before retrying or substituting credentials.
- Keep `.env` out of Git; do not copy credentials into MCP configuration, source code, or documentation.
