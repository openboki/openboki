import { expect, test } from "@playwright/test";

// Issue #417: 箱のラベルが動詞句の仕分けボードでも、確認後の案内と箱に入れたときの読み上げが日本語として読める
test("貸倒れの仕分けボードで逆の箱に入れても、案内が日本語として読める", async ({ page }) => {
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const done = () => expect(page.getByRole("status").getByText("できました")).toBeVisible();
  await page.goto("/units/bad-debts/bad-debt-loss");
  await next();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("売掛金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("売上");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await done();
  await next();
  const predict = { 資産: "decrease", 負債: "none", 純資産: "decrease", 収益: "none", 費用: "increase" };
  for (const [el, v] of Object.entries(predict)) await work.getByLabel(`${el}の予想`, { exact: true }).selectOption(v);
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await done();
  await next();
  const amount = work.getByPlaceholder(/金額/);
  await amount.fill("-18000");
  await amount.press("Enter");
  await done();
  await next();
  await work.getByRole("button", { name: "行を追加" }).first().click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("20000");
  await work.getByLabel("借方の科目2").fill("貸倒損失");
  await work.getByLabel("借方の金額2").fill("30000");
  await work.getByLabel("貸方の科目1").fill("売掛金");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await done();
  await next();
  const board = page.getByRole("group", { name: "仕分けボード" });
  const wrong: [RegExp, RegExp][] = [
    [/倒産/, /貸倒れではない/],
    [/遅れ/, /貸倒れとして処理する/],
    [/返品/, /貸倒れとして処理する/],
    [/夜逃げ/, /貸倒れではない/],
  ];
  for (const [item, box] of wrong) {
    await board.getByRole("button", { name: item }).first().click();
    await board.getByRole("button", { name: box }).first().click();
  }
  // 箱に入れたときの読み上げは「「項目」を「ラベル」の箱に入れました」
  await expect(page.getByRole("status").getByText("「得意先が夜逃げして連絡が取れず、回収をあきらめた」を「貸倒れではない」の箱に入れました", { exact: true })).toBeAttached();
  await page.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").getByText("もう一歩")).toBeVisible();
  const text = (await page.getByRole("status").allTextContents()).join("");
  expect(text).toContain("「得意先の支払いが約束より1か月遅れている」は「貸倒れではない」の箱です。");
  expect(text).not.toContain("処理するです");
  expect(text).not.toContain("ではないです");
  expect(text).not.toContain("ではないに入れました");
});
