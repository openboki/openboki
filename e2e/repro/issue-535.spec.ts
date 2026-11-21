import { expect, test, type Page } from "@playwright/test";

// Issue #535: 期中の売却のステップ7(スクーターを売り、代金は来月受け取る)で借方に未収入金ではなく未払金を書いて記帳すると、
// 前の単元「固定資産の売却」では出る未収入金と未払金の取り違えの説明が付かず、汎用の「まだ合っていません」と比較表だけが出ていた
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });

type Line = [account: string, amount: number];

async function post(page: Page, debit: Line[], credit: Line[]) {
  const removable = work(page).locator("button[aria-label='行を削除']:not([disabled])");
  while ((await removable.count()) > 0) await removable.first().click();
  for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work(page).getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work(page).getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
      await work(page).getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i][1]));
    }
  }
  await work(page).getByRole("button", { name: "記帳する" }).click();
}

async function calc(page: Page, value: string) {
  await work(page).getByPlaceholder(/金額/).first().fill(value);
  await work(page).getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
}

test("期中の売却ステップ7で借方に未払金を書くと、未収入金との取り違えとして説明する", async ({ page }) => {
  await page.goto("/units/depreciation/sale-during-period");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await calc(page, "60000");
  await next.click();
  await calc(page, "420000");
  await next.click();
  await post(
    page,
    [["現金", 400000], ["備品減価償却累計額", 240000], ["減価償却費", 60000], ["固定資産売却損", 20000]],
    [["備品", 720000]],
  );
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();
  await calc(page, "80000");
  await next.click();
  await calc(page, "12000");
  await next.click();
  await post(
    page,
    [["未払金", 210000], ["車両運搬具減価償却累計額", 108000], ["減価償却費", 54000]],
    [["車両運搬具", 360000], ["固定資産売却益", 12000]],
  );
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("未収入金");
  await expect(status).toContainText("よくある思い込み");
});
