import { expect, test, type Page } from "@playwright/test";

// Issue #422: 金額を1つ打ち間違えると、不一致の説明が「右の売掛金50,000に対して、左は現金20,000と貸倒損失30,000です」と正解の額を学習者の仕訳のように言っていた
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });

type Line = { account: string; amount: number };

async function fillEntry(page: Page, entry: { debit: Line[]; credit: Line[] }) {
  for (const [side, lines] of [["借方", entry.debit], ["貸方", entry.credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work(page).getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work(page).getByLabel(`${side}の科目${i + 1}`).fill(lines[i].account);
      await work(page).getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i].amount));
    }
  }
}

async function post(page: Page, entry: Parameters<typeof fillEntry>[1]) {
  await fillEntry(page, entry);
  await work(page).getByRole("button", { name: "記帳する" }).click();
}

test("貸倒れの仕訳で現金を2,000と打ち間違えても、不一致の説明が学習者の左を正解の額と言い切らない", async ({ page }) => {
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/bad-debts/bad-debt-loss");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await post(page, { debit: [{ account: "売掛金", amount: 30000 }], credit: [{ account: "売上", amount: 30000 }] });
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();
  for (const [el, v] of Object.entries({ 資産: "減る", 負債: "変わらない", 純資産: "減る", 収益: "変わらない", 費用: "増える" }))
    await work(page).getByLabel(`${el}の予想`, { exact: true }).selectOption({ label: v });
  await work(page).getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await work(page).getByPlaceholder(/金額/).fill("-18000");
  await work(page).getByRole("button", { name: "確認する" }).click();
  await next.click();

  await post(page, {
    debit: [{ account: "現金", amount: 2000 }, { account: "貸倒損失", amount: 30000 }],
    credit: [{ account: "売掛金", amount: 50000 }],
  });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("左は現金20,000");
  await expect(status).toContainText("どちらも50,000");
});

test("預り金を300と打ち間違えても、不一致の説明が学習者の右を正解の額と言い切らない", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await post(page, {
    debit: [{ account: "給料", amount: 100000 }],
    credit: [{ account: "普通預金", amount: 97000 }, { account: "預り金", amount: 300 }],
  });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("預り金3,000がそろっていません");
  await expect(status).toContainText("どちらも100,000");
});
