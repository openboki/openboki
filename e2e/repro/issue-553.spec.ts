import { expect, test } from "@playwright/test";

// Issue #553: 複式簿記を「2か所に書く」とだけ言うと、この単元の覚え書き + 人名勘定にも当てはまってしまう
test("覚え書きと人名勘定が複式簿記を「2か所に書く」とだけ説明しない", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await expect(page.getByText("ステップ1 / 7")).toBeVisible();
  await expect(guide.getByText(/2か所に書く複式簿記/)).toHaveCount(0);
  await expect(guide.getByText(/2つのページの左と右に同じ額で書く複式簿記/)).toBeVisible();
});
