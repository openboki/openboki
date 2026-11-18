import { expect, test } from "@playwright/test";

// 当座預金の説明に、定義の無い「当座勘定照合表」を裸で使わない
test("用語集の当座預金で、定義の無い語だけで説明を終えない", async ({ page }) => {
  await page.goto("/glossary#checking_account");
  const entry = page.locator("#checking_account");
  await expect(entry).toContainText("当座預金");
  await expect(entry).not.toContainText("通帳ではなく当座勘定照合表で残高を確かめる");
});
