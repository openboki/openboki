import { test, expect } from "@playwright/test";

// Issue #410: 歴史の3単元が金額の単位「ドゥカート」を説明なしに使い、用語集でも引けなかった
test("歴史の単元で使う通貨「ドゥカート」が定義され、用語集で引ける", async ({ page }) => {
  await page.goto("/glossary");
  const q = page.getByLabel("用語を検索");
  for (const word of ["ドゥカート", "金貨", "通貨"]) {
    await q.fill(word);
    await expect(page.getByText("該当する用語がありません")).toBeHidden();
    await expect(page.locator("main dl > div#ducat")).toBeVisible();
  }
});

test("覚え書きと人名勘定のステップ1でドゥカートの用語を開ける", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await guide.getByRole("button", { name: "ドゥカート", exact: true }).first().click();
  const popover = page.getByRole("dialog", { name: "ドゥカート" });
  await expect(popover).toBeVisible();
  await expect(popover).toContainText("金貨");
});
