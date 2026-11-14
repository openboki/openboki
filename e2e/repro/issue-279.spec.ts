import { expect, test } from "@playwright/test";

// Issue #279: 原稿の「[[capital_stock|資本金]] 1,000,000」の半角スペースがそのまま描画され、同じ文の「現金1,000,000」と不揃いだった
test("用語リンクの直後の金額に空白が入らない(5つの要素と仕訳 ステップ2)", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  const prose = page.getByRole("region", { name: "ガイド" }).locator(".prose");
  await expect(prose).toContainText("資本金1,000,000");
  await expect(prose).not.toContainText("資本金 1,000,000");
});
