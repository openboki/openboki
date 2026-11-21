import { expect, test } from "@playwright/test";

// Issue #550: 3級パスで買った備品はfive-elementsのコーヒーマシン600,000だけなのに、
// ステップ2で出どころの説明なしに帳簿価額50,000のショーケースを売り、備品がマシンより少ない550,000になっていた。
// 期首の備品を650,000(マシン + 開店後に買い足したショーケース)にし、本文で買い足しを説明する
test("商品以外の後払いと手付金: ショーケースの出どころを本文で説明し、売った後の備品はマシンの600,000に戻る", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const result = page.getByRole("region", { name: "結果" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await expect(guide).toContainText("開店のあとに中古を50,000円で買い足し");
  await expect(result.locator("[data-account=equipment]")).toContainText("650,000");
  await next.click();
  await expect(guide).toContainText(/開店のあと/);
  await work.getByLabel("借方の科目1").fill("未収入金");
  await work.getByLabel("借方の金額1").fill("50000");
  await work.getByLabel("貸方の科目1").fill("備品");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await expect(page.getByText("備品がコーヒーマシンだけの600,000に減り")).toBeVisible();
  await expect(result.locator("[data-account=equipment]")).toContainText("600,000");
});

// 次の単元の期首は、この単元の終わりの残高(備品680,000、現金272,000)と一致する
test("預かったお金、仮のお金: 期首の備品と現金が前の単元の終わりと合う", async ({ page }) => {
  const result = page.getByRole("region", { name: "結果" });
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await expect(result.locator("[data-account=equipment]")).toContainText("680,000");
  await expect(result.locator("[data-account=cash]")).toContainText("272,000");
});
