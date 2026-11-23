const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const resetDemoPath = path.join(repositoryRoot, "resetDemo.js");

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
  execFileSync(process.execPath, [resetDemoPath], { cwd: repositoryRoot, encoding: "utf8" });
  await page.goto("/");
});

test("the generated bookstore HTML preview displays the starter catalog", async ({ page }) => {
  await test.step("verify the browser-rendered bookstore preview", async () => {
    await expect(page).toHaveTitle("Bookstore");
    await expect(page.getByRole("heading", { name: "Find your next favorite book." })).toBeVisible();
    await expect(page.locator(".book-card")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "The Midnight Library" })).toBeVisible();
  });
});

test("a reader adds a book and finds it with catalog search", async ({ page }) => {
  await page.getByLabel("Title").fill("Demo-3 QA Book");
  await page.getByLabel("Author").fill("QA Author");
  await page.getByLabel("Category").fill("Testing");
  await page.getByRole("button", { name: "Add book" }).click();

  await expect(page.getByText("Demo-3 QA Book was added to the catalog.")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search books" }).fill("Demo-3 QA Book");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Demo-3 QA Book" })).toBeVisible();
});

test("resetDemo.js restores the starter catalog after a book is added", async ({ page }) => {
  await page.getByLabel("Title").fill("Temporary Reset Book");
  await page.getByLabel("Author").fill("QA Author");
  await page.getByLabel("Category").fill("Testing");
  await page.getByRole("button", { name: "Add book" }).click();
  await expect(page.locator(".book-card")).toHaveCount(4);

  const output = execFileSync(process.execPath, [resetDemoPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  expect(output).toContain("Demo reset complete: 3 starter books");

  await page.reload();
  await expect(page.locator(".book-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Temporary Reset Book" })).toHaveCount(0);
  const catalog = JSON.parse(
    fs.readFileSync(path.join(repositoryRoot, "bookstore-web-app", "data", "books.json"), "utf8"),
  );
  expect(catalog).toHaveLength(3);
  expect(catalog.map((book) => book.title)).toEqual([
    "The Midnight Library",
    "Atomic Habits",
    "The Creative Act",
  ]);
});
