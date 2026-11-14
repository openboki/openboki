import { expect, type Page, test } from "@playwright/test";

// 完了した単元を開き直すと、テーマでは「完了」なのに「前回はステップ9まで進みました」と途中扱いの文言が出る
const finishPettyCash = async (page: Page) => {
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const go = async (n: number) => {
    await next.click();
    await expect(page.getByText(`ステップ${n} / 9`)).toBeVisible();
  };
  const post = async (debit: [string, string][], credit: [string, string][]) => {
    for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
        await work.getByLabel(`${side}の金額${i + 1}`).fill(lines[i][1]);
      }
    }
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  };
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 15000 });
  await go(2);
  await post([["小口現金", "30000"]], [["当座預金", "30000"]]);
  await go(3);
  await go(4);
  await post([["通信費", "4000"], ["消耗品費", "6500"], ["旅費交通費", "2000"]], [["小口現金", "12500"]]);
  await go(5);
  for (const sel of await work.locator("select").all()) await sel.selectOption("none");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await go(6);
  await go(7);
  await work.getByPlaceholder("金額(円)").fill("30000");
  await work.getByRole("button", { name: "確認する" }).click();
  await go(8);
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [a, b] of [["小口現金", "資産"], ["旅費交通費", "費用"], ["通信費", "費用"], ["当座預金", "資産"]]) {
    await board.getByRole("button", { name: a, exact: true }).click();
    await board.getByRole("button", { name: new RegExp(`^${b} `) }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() !== "GET");
  await go(9);
  await saved;
};

test("完了した単元を開き直すと、途中扱いの「前回はステップ9まで」ではなく完了と分かる", async ({ browser, page }) => {
  await page.goto("/units/cash-and-deposits/petty-cash");
  await finishPettyCash(page);
  // sessionStorageの復元(#83)を通らないよう、同じゲストで別のcontextを開く
  const state = await page.context().storageState();
  const other = await (await browser.newContext({ storageState: state })).newPage();
  await other.goto("/topics/cash-and-deposits");
  await expect(other.getByRole("main")).toContainText("完了");
  await other.goto("/units/cash-and-deposits/petty-cash");
  await expect(other.getByText("この単元は完了しています。")).toBeVisible({ timeout: 15000 });
  await expect(other.getByText("前回はステップ9まで進みました。")).toHaveCount(0);
  await other.getByRole("button", { name: "最後のステップを見る" }).click();
  await expect(other.getByText("ステップ9 / 9")).toBeVisible();
});
