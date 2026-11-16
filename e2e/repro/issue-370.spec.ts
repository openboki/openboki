import { expect, test } from "@playwright/test";

const THEMES = ["town-shop", "ai-shu", "ledger-paper", "workbench"];

// 比較の図で、4文字の科目名のチップが箱の幅に負けて2行に折れていた
test.use({ viewport: { width: 1280, height: 800 } });

test("比較の図の「未収入金」が1行で出て、箱からはみ出さない(全テーマ)", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  const guide = page.getByRole("region", { name: "ガイド" });
  const chip = guide.locator("figure li", { hasText: "未収入金" });
  const other = guide.locator("figure li", { hasText: "売掛金" });
  for (const theme of THEMES) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    const h = (await chip.boundingBox())!.height;
    expect(h, theme).toBeLessThanOrEqual((await other.boundingBox())!.height + 1);
    const overflow = await guide.locator("figure li").evaluateAll((els) =>
      els.filter((el) => el.getBoundingClientRect().right > el.parentElement!.getBoundingClientRect().right + 0.5).map((el) => el.textContent),
    );
    expect(overflow, theme).toEqual([]);
  }
});
