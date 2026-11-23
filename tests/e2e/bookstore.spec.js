const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
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
