import { expect, test, type Page } from "@playwright/test";

// Issue #414: 行が埋まっていて金額の書き方だけが違うとき、「入力が途中の行」「行を削除」と案内しない
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });
const postButton = (page: Page) => work(page).getByRole("button", { name: "記帳する" });
const INCOMPLETE_HINT = "入力が途中の行があります。科目と金額をそろえるか、その行を削除すると記帳できます。";
const AMOUNT_HINT = "金額欄の案内に沿って金額を直すと記帳できます。";

async function openTutorialStep2(page: Page) {
  await page.goto("/units/tutorial/first-entry");
  await page.getByRole("dialog", { name: "チュートリアル" }).getByRole("button", { name: "スキップ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
}

test("行が埋まっていて金額の形式だけが違うとき、「入力が途中の行」と案内しない", async ({ page }) => {
  await openTutorialStep2(page);
  await work(page).getByLabel("借方の科目1").fill("現金");
  await work(page).getByLabel("借方の金額1").fill("123456789012345678901");
  await work(page).getByLabel("貸方の科目1").fill("資本金");
  await work(page).getByLabel("貸方の金額1").fill("123456789012345678901");
  await work(page).getByLabel("貸方の金額1").blur();
  await expect(work(page).getByText("桁が多すぎます").first()).toBeVisible();
  await expect(work(page).getByText("入力が途中の行があります")).toHaveCount(0);
  await expect(postButton(page)).toBeDisabled();
  await expect(postButton(page)).toHaveAccessibleDescription(AMOUNT_HINT);
});

test("ドゥカートの単元で「100円」と入れても、「入力が途中の行」と案内しない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work(page).getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work(page).getByLabel("借方の金額1").fill("100円");
  await work(page).getByLabel("貸方の科目1").fill("ニッコロ");
  await work(page).getByLabel("貸方の金額1").fill("100円");
  await work(page).getByLabel("貸方の金額1").blur();
  await expect(work(page).getByText("「円」を外して").first()).toBeVisible();
  await expect(work(page).getByText("入力が途中の行があります")).toHaveCount(0);
  await expect(postButton(page)).toHaveAccessibleDescription(AMOUNT_HINT);
});

for (const [account, amount] of [
  ["", "100000"],
  ["資本金", ""],
  ["ぜんぜん無い科目", "100000"],
]) {
  test(`科目「${account}」金額「${amount}」の行には従来の「入力が途中の行」を出す`, async ({ page }) => {
    await openTutorialStep2(page);
    await work(page).getByLabel("借方の科目1").fill("現金");
    await work(page).getByLabel("借方の金額1").fill("100000");
    await work(page).getByLabel("貸方の科目1").fill(account);
    await work(page).getByLabel("貸方の金額1").fill(amount);
    await work(page).getByLabel("貸方の金額1").blur();
    await expect(postButton(page)).toHaveAccessibleDescription(INCOMPLETE_HINT);
  });
}
