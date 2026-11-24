const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repositoryRoot = path.resolve(__dirname, "..", "..");

test("CLI reports a custom scan and generates Markdown API documentation", async () => {
  const projectFolder = fs.mkdtempSync(path.join(os.tmpdir(), "demo-3-doc-sync-"));
  const readmeBefore = "# Temporary Project\n\nHuman note before.\n\n<!-- DOC-SYNC-START -->\nold content\n<!-- DOC-SYNC-END -->\n\nHuman note after.\n";
  try {
    fs.writeFileSync(path.join(projectFolder, "README.md"), readmeBefore);
    fs.writeFileSync(
      path.join(projectFolder, "server.js"),
      'const app = {};\napp.get("/api/preview", () => {});\n',
    );

    const output = execFileSync(
      process.execPath,
      [path.join(repositoryRoot, "docSync.js"), projectFolder],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    const readme = fs.readFileSync(path.join(projectFolder, "README.md"), "utf8");
    const apiDocs = fs.readFileSync(path.join(projectFolder, "API_DOCS.md"), "utf8");

    await test.step("capture and verify the CLI report", async () => {
      expect(output).toContain("Scanned 1 JavaScript file(s):");
      expect(output).toContain("- server.js");
      expect(output).toContain("Discovered 1 endpoint(s)");
      expect(output).toContain("Updated README.md generated section.");
      expect(output).toContain("Created API_DOCS.md generated section.");
    });

    await test.step("verify the generated Markdown and preserved human notes", async () => {
      expect(apiDocs).toContain("| GET | /api/preview | server.js |");
      expect(readme).toContain("Human note before.");
      expect(readme).toContain("Human note after.");
      expect(readme).toContain("| GET | /api/preview | server.js |");
    });
  } finally {
    fs.rmSync(projectFolder, { recursive: true, force: true });
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the baseline bookstore view remains available after demo additions", async ({ page }) => {
  await test.step("verify the browser-rendered bookstore preview", async () => {
    await expect(page).toHaveTitle("Bookstore");
    await expect(page.getByRole("heading", { name: "Find your next favorite book." })).toBeVisible();
    await expect.poll(async () => page.locator(".book-card").count()).toBeGreaterThanOrEqual(3);
    await expect(page.getByText("Version 1.0 - Baseline")).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Midnight Library" })).toBeVisible();
  });
});

test("catalog search still finds the starter books after demo additions", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search books" }).fill("Atomic");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Atomic Habits" })).toBeVisible();
});
