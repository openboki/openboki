import { expect, test, type Page } from "@playwright/test";

// Issue #423: 当期に生じた売掛金の貸倒れで左に貸倒引当金を書くと、誤解の判定が付かず汎用文だけが出ていた
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });

async function fillEntry(page: Page, entry: { debit: { account: string; amount: number }[]; credit: { account: string; amount: number }[] }) {
  for (const [side, lines] of [["借方", entry.debit], ["貸方", entry.credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work(page).getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work(page).getByLabel(`${side}の科目${i + 1}`).fill(lines[i].account);
      await work(page).getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i].amount));
    }
  }
}

test("当期の売掛金の貸倒れで貸倒引当金を使うと、取り違えの説明が出る", async ({ page }) => {
  await page.goto("/units/bad-debts/bad-debt-loss");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await fillEntry(page, { debit: [{ account: "売掛金", amount: 30000 }], credit: [{ account: "売上", amount: 30000 }] });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  for (const [el, v] of Object.entries({ 資産: "減る", 負債: "変わらない", 純資産: "減る", 収益: "変わらない", 費用: "増える" }))
    await work(page).getByLabel(`${el}の予想`, { exact: true }).selectOption({ label: v });
  await work(page).getByRole("button", { name: "予想して記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work(page).getByPlaceholder(/金額/).fill("-18000");
  await work(page).getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();

  await fillEntry(page, {
    debit: [{ account: "現金", amount: 20000 }, { account: "貸倒引当金", amount: 30000 }],
    credit: [{ account: "売掛金", amount: 50000 }],
  });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("貸倒引当金");
  await expect(status).toContainText("貸倒損失");
  await expect(status).not.toContainText("結果の表で何が動くはずか");
});
