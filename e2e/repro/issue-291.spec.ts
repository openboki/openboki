import { type Page, expect, test } from "@playwright/test";

// Issue #291: 減価償却の成功文と本文が「累計額 −100,000」と書くのに、貸借対照表は「△100,000」と出て、本文の指す行が画面に無かった

const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });
const next = async (page: Page, to: number) => {
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText(`ステップ${to} / 9`)).toBeVisible();
};

test("減価償却の成功文と本文が、貸借対照表と同じ「△100,000」で累計額を指す", async ({ page }) => {
  await page.goto("/units/depreciation/what-is-depreciation");
  await next(page, 2);
  for (const [label, value] of [["資産", "減る"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]]) {
    await work(page).getByLabel(`${label}の予想`, { exact: true }).selectOption({ label: value });
  }
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await next(page, 3);
  await page.getByPlaceholder("金額(円)").fill("-260000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next(page, 4);
  await next(page, 5);
  await work(page).getByLabel("借方の科目1").fill("減価償却費");
  await work(page).getByLabel("借方の金額1").fill("100000");
  await work(page).getByLabel("貸方の科目1").fill("備品減価償却累計額");
  await work(page).getByLabel("貸方の金額1").fill("100000");
  await work(page).getByRole("button", { name: "記帳する" }).click();

  const success = page.getByRole("status").filter({ hasText: "できました" });
  await expect(success).toBeVisible();
  await expect(success).toContainText("累計額 △100,000");
  await expect(success).not.toContainText("−100,000");

  // 貸借対照表の累計額の行にも同じ△の表記が見える(△の後ろにはスクリーンリーダー向けの「マイナス」が挟まる)
  const row = page.locator("section[aria-label='貸借対照表'] [data-account='accumulated_depreciation_equipment']");
  await expect(row).toContainText(/△\S*100,000/);

  // ステップ6の「箱に分ける」を解かないと「次へ →」が出ない
  await next(page, 6);
  await page.getByRole("button", { name: "わかった" }).click();
  const board = work(page).getByRole("group", { name: "仕分けボード" });
  for (const [account, box] of [["備品減価償却累計額", "資産"], ["減価償却費", "費用"], ["備品", "資産"], ["借入金", "負債"]]) {
    await board.getByRole("button", { name: new RegExp(`^${account}`) }).first().click();
    await board.getByRole("button", { name: new RegExp(`^${box}( ← ここに入れる)?$`) }).first().click();
  }
  await work(page).getByRole("button", { name: "確認する" }).click();
  await next(page, 7);
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toContainText("累計額 △100,000");
  await expect(guide).not.toContainText("−100,000");
});
