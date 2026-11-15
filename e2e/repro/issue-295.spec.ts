import { expect, test } from "@playwright/test";

// Issue #295: 用語集で「t勘定」と小文字で検索すると0件になっていた
test("用語集の検索は英字の大文字・小文字を区別しない", async ({ page }) => {
  await page.goto("/glossary");
  const q = page.getByLabel("用語を検索");
  await q.fill("t勘定");
  await expect(page.locator("#t_account")).toBeVisible();
  await expect(page.getByText("該当する用語がありません")).toHaveCount(0);
});
