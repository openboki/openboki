import { devices, expect, test, type Page } from "@playwright/test";

// 「金庫のお金が合わない」ステップ7の仕分けボードで雑損を負債の箱に入れると、科目の説明文だけが出て
// 「よくある思い込み」(誤解)が付かなかった。このステップのtask.misconceptionsだけが空だった(Issue #634)

const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];
test.use(iPhone);

async function workspace(page: Page) {
  const tab = page.getByRole("tab", { name: "ワークスペース" });
  if (await tab.isVisible()) await tab.click();
  return page.getByRole("region", { name: "ワークスペース" });
}

test("仕分けで雑損を負債に入れると「よくある思い込み」が出る", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  const next = page.getByRole("button", { name: "次へ →" });
  const solved = page.getByText("できました", { exact: true });
  const post = async (debit: string, credit: string, amount: string) => {
    const work = await workspace(page);
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await next.click({ timeout: 15000 });
  await post("現金過不足", "現金", "3000");
  await expect(solved).toBeVisible();
  await next.click();
  let work = await workspace(page);
  await work.getByLabel("純資産の予想").selectOption("decrease");
  await work.getByLabel("費用の予想").selectOption("increase");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(solved).toBeVisible();
  await next.click();
  work = await workspace(page);
  await work.getByPlaceholder("金額(円)").fill("1000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(solved).toBeVisible();
  await next.click();
  await post("雑損", "現金過不足", "1000");
  await expect(solved).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ7 / 8")).toBeVisible();

  work = await workspace(page);
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [account, box] of [["現金", "資産"], ["普通預金", "資産"], ["通信費", "費用"], ["雑損", "負債"]]) {
    await board.getByRole("button", { name: account, exact: true }).click();
    await board.locator("button", { hasText: new RegExp(`^\\S+ ${box}( ←|$)`) }).first().click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("よくある思い込み: 費用と負債の混同");
});
