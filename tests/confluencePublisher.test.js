"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  markdownToStorage,
  prepareContent,
  uploadAttachment,
} = require("../scripts/confluencePublisher");

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

test("uploads new diagrams and replaces existing Confluence attachments", async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "confluence-publisher-test-"));
  const filePath = path.join(tempDir, "diagram.svg");
  fs.writeFileSync(filePath, "<svg></svg>");
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  for (const existing of [false, true]) {
    const calls = [];
    global.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      const data = options.method === "GET"
        ? { results: existing ? [{ id: "77", title: "mermaid-diagram-1.svg" }] : [] }
        : { results: [] };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(data),
      };
    };

    await uploadAttachment(
      { baseUrl: "https://example.atlassian.net/wiki", email: "user", token: "token" },
      "8585256",
      { filePath, filename: "mermaid-diagram-1.svg" },
    );

    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /child\/attachment\?filename=mermaid-diagram-1\.svg$/);
    assert.equal(calls[1].options.method, "POST");
    assert.equal(calls[1].options.headers["X-Atlassian-Token"], "no-check");
    assert.ok(calls[1].options.body instanceof FormData);
    assert.equal(calls[1].options.body.get("file").name, "mermaid-diagram-1.svg");
    assert.match(
      calls[1].url,
      existing ? /child\/attachment\/77\/data$/ : /child\/attachment$/,
    );
  }
});
