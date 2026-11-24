const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const cliPath = path.join(repositoryRoot, "docSync.js");
const resetDemoPath = path.join(repositoryRoot, "resetDemo.js");
const fixedTarget = path.join(repositoryRoot, "bookstore-web-app");

test("fixed Demo-4 target reports deterministic status and generated API docs", () => {
  const result = spawnSync(process.execPath, [cliPath, fixedTarget], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Scanned 2 JavaScript file(s)");
  expect(result.stdout).toContain("Discovered 2 endpoint(s)");
  expect(result.stderr).toContain("README.md");
  expect(result.stderr).toContain("blocked");
  expect(result.stdout).toContain("Unchanged API_DOCS.md");

  const apiDocs = fs.readFileSync(path.join(fixedTarget, "API_DOCS.md"), "utf8");
  expect(apiDocs).toContain("| GET | /api/books | server.js |");
  expect(apiDocs).toContain("| POST | /api/books | server.js |");
});

test("custom target outside Demo-4 is rejected", () => {
  const projectFolder = fs.mkdtempSync(path.join(os.tmpdir(), "demo-4-custom-"));
  try {
    fs.writeFileSync(path.join(projectFolder, "server.js"), 'app.get("/api/custom", () => {});\n');
    const result = spawnSync(process.execPath, [cliPath, projectFolder], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("fixed Demo-4 target");
    expect(fs.existsSync(path.join(projectFolder, "README.md"))).toBe(false);
    expect(fs.existsSync(path.join(projectFolder, "API_DOCS.md"))).toBe(false);
  } finally {
    fs.rmSync(projectFolder, { recursive: true, force: true });
  }
});

test("temporary marked project preserves notes and creates missing docs", () => {
  const projectFolder = fs.mkdtempSync(path.join(os.tmpdir(), "demo-4-doc-sync-"));
  const readmeBefore = "# Temporary Project\n\nHuman before.\n\n<!-- DOC-SYNC-START -->\nold\n<!-- DOC-SYNC-END -->\n\nHuman after.\n";
  try {
    fs.writeFileSync(path.join(projectFolder, "README.md"), readmeBefore);
    fs.writeFileSync(
      path.join(projectFolder, "server.js"),
      'const app = {};\napp.get("/api/preview", () => {});\n',
    );

    const output = execFileSync(process.execPath, [cliPath, projectFolder], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    const readme = fs.readFileSync(path.join(projectFolder, "README.md"), "utf8");
    const apiDocs = fs.readFileSync(path.join(projectFolder, "API_DOCS.md"), "utf8");

    expect(output).toContain("Scanned 1 JavaScript file");
    expect(output).toContain("Discovered 1 endpoint");
    expect(readme).toContain("Human before.");
    expect(readme).toContain("Human after.");
    expect(readme).toContain("| GET | /api/preview | server.js |");
    expect(apiDocs).toContain("| GET | /api/preview | server.js |");
  } finally {
    fs.rmSync(projectFolder, { recursive: true, force: true });
  }
});

test("recognized secret values are absent from CLI and Markdown", () => {
  const projectFolder = fs.mkdtempSync(path.join(os.tmpdir(), "demo-4-secrets-"));
  try {
    fs.writeFileSync(
      projectFolder + "/secret.js",
      'const DB_PASSWORD = "qa-private-db"; const JWT_SECRET = "qa-private-jwt"; const API_TOKEN = "qa-private-api";\n',
    );

    const output = execFileSync(process.execPath, [cliPath, projectFolder], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    const apiDocs = fs.readFileSync(path.join(projectFolder, "API_DOCS.md"), "utf8");
    for (const secret of ["qa-private-db", "qa-private-jwt", "qa-private-api"]) {
      expect(output).not.toContain(secret);
      expect(apiDocs).not.toContain(secret);
    }
  } finally {
    fs.rmSync(projectFolder, { recursive: true, force: true });
  }
});

test.beforeEach(async ({ page }) => {
  execFileSync(process.execPath, [resetDemoPath], { cwd: repositoryRoot, encoding: "utf8" });
  await page.goto("/");
});

test("generated bookstore HTML preview displays the starter catalog", async ({ page }) => {
  await expect(page).toHaveTitle("Bookstore");
  await expect(page.getByRole("heading", { name: "Find your next favorite book." })).toBeVisible();
  await expect(page.locator(".book-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "The Midnight Library" })).toBeVisible();
});

test("resetDemo.js restores the starter catalog and preserves documentation", async ({ page }) => {
  await page.getByLabel("Title").fill("Demo-4 Temporary Book");
  await page.getByLabel("Author").fill("QA Author");
  await page.getByLabel("Category").fill("Testing");
  await page.getByRole("button", { name: "Add book" }).click();
  await expect(page.locator(".book-card")).toHaveCount(4);

  const readmeBefore = fs.readFileSync(path.join(fixedTarget, "README.md"), "utf8");
  const apiBefore = fs.readFileSync(path.join(fixedTarget, "API_DOCS.md"), "utf8");
  const output = execFileSync(process.execPath, [resetDemoPath], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  expect(output).toContain("Demo reset complete: 3 starter books");

  await page.reload();
  await expect(page.locator(".book-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Demo-4 Temporary Book" })).toHaveCount(0);
  expect(fs.readFileSync(path.join(fixedTarget, "README.md"), "utf8")).toBe(readmeBefore);
  expect(fs.readFileSync(path.join(fixedTarget, "API_DOCS.md"), "utf8")).toBe(apiBefore);

  const catalog = JSON.parse(
    fs.readFileSync(path.join(fixedTarget, "data", "books.json"), "utf8"),
  );
  expect(catalog).toHaveLength(3);
});
