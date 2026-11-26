import { expect, test } from "@playwright/test";

// 「売れ残りと売上原価」ステップ3で、期首の商品の振替の右を売上にすると、
// 説明は出るが「よくある思い込み」(誤解)が付かなかった(Issue #602)
test("期首の商品の振替で右を売上にした誤答に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });

  // ステップ2: 売上原価を答える
  await next.click();
  await page.getByPlaceholder("金額(円)").fill("125000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();

  // ステップ3: 仕入 / 売上と書く
  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("15000");
  await work.getByLabel("貸方の科目1").fill("売上");
  await work.getByLabel("貸方の金額1").fill("15000");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("売ったわけではありません");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("繰越商品の振替を売買と思う");
});
