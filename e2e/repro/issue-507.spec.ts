import { expect, test } from "@playwright/test";

// Issue #507: 単元の期首で前の単元の最後から現金が50,000減り支払家賃が50,000増えているのに、ステップ1の本文がその理由(月末の家賃)を説明していなかった
for (const unit of ["merchandise/credit-transactions", "merchandise/returns-and-costs"]) {
  test(`${unit} の最初のステップが、期首に増えた家賃を説明する`, async ({ page }) => {
    await page.goto(`/units/${unit}`);
    const result = page.getByRole("region", { name: "結果" });
    await expect(result.getByText("支払家賃")).toBeVisible();
    await expect(page.getByRole("region", { name: "ガイド" })).toContainText("家賃");
  });
}

// 返品と運賃は損失から始まる単元なので、ステップ1で当期純損失の語を用語リンク付きでおさらいする(定義は「掛けで売る、掛けで買う」ステップ2。#625)
test("merchandise/returns-and-costs の最初のステップが、損失で始まる理由と当期純損失を説明する", async ({ page }) => {
  await page.goto("/units/merchandise/returns-and-costs");
  await expect(page.getByRole("region", { name: "損益計算書" }).getByText("当期純損失")).toBeVisible();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByRole("button", { name: "当期純損失" })).toBeVisible();
});
