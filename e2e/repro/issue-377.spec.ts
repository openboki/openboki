import { expect, test } from "@playwright/test";

// Issue #377: 仕分けボードの説明が、学習者が選んでいない箱を否定していた
test("立替金を負債・預り金を資産に入れると、選んでいない費用・収益を否定する文が出ない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const post = async (debit: [string, number][], credit: [string, number][]) => {
    const removable = work.locator("button[aria-label='行を削除']:not([disabled])");
    while ((await removable.count()) > 0) await removable.first().click();
    for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
        await work.getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i][1]));
      }
    }
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  const predict = async (v: string[]) => {
    const keys = ["資産", "負債", "純資産", "収益", "費用"];
    for (let i = 0; i < 5; i++) await work.getByLabel(`${keys[i]}の予想`, { exact: true }).selectOption({ label: v[i] });
    await work.getByRole("button", { name: "予想して記帳する" }).click();
  };

  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await next();
  await post([["給料", 100000]], [["普通預金", 97000], ["預り金", 3000]]);
  await next();
  await predict(["減る", "減る", "変わらない", "変わらない", "変わらない"]);
  await next();
  await post([["立替金", 2000]], [["現金", 2000]]);
  await next();
  await post([["仮払金", 20000]], [["現金", 20000]]);
  await next();
  await post([["旅費交通費", 18000], ["現金", 2000]], [["仮払金", 20000]]);
  await next();
  await predict(["増える", "増える", "変わらない", "変わらない", "変わらない"]);
  await next();
  await post([["仮受金", 50000]], [["未収入金", 50000]]);
  await next();

  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["立替金", "負債"], ["預り金", "資産"], ["仮払金", "資産"], ["仮受金", "負債"]]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: new RegExp(`^${box}( |$)`) }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("立替金は資産です。後で本人から返してもらう権利で、将来お金に変わる財産だからです。");
  await expect(status).not.toContainText("会社の費用ではありません");
  await expect(status).not.toContainText("会社のもうけではありません");
});
