import { expect, test } from "@playwright/test";

// 「5つの要素と仕訳」の売上で貸方を借入金・資本金にすると、feedbackだけが出て誤解「売上の代金を元手や借入金と書く」が付かない
test("最初の単元の売上で貸方を借入金・資本金にすると、売上の代金を元手や借入金と書く誤解が付く", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const status = page.getByRole("status");
  const next = page.getByRole("button", { name: "次へ →" });
  const post = async (debit: string, credit: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await page.goto("/units/bookkeeping-basics/five-elements");
  await next.click();
  await post("現金", "資本金", "1000000");
  await expect(status.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await work.getByLabel("資産の予想", { exact: true }).selectOption({ label: "変わらない" });
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await post("現金", "借入金", "300000");
  await expect(status.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  for (const credit of ["借入金", "資本金"]) {
    await post("現金", credit, "80000");
    await expect(status.getByText("もう一歩", { exact: true })).toBeVisible();
    await expect(status).toContainText("売上の代金を元手や借入金と書く");
  }
});
