import { expect, test, type Locator, type Page } from "@playwright/test";

// Issue #318: 受取利息の誤答に、誤りと合わない「利息も貸したお金の戻り」(貸付金を減らしてしまう)が付いていた
const WRONG_ONE = "よくある思い込み: 利息も貸したお金の戻り";
const RIGHT_ONE = "よくある思い込み: 受取利息は入ってきたお金";

async function openUnit(page: Page) {
  await page.goto("/units/receivables-and-payables/loans");
  const skip = page.getByRole("button", { name: "今はしない" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "次へ →" }).click();
}

async function post(work: Locator, debit: string, credit: string, amount: string) {
  await work.getByLabel("借方の科目1").fill(debit);
  await work.getByLabel("借方の金額1").fill(amount);
  await work.getByLabel("貸方の科目1").fill(credit);
  await work.getByLabel("貸方の金額1").fill(amount);
  await work.getByRole("button", { name: "記帳する" }).click();
}

async function predict(work: Locator, picks: Record<string, string>) {
  for (const [el, v] of Object.entries(picks)) await work.getByLabel(`${el}の予想`, { exact: true }).selectOption(v);
  await work.getByRole("button", { name: "予想して記帳する" }).click();
}

const done = (page: Page) => page.getByText("できました", { exact: true });
const next = (page: Page) => page.getByRole("button", { name: "次へ →" });

test("ステップ3で資産「増える」・収益「変わらない」と予想すると、貸付金を減らす誤解ではなく入金と収益の取り違えが出る", async ({ page }) => {
  await openUnit(page);
  const work = page.getByRole("region", { name: "ワークスペース" });
  await post(work, "貸付金", "普通預金", "100000");
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await predict(work, { 資産: "increase", 負債: "none", 純資産: "none", 収益: "none", 費用: "none" });
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(page.getByText(WRONG_ONE)).toHaveCount(0);
  await expect(page.getByText(RIGHT_ONE)).toBeVisible();
});

test("ステップ3で全部「変わらない」と予想すると、今までどおり貸付金を減らす誤解が出る", async ({ page }) => {
  await openUnit(page);
  const work = page.getByRole("region", { name: "ワークスペース" });
  await post(work, "貸付金", "普通預金", "100000");
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await predict(work, { 資産: "none", 負債: "none", 純資産: "none", 収益: "none", 費用: "none" });
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(page.getByText(WRONG_ONE)).toBeVisible();
});

test("ステップ8で受取利息を資産に入れると、貸付金を減らす誤解ではなく入金と収益の取り違えが出る", async ({ page }) => {
  await openUnit(page);
  const work = page.getByRole("region", { name: "ワークスペース" });
  await post(work, "貸付金", "普通預金", "100000");
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await predict(work, { 資産: "increase", 負債: "none", 純資産: "increase", 収益: "increase", 費用: "none" });
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await post(work, "支払利息", "普通預金", "3000");
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await page.getByRole("button", { name: "わかった" }).click({ timeout: 3000 }).catch(() => {});
  await work.getByRole("textbox").first().fill("3000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await post(work, "普通預金", "貸付金", "100000");
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await predict(work, { 資産: "decrease", 負債: "decrease", 純資産: "none", 収益: "none", 費用: "none" });
  await expect(done(page)).toBeVisible();
  await next(page).click();
  await page.getByRole("button", { name: "わかった" }).click({ timeout: 3000 }).catch(() => {});
  await expect(page.getByText("ステップ8 / 9")).toBeVisible();
  const board = work.getByRole("group", { name: "仕分けボード" });
  const put = async (item: string, box: RegExp) => {
    await board.getByRole("button", { name: item, exact: true }).click();
    await board.getByRole("button", { name: box }).first().click();
  };
  await put("貸付金", /資産/);
  await put("借入金", /負債/);
  await put("受取利息", /資産/);
  await put("支払利息", /費用/);
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(page.getByText(WRONG_ONE)).toHaveCount(0);
  await expect(page.getByText(RIGHT_ONE)).toBeVisible();
});
