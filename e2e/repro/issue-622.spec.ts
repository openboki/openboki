import { expect, test } from "@playwright/test";

// 「掛けで売る、掛けで買う」で、ステップ5の回収の右を未収入金にしても、ステップ7の仕分けで仕入を負債に入れても、
// 当てはまる誤解があるのに汎用文だけが出て「よくある思い込み」が付かなかった(Issue #622)
test("掛けの回収で右を未収入金・仕分けで仕入を負債にすると誤解が付く(掛けで売る、掛けで買う ステップ5・7)", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).first().click();
  const post = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await page.goto("/units/merchandise/credit-transactions");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next();
  await post("仕入", "買掛金", "40000");
  await next();
  for (const [el, v] of [["資産", "増える"], ["負債", "変わらない"], ["純資産", "増える"], ["収益", "増える"], ["費用", "変わらない"]]) {
    await work.getByLabel(`${el}の予想`, { exact: true }).selectOption({ label: v });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await work.getByPlaceholder(/^金額\(/).fill("40000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next();

  // ステップ5: 右を未収入金にする
  await post("普通預金", "未収入金", "60000");
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText("よくある思い込み: 商品の後払いも未収入金・未払金")).toBeVisible();

  await post("普通預金", "売掛金", "60000");
  await next();
  await post("買掛金", "現金", "40000");
  await next();

  // ステップ7: 仕入を負債の箱に入れる
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["売掛金", "資産"], ["買掛金", "負債"], ["売上", "収益"], ["仕入", "負債"], ["普通預金", "資産"]]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText("よくある思い込み: 費用と負債の混同")).toBeVisible();
});
