import { expect, test } from "@playwright/test";

// Issue #392: 定額法の初年度計算で残存価額の持ち越し・耐用年数で割り忘れ、マシンの記帳で2台分の合計にすると、汎用文しか出なかった
test("定額法の月割りと2台分の合計の誤答に、取り違えを言う説明が出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const generic = page.getByText(/まだ合っていません|科目は合っています。金額をもう一度/);
  // 本文にも「残存価額」「耐用年数」があるので、説明文は結果の箱の中で探す
  const result = page.getByRole("status").filter({ hasText: "もう一歩" });
  await page.goto("/units/depreciation/straight-line");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("車両運搬具");
  await work.getByLabel("借方の金額1").fill("1200000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("1200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await work.getByRole("slider", { name: /耐用年数/ }).fill("6");
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await work.getByRole("slider", { name: /残存価額/ }).fill("300000");
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  const amount = work.getByPlaceholder(/金額/);
  for (const [value, words] of [
    ["75000", /残存価額/],
    ["600000", /耐用年数/],
  ] as const) {
    await amount.fill(value);
    await work.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
    await expect(generic).toHaveCount(0);
    await expect(result.getByText(words)).toBeVisible();
  }
  await amount.fill("100000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  for (const [element, label] of [
    ["資産", "減る"],
    ["負債", "変わらない"],
    ["純資産", "減る"],
    ["収益", "変わらない"],
    ["費用", "増える"],
  ]) {
    await work.getByRole("combobox", { name: `${element}の予想`, exact: true }).selectOption({ label });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await work.getByLabel("借方の科目1").fill("減価償却費");
  await work.getByLabel("借方の金額1").fill("150000");
  await work.getByLabel("貸方の科目1").fill("備品減価償却累計額");
  await work.getByLabel("貸方の金額1").fill("150000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(generic).toHaveCount(0);
  await expect(page.getByText("よくある思い込み: 累計額はどの資産の分でもよい")).toBeVisible();
});
