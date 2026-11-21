import { expect, test } from "@playwright/test";

// Issue #510: 2年目の決算の単元の次に来る「金庫のお金が合わない」が、時点を戻したことを示さずに2年目の春を始め、
// 前の単元の期首にあった繰越商品が貸借対照表から消える理由も書いていなかった
test("金庫のお金が合わないの冒頭が、売れ残りと売上原価より前の場面だと示す", async ({ page }) => {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  await expect(page.getByRole("region", { name: "ガイド" })).toContainText("2年目の決算の日");

  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toContainText("2年目の春");
  await expect(guide).toContainText(/時間を戻|さかのぼ/);
  await expect(guide).toContainText("商品を載せていません");
});
