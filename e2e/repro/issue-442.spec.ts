import { expect, test } from "@playwright/test";

// 用語「逆仕訳」の定義が「同じ科目・金額で左右だけを入れ替えた」だと、部分返品(52,000の3行に対して10,000の2行)と矛盾する
test("逆仕訳の定義が部分返品(金額の違う逆仕訳)と矛盾しない", async ({ page }) => {
  await page.goto("/units/merchandise/returns-and-costs");
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("52000");
  await work.getByLabel("貸方の科目1").fill("買掛金");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "行を追加" }).nth(1).click();
  await work.getByLabel("貸方の科目2").fill("現金");
  await work.getByLabel("貸方の金額2").fill("2000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  // 本文も、ステップ2の仕訳にある現金2,000の行を落とさず、返した分だけを逆にすると読めること
  await expect(guide).toContainText("運賃2,000");
  await guide.getByRole("button", { name: "逆仕訳", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "逆仕訳" });
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toContainText("同じ科目・金額");
  await expect(dialog).toContainText("取り消す分");
});
