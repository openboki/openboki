import { expect, test } from "@playwright/test";

// 用語集の「3帳簿」に、3冊の帳簿の名前の列挙が「別名」として出ていた(history.yamlのaliases)
test("3帳簿の別名に3冊の名前の列挙を出さない", async ({ page }) => {
  await page.goto("/glossary#three_books");
  const entry = page.locator("#three_books");
  await expect(entry).toContainText("3帳簿");
  await expect(entry).not.toContainText("別名: 覚え書き・仕訳帳・元帳");
  // 3冊の名前のどれかを別名にする直し方も防ぐ。3帳簿と覚え書き・仕訳帳・元帳は別の概念
  await expect(entry.getByText(/^別名:/)).toHaveCount(0);
});
