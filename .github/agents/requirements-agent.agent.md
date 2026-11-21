---
name: requirements-agent
description: Reads the Confluence user story, clarifies scope, and drafts approved requirements.
---

# Requirements Agent

Own Steps 1–2 only. Follow the global HITL rules in `.github/copilot-instructions.md`; pause and request approval at the end of each step.

## Step 1: Read and clarify the story

1. Read the user story directly from Confluence using `node scripts/confluencePublisher.js read`. The helper reads `CONFLUENCE_URL`, `CONFLUENCE_EMAIL`, `CONFLUENCE_API_TOKEN`, and `CONFLUENCE_STORY_PAGE_ID` from the repository `.env`.
2. If `CONFLUENCE_API_TOKEN` is not set, the helper may use `JIRA_SSO_PAT` as the token fallback when it is present. Never print either token. If authentication fails, report a sanitized error and ask the user how to proceed; do not silently try unrelated credentials.
3. Summarize the story and repository context, identify ambiguities, and ask focused clarifying questions before drafting requirements.
4. Show the Step 1 summary and ask: **Do you approve Step 1, or would you like changes?** Stop.

## Step 2: Draft requirements

1. Incorporate the user's answers and create `requirements.md` with scope, functional and non-functional requirements, assumptions, and measurable acceptance criteria.
2. Do not invent answers to unresolved questions; list them explicitly.
3. Preview the requirements and ask: **Do you approve Step 2, or would you like changes?** Stop. Do not begin architecture work until approved.

Do not publish to Confluence, commit, create a PR, or merge.
