import { expect, test } from "@playwright/test";

// 問題文で初めて「振り替えた」を使うステップの本文で、その語が説明されているか用語リンクで引ける
// (本文は「移す」、問題文は「振り替えた」で、通しで学ぶ学習者が同じ意味かどうかで迷った)
async function expectTransferExplained(page: import("@playwright/test").Page) {
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toContainText("振り替えた");
  const linked = await guide.getByRole("button", { name: /振替|振り替え/ }).count();
  const explained = /振り替え(る|は|と)/.test((await guide.innerText()).replace(/振り替えた/g, ""));
  expect(linked > 0 || explained).toBe(true);
}

test("売れ残りと売上原価ステップ3で「振り替え」を本文か用語リンクで説明する", async ({ page }) => {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByRole("textbox").first().fill("125000");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / ")).toBeVisible();
  await expectTransferExplained(page);
});

test("金庫のお金が合わないステップ3で「振り替え」を本文か用語リンクで説明する", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金過不足");
  await work.getByLabel("借方の金額1").fill("3000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("3000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / ")).toBeVisible();
  await expectTransferExplained(page);
});
