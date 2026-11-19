import { expect, test } from "@playwright/test";

// 写し忘れたマッテオの行(90)と、残るジョヴァンニの2行の合計(60 + 30 = 90)が同じ90なので、
// 「右は90だけ」と書くと写し忘れた行が残ったように読める
test("写し忘れの段落が、右に残る合計と写し忘れた行の金額を取り違えさせない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByPlaceholder(/金額/).fill("30");
  await page.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByRole("heading", { name: "写し忘れ" })).toBeVisible();
  await expect(guide).not.toContainText("胡椒のページの右は90だけになり");
  await expect(guide).toContainText("ジョヴァンニへの60と30、合計90だけになり");
  await expect(guide).toContainText("60の損に見えます");
});
