import { expect, test } from "@playwright/test";

// 用語集の帳簿価額が「取得原価 − 減価償却累計額」だけの定義だと、期中の売却(今年の分も引く)の正解420,000と食い違う
test("帳簿価額の説明が、期中に売る日の帳簿価額(今年の分も引く)と矛盾しない", async ({ page }) => {
  await page.goto("/glossary#book_value");
  const entry = page.locator("[id='book_value']");
  await expect(entry).toBeVisible();
  // 累計額だけを引く定義に限っていないこと(期中の売却で480,000を正当化しない)
  await expect(entry).not.toContainText("取得原価から減価償却累計額を差し引いた金額。");
  // 売る日までの減価償却を引くことと、決算日には累計額を引く形になることの両方を書いている
  await expect(entry).toContainText("その日まで");
  await expect(entry).toContainText("決算日");
});
