import { expect, test } from "@playwright/test";

// Issue #521: 貸借対照表と損益計算書が、定義より先に結果ペインの見出しと図に出ていた
test("カフェを開くのステップ1で2つの表を紹介し、結果の見出しから説明を開ける", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.isVisible()) await later.click();

  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.locator("button.term", { hasText: /^貸借対照表$/ })).toBeVisible();
  await expect(guide.locator("button.term", { hasText: /^損益計算書$/ })).toBeVisible();

  const result = page.getByRole("region", { name: "結果" });
  await result.getByRole("heading", { name: "貸借対照表" }).locator("button.term").click();
  await expect(page.locator('[data-slot=popover-content][aria-label="貸借対照表"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await result.getByRole("heading", { name: "損益計算書" }).locator("button.term").click();
  await expect(page.locator('[data-slot=popover-content][aria-label="損益計算書"]')).toBeVisible();
});
