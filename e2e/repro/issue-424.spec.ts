import { expect, test } from "@playwright/test";

// 小切手で払う取引に付く誤解の見方が、減る資産を「現金」と言わない
test("小切手で払う ステップ3で費用を増えると予想しても、見方が現金が減ると言わない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  await page.goto("/units/cash-and-deposits/checking-account");
  await next.click();
  await work.getByLabel("借方の科目1").fill("当座預金");
  await work.getByLabel("借方の金額1").fill("200000");
  await work.getByLabel("貸方の科目1").fill("普通預金");
  await work.getByLabel("貸方の金額1").fill("200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  for (const [n, v] of [
    ["資産", "減る"],
    ["負債", "減る"],
    ["純資産", "変わらない"],
    ["収益", "変わらない"],
    ["費用", "増える"],
  ]) {
    await work.getByLabel(`${n}の予想`, { exact: true }).selectOption({ label: v });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("支払いのときにもう一度仕入");
  await expect(status).not.toContainText("現金(資産)が減る");
});
