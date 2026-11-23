"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const { markdownToStorage, prepareContent } = require("../scripts/confluencePublisher");

test("turns Mermaid fences into Confluence attachment embeds", () => {
  const markdown = "# Diagram\n\n```mermaid\nflowchart LR\n  A --> B\n```\n";
  const storage = markdownToStorage(markdown, ["mermaid-diagram-1.svg"]);

  assert.match(storage, /<ac:image ac:alt="Mermaid diagram 1">/);
  assert.match(storage, /<ri:attachment ri:filename="mermaid-diagram-1\.svg" \/>/);
  assert.doesNotMatch(storage, /flowchart LR/);
  assert.throws(() => markdownToStorage(markdown), /must be rendered/);
});

test("renders Mermaid diagrams to SVG and cleans temporary files", () => {
  const prepared = prepareContent(
    "```mermaid\nflowchart LR\n  A[Manager] --> B[Storefront]\n```\n",
  );
  const [diagram] = prepared.diagrams;

  try {
    assert.equal(prepared.diagrams.length, 1);
    assert.match(fs.readFileSync(diagram.filePath, "utf8"), /<svg[\s>]/);
    assert.match(prepared.storage, /mermaid-diagram-1\.svg/);
  } finally {
    prepared.cleanup();
  }
  assert.equal(fs.existsSync(diagram.filePath), false);
});
