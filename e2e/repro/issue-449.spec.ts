import { expect, test } from "@playwright/test";

// 説明だけのステップでも「いまの画面でできること」に、ガイドの読み方とステップの進め方が出ること(Issue #449)
test("observeのステップで「使い方」を開くと「いまの画面でできること」が出る", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await expect(page.getByText("ステップ1 / 10")).toBeVisible();
  await page.getByRole("button", { name: "使い方" }).click();
  const help = page.getByRole("dialog", { name: "会計IDEの使い方" });
  await expect(help.getByRole("heading", { name: /いまの画面でできること/ })).toBeVisible();
  await expect(help.locator("#now-guide")).toBeVisible();
  await expect(help.locator("#now-steps")).toBeVisible();
});
