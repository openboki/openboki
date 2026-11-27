import { expect, test } from "@playwright/test";

// 「5つの要素と仕訳」ステップ7の仕分けで、前のステップで誤解を付けた取り違えと同じ誤答をしても誤解が付かなかった
test("仕分けで前のステップと同じ取り違えをすると、同じ誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await next.click();
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const post = async (dr: string, cr: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(dr);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(cr);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await post("現金", "資本金", "1000000");
  await next.click();
  await work.getByLabel("資産の予想").selectOption("変わらない");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await post("現金", "借入金", "300000");
  await next.click();
  await post("現金", "売上", "80000");
  await next.click();
  await post("支払家賃", "現金", "50000");
  await next.click();

  const board = work.getByRole("group", { name: "仕分けボード" });
  const base: Record<string, string> = { 現金: "資産", 備品: "資産", 借入金: "負債", 資本金: "純資産", 売上: "収益", 支払家賃: "費用" };
  for (const [account, wrong, name] of [
    ["資本金", "負債", "元手と借入金の混同"],
    ["支払家賃", "資産", "費用と資産の混同"],
    ["売上", "負債", "売上の代金を元手や借入金と書く"],
    ["借入金", "純資産", "元手と借入金の混同"],
  ]) {
    for (const [a, b] of Object.entries({ ...base, [account]: wrong })) {
      await board.getByRole("button", { name: new RegExp(`^${a}`) }).first().click();
      await board.getByRole("button", { name: `${b} ← ここに入れる`, exact: true }).click();
    }
    await work.getByRole("button", { name: "確認する" }).click();
    const status = page.getByRole("status").filter({ hasText: "もう一歩" });
    await expect(status).toContainText(name);
  }
});
