import { expect, test } from "@playwright/test";

// Issue #294: 「売れ残りと売上原価」は2年目の決算。期首の商品は1年目の決算の日の売れ残りだと説明し、
// 結果ペインの繰越商品・支払家賃(1年分)・繰越利益剰余金がその説明と矛盾しないこと
test("売れ残りと売上原価の期首の商品が物語の期と矛盾しない", async ({ page }) => {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  const guide = page.getByRole("region", { name: "ガイド" });
  const result = page.getByRole("region", { name: "結果" });
  await expect(guide).toBeVisible();
  await expect(page.getByText("ステップ1 / 7")).toBeVisible();

  // 本文は、1年目の決算の日に売れ残った豆を2年目に持ち越したと説明する
  await expect(guide).toContainText("1年目の決算の日");
  await expect(guide).toContainText("売れ残");
  await expect(guide).not.toContainText("前の期の決算の日に売れ残り");

  // 貸借対照表: 期首の商品15,000と、1年目のもうけ(繰越利益剰余金)が載る
  const bs = result.locator("section", { hasText: "貸借対照表" }).last();
  await expect(bs).toContainText(/繰越商品\s*15,000/);
  await expect(bs).toContainText("繰越利益剰余金");

  // 損益計算書: 支払家賃は開店4か月分(200,000)ではなく、2年目の12か月分(50,000 × 12)
  const pl = result.locator("section", { hasText: "損益計算書" }).last();
  await expect(pl).toContainText(/支払家賃\s*600,000/);
  await expect(pl).not.toContainText(/支払家賃\s*200,000/);
});
