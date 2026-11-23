---
name: create-architecture-diagram
description: Creates, previews, and approval-gates architecture.md with Mermaid component and data-flow diagrams.
---

# Create Architecture Diagram

1. Use the approved `requirements.md` and repository evidence; do not invent components or integrations.
2. Create or update `architecture.md` with:
   - a Mermaid `flowchart` or `graph` component diagram;
   - a Mermaid data-flow diagram showing actors, boundaries, and relevant data movement;
   - concise design decisions and failure handling.
3. Check Mermaid syntax, label the user/actor role **Bookstore Storefront Manager**, and render/preview both diagrams locally as SVG using `@mermaid-js/mermaid-cli`. If rendering fails, report the error and do not claim a visual preview.
4. Summarize the file and preview, then ask **Do you approve Step 3, or would you like changes?** Stop until approved.
5. Publish the approved architecture page to Confluence only after explicit publication approval. Show the destination and content before publishing, use `node scripts/confluencePublisher.js publish --page-id ... --title ... --file architecture.md --approved`; the publisher uploads Mermaid SVGs as page attachments and embeds them in the page. Report the confirmed page URL and attachment names.
6. After publication (or if publication was not requested), summarize Step 3 and ask **Do you approve Step 3, or would you like changes?** Stop before the next step.

Never publish, commit, create a PR, or merge without the relevant explicit approval.
