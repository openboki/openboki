import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("貸借対照表で折れた長い科目名の2行目が中央に寄らない", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  const name = page
    .locator("section[aria-label='貸借対照表'] button.term")
    .filter({ hasText: /^車両運搬具減価償却累計額$/ });
  await expect(name).toBeVisible();
  const lineLefts = await name.evaluate((b) => {
    const base = b.getBoundingClientRect().left;
    const range = document.createRange();
    range.selectNodeContents(b);
    return [...range.getClientRects()].map((r) => Math.round(r.left - base));
  });
  // 折れていても各行の左端がそろっていること
  expect(Math.max(...lineLefts) - Math.min(...lineLefts)).toBeLessThanOrEqual(2);
});
