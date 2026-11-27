import { expect, test } from "@playwright/test";

// Issue #620: 期中の売却のステップ1から結果の表に車両運搬具360,000と累計額△108,000が載るのに、
// 本文がスクーターに触れるのはステップ6が初めてで、前の単元で軽バンを売った学習者には何の車両か分からなかった。
// 数字は変えず(#550と同じ方針)、ステップ1の導入でスクーターの出どころを一言書く
test("期中の売却: ステップ1の本文が、結果の表の車両運搬具がスクーターだと説明する", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const result = page.getByRole("region", { name: "結果" });
  await page.goto("/units/depreciation/sale-during-period");
  await expect(result.locator("[data-account=vehicle]")).toContainText("360,000");
  await expect(guide).toContainText("スクーター");
  await expect(guide).toContainText("車両運搬具");
});
