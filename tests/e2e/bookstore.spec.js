const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const booksPath = path.join(repositoryRoot, "bookstore-web-app", "data", "books.json");
const featuredBook = {
  title: "The Pragmatic Programmer",
  author: "Andrew Hunt and David Thomas",
  category: "Programming",
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("homepage shows the baseline catalog and version banner", async ({ page }) => {
  await expect(page).toHaveTitle("Bookstore");
  await expect(page.getByText("Version 1.0 - Baseline")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your next favorite book." })).toBeVisible();
  await expect.poll(async () => page.locator(".book-card").count()).toBeGreaterThanOrEqual(3);
  await expect(page.locator(".book-card")).toHaveCount(
    JSON.parse(fs.readFileSync(booksPath, "utf8")).length,
  );
});

test("catalog search filters books", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search books" }).fill("Atomic");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.getByText("1 book", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atomic Habits" })).toBeVisible();
});

test("Playwright adds and retains The Pragmatic Programmer as a featured arrival", async ({ page }) => {
  let catalog = JSON.parse(fs.readFileSync(booksPath, "utf8"));
  const alreadyAdded = catalog.some((book) => book.title === featuredBook.title);

  if (!alreadyAdded) {
    expect(catalog).toHaveLength(3);
    await page.getByLabel("Title").fill(featuredBook.title);
    await page.getByLabel("Author").fill(featuredBook.author);
    await page.getByLabel("Category").fill(featuredBook.category);
    await page.getByLabel("Featured / New Arrival").check();
    await page.getByRole("button", { name: "Add book" }).click();
    await expect(page.getByText(`${featuredBook.title} was added to the catalog.`)).toBeVisible();
  }

  const featuredCard = page
    .locator(".book-card")
    .filter({ has: page.getByRole("heading", { name: featuredBook.title }) });
  await expect(featuredCard).toBeVisible();
  await expect(featuredCard.getByText("Featured / New Arrival")).toBeVisible();
  await expect(page.locator(".book-card")).toHaveCount(4);

  await page.reload();
  await expect(featuredCard).toBeVisible();
  await expect(featuredCard.getByText("Featured / New Arrival")).toBeVisible();

  catalog = JSON.parse(fs.readFileSync(booksPath, "utf8"));
  expect(catalog).toHaveLength(4);
  expect(catalog.find((book) => book.title === featuredBook.title)).toMatchObject({
    ...featuredBook,
    isNewArrival: true,
  });
});

test("book API rejects missing required fields", async ({ request }) => {
  const response = await request.post("/api/books", {
    data: { title: "Incomplete Book", author: "Test Author", category: " " },
  });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: "category is required." });
});

test("manual reset restores baseline data in an isolated copy", async () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bookstore-reset-test-"));
  const temporaryApp = path.join(temporaryRoot, "bookstore-web-app");
  const temporaryData = path.join(temporaryApp, "data");
  const temporaryReadme = path.join(temporaryApp, "README.md");
  const readme = "# Keep human documentation unchanged.\n";
  try {
    fs.mkdirSync(temporaryData, { recursive: true });
    fs.copyFileSync(path.join(repositoryRoot, "resetDemo.js"), path.join(temporaryRoot, "resetDemo.js"));
    fs.writeFileSync(
      path.join(temporaryData, "books.json"),
      JSON.stringify([
        ...JSON.parse(fs.readFileSync(booksPath, "utf8")),
        { title: "Temporary Extra Book" },
      ]),
    );
    fs.writeFileSync(temporaryReadme, readme);

    execFileSync(process.execPath, [path.join(temporaryRoot, "resetDemo.js")], {
      cwd: temporaryRoot,
      encoding: "utf8",
    });

    const resetCatalog = JSON.parse(fs.readFileSync(path.join(temporaryData, "books.json"), "utf8"));
    expect(resetCatalog).toHaveLength(3);
    expect(fs.readFileSync(temporaryReadme, "utf8")).toBe(readme);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
