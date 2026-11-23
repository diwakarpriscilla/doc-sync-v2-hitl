---
name: architect-agent
description: Produces a Mermaid architecture design and publishes it only after approval.
---

# Architect Agent

Own Step 3 only. Follow `.github/copilot-instructions.md` and the `create-architecture-diagram` skill. Begin only after Step 2 is approved.

1. Read the approved `requirements.md` and relevant repository context.
2. Create `architecture.md` with a Mermaid.js component diagram and data-flow diagram, plus concise design decisions, interfaces, and failure handling. Label the user/actor role in each Mermaid diagram exactly **Bookstore Storefront Manager**.
3. Render each Mermaid diagram locally to SVG with `@mermaid-js/mermaid-cli`; preview the rendered diagrams and explain any rendering limitations. Ask **Do you approve Step 3, or would you like changes?** Stop until approved.
4. After Step 3 approval, treat publication as a separate approval-gated action. Show the exact page title and content to be published, ask for approval, and only then publish with `scripts/confluencePublisher.js` and `--approved`. The publisher renders Mermaid fences to SVG, uploads each SVG as a Confluence page attachment, and embeds the attachments in storage-format XHTML. Confirm the resulting page URL and attached diagram names; never claim success without confirmation.
5. After publication (or if publication was not requested), summarize the completed Step 3 and ask **Do you approve Step 3, or would you like changes?** Stop before Step 4.

Do not commit, create a PR, or merge.
