import { expect, test } from "@playwright/test";

// 売上90,000 − 仕入50,000を「商品のもうけ」と言い切らず、売れ残りが無い場合という条件を付けること
test("仕入と売上 ステップ4・5: 売上−仕入を商品のもうけと言い切らない", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const status = page.getByRole("status");
  const post = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByText("できました", { exact: true })).toBeVisible();
  };

  await page.goto("/units/merchandise/three-account-method");
  await next.click();
  await post("仕入", "現金", "30000");
  await next.click();
  for (const [label, value] of [["資産", "減る"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]]) {
    await work.getByLabel(`${label}の予想`, { exact: true }).locator("visible=true").selectOption({ label: value });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await post("現金", "売上", "90000");
  // ステップ4の成功文: 差を「商品のもうけ」と言い切らず、売れ残りの条件を付ける
  await expect(status.filter({ hasText: "今月の豆と菓子の売上90,000" })).toContainText("売れ残り");
  await expect(status.filter({ hasText: "差が、商品のもうけです" })).toHaveCount(0);

  await next.click();
  // ステップ5の見出しと本文: 「商品のもうけ」を見出しにしない
  await expect(guide.getByRole("heading", { name: "商品のもうけ" })).toHaveCount(0);
  await expect(guide).toContainText("売れ残り");

  await work.getByPlaceholder("金額(円)").fill("40000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  const success = status.filter({ hasText: "40,000" });
  await expect(success).toBeVisible();
  await expect(success).toContainText("売れ残りが無ければ");
  await expect(success).not.toContainText("商品のもうけは40,000円");
});
