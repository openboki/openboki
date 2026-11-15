import { test, expect } from "@playwright/test";

test("用語集で用語名の途中まで入れると、名前がその語で始まる項目が先頭に出る", async ({ page }) => {
  await page.goto("/glossary");
  const box = page.getByPlaceholder("用語を検索");
  await box.fill("借入");
  await expect(page.locator("main dt").first()).toContainText("借入金");
  await box.fill("現");
  await expect(page.locator("main dt").first()).toContainText("現金");
});
