import { expect, test } from "@playwright/test";

// Issue #380: テーマのページは「前提となる単元は各単元の冒頭に示します」と書くが、単元に前提が出なかった
test("テーマのページの案内どおり、単元の冒頭に前提の単元がリンクで出る", async ({ page }) => {
  await page.goto("/topics/receivables-and-payables");
  await expect(page.getByText("前提となる単元は各単元の冒頭に示します。")).toBeVisible();
  await page.getByRole("link", { name: /商品以外の後払いと手付金/ }).click();
  await page.waitForURL(/other-receivables-and-payables/);
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByText("前提:")).toBeVisible();
  await expect(guide.getByRole("link", { name: /貸したお金、借りたお金/ })).toHaveAttribute("href", "/units/receivables-and-payables/loans");
  await expect(guide.getByRole("link", { name: /掛けで売る、掛けで買う/ })).toHaveAttribute("href", "/units/merchandise/credit-transactions");
});

test("requiresが空の単元には前提を出さない", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(guide.getByText("前提:")).toHaveCount(0);
});
