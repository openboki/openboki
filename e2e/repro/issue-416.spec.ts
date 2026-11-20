import { test, expect, type Page } from "@playwright/test";

// 減価償却とは何か ステップ5・8で、総称の「減価償却累計額」が正解になり、備品減価償却累計額と別の行に載って
// 成功文の「累計額が200,000」が表に無かった。総称は正解にせず、資産ごとの科目で書くよう案内する
async function fillEntry(page: Page, debit: string, credit: string, amount: string) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit);
  await work.getByLabel("借方の金額1").fill(amount);
  await work.getByLabel("貸方の科目1").fill(credit);
  await work.getByLabel("貸方の金額1").fill(amount);
  await page.getByRole("button", { name: "記帳する" }).click();
}

test("2年目を総称の減価償却累計額で記帳すると正解にならず、備品減価償却累計額で書くと累計額が200,000にまとまる", async ({ page }) => {
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/depreciation/what-is-depreciation");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await next();
  for (const [k, v] of [["資産", "減る"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]])
    await work.getByLabel(`${k}の予想`).first().selectOption({ label: v });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await page.getByPlaceholder("金額(円)").fill("-260000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next();
  await next();
  await fillEntry(page, "減価償却費", "備品減価償却累計額", "100000");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  const board = page.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["accumulated_depreciation_equipment", "asset"], ["depreciation_expense", "expense"], ["equipment", "asset"], ["loans_payable", "liability"]]) {
    await board.locator(`[data-chip="${chip}"]`).click();
    await board.locator(`[data-drop="${box}"] > button`).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await next();
  await page.getByPlaceholder("金額(円)").fill("500000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next();

  // 総称で書くと正解にならず、1年目と同じ科目で200,000にまとまることを案内する
  await fillEntry(page, "減価償却費", "減価償却累計額", "100000");
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("備品減価償却累計額");
  await expect(status).toContainText("200,000");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toHaveCount(0);

  // 資産ごとの科目で書き直すと、貸借対照表の累計額が1行の△200,000になる
  await fillEntry(page, "減価償却費", "備品減価償却累計額", "100000");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  const bs = page.getByRole("region", { name: "結果" }).locator("section", { hasText: "貸借対照表" }).first();
  await expect(bs).toContainText("200,000");
  await expect(bs.getByText("減価償却累計額", { exact: true })).toHaveCount(0);
});
