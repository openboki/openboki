import { expect, test } from "@playwright/test";

// flowは手順の流れを描く図なので、「豆の代金50,000 ↓ 運賃2,000 ↓ 仕入52,000」と並べると
// 代金が運賃に変わる順序に読め、足し算が伝わらない。足す2つは1つのノードにまとめる(売上原価の単元と同じ書き方)
test("返品と運賃 ステップ2の図は足し算を手順の矢印でつながない", async ({ page }) => {
  await page.goto("/units/merchandise/returns-and-costs");
  const guide = page.getByRole("region", { name: "ガイド" });
  await guide.waitFor();
  const skip = page.getByRole("button", { name: "今はしない" });
  if (await skip.count()) await skip.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const fig = guide.locator("figure").first();
  await expect(fig).toContainText("52,000");
  await expect(fig).toContainText("豆の代金50,000 + 運賃2,000");
  // 「豆の代金」と「運賃」が別々のノードとして矢印(横並びの→と縦並びの↓)でつながっていない
  await expect(fig).not.toContainText(/豆の代金50,000[\s→↓]+運賃2,000/);
});
