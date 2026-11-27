import { expect, test, type Page } from "@playwright/test";

// 「預かったお金、仮のお金」ステップ9の仕分けで立替金を費用に入れると、説明文だけが出て
// 「よくある思い込み」(誤解)が付かなかった。ステップ4の記帳では同じ取り違えにadvance_for_others_is_expenseが付く
type Line = [string, string];

async function post(page: Page, debit: Line[], credit: Line[]) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
      await work.getByLabel(`${side}の金額${i + 1}`).fill(lines[i][1]);
    }
  }
  await work.getByRole("button", { name: "記帳する" }).click();
}

async function predict(page: Page, picks: Record<string, string>) {
  for (const name of ["資産", "負債", "純資産", "収益", "費用"])
    await page.getByLabel(`${name}の予想`, { exact: true }).selectOption({ label: picks[name] ?? "変わらない" });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
}

test("仕分けで立替金を費用に入れると、ステップ4と同じ誤解「立て替えたお金は費用」が付く", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const steps: (() => Promise<void>)[] = [
    () => post(page, [["給料", "100000"]], [["普通預金", "97000"], ["預り金", "3000"]]),
    () => predict(page, { 資産: "減る", 負債: "減る" }),
    () => post(page, [["立替金", "2000"]], [["現金", "2000"]]),
    () => post(page, [["仮払金", "20000"]], [["現金", "20000"]]),
    () => post(page, [["旅費交通費", "18000"], ["現金", "2000"]], [["仮払金", "20000"]]),
    () => predict(page, { 資産: "増える", 負債: "増える" }),
    () => post(page, [["仮受金", "50000"]], [["未収入金", "50000"]]),
  ];
  for (const solve of steps) {
    await next.click();
    await solve();
    await expect(done).toBeVisible();
  }

  // ステップ9: 立替金だけを費用に入れ、他は正しい箱へ
  await next.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  for (const [account, box] of [["立替金", "費用"], ["預り金", "負債"], ["仮払金", "資産"], ["仮受金", "負債"]]) {
    await work.getByRole("button", { name: new RegExp(`^${account}`) }).first().click();
    await work.getByRole("button", { name: new RegExp(box) }).first().click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status).toContainText("立替金は資産です");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("立て替えたお金は費用");
});
