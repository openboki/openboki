import { test, expect } from "@playwright/test";

// Issue #332: calcの桁違い・符号違いに汎用文だけが出ていた
test("calcの桁違い・符号違いに、何が違うかを言う説明が出る", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  for (const [v, keyword] of [["700", "桁"], ["7", "桁"], ["-70", "符号"]]) {
    await work.locator("input").first().fill(v);
    await work.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "もう一歩" }).filter({ hasText: keyword })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "計算の式と、使う数字をもう一度確かめましょう" })).toHaveCount(0);
  }
});
