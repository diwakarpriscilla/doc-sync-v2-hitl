const { test, expect } = require("@playwright/test");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

test.beforeEach(async ({ page }) => {
  execFileSync(process.execPath, [path.join(__dirname, "..", "..", "resetDemo.js")]);
  await page.goto("/");
});

test("homepage loads and displays the starter catalog", async ({ page }) => {
  await expect(page).toHaveTitle("Bookstore");
  await expect(page.getByRole("heading", { name: "Find your next favorite book." })).toBeVisible();
  await expect(page.locator(".book-card")).toHaveCount(3);
});

test("catalog search filters books", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search books" }).fill("Atomic");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.getByText("1 book", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atomic Habits" })).toBeVisible();
});

test("a book can be added and found with catalog search", async ({ page }) => {
  await page.getByLabel("Title").fill("Demo Book");
  await page.getByLabel("Author").fill("Test Author");
  await page.getByLabel("Category").fill("Testing");
  await page.getByRole("button", { name: "Add book" }).click();

  await expect(page.getByText("Demo Book was added to the catalog.")).toBeVisible();
  await expect(page.locator(".book-card")).toHaveCount(4);
  await page.getByRole("searchbox", { name: "Search books" }).fill("Demo Book");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Demo Book" })).toBeVisible();
});

test("book API rejects missing required fields", async ({ request }) => {
  const response = await request.post("/api/books", {
    data: { title: "Incomplete Book", author: "Test Author", category: " " },
  });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: "category is required." });
});
