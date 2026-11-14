import { expect, test } from "@playwright/test";

// debugで正しい行を選び、科目と金額は合っていて貸借だけ逆のとき、「科目を見直す」と案内しない
test("debugの貸借逆に科目違いの説明を出さない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const fill = async (debit: [string, number], credit: [string, number]) => {
    await work.getByLabel("借方の科目1").fill(debit[0]);
    await work.getByLabel("借方の金額1").fill(String(debit[1]));
    await work.getByLabel("貸方の科目1").fill(credit[0]);
    await work.getByLabel("貸方の金額1").fill(String(credit[1]));
  };
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await next.click();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await fill(["ジョヴァンニ", 60], ["胡椒(アレクサンドリア航海)", 60]);
  await work.getByRole("button", { name: "記帳する" }).click();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await work.getByRole("radio").nth(2).check();
  await fill(["ワイン(クレタ航海)", 50], ["ジョヴァンニ", 50]);
  await work.getByRole("button", { name: "確認する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("使っている科目を見直しましょう");
  await expect(status).toContainText("借方と貸方が逆です");
});
