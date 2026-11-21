import { expect, test, type Page } from "@playwright/test";

// Issue #526: 固定資産の売却で、売却益の代わりに固定資産売却損を貸方に(売却損の代わりに固定資産売却益を借方に)書いて記帳すると、
// 貸借はそろうのに誤解の説明が付かず、汎用の「まだ合っていません」と比較表だけが出ていた
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });

type Line = { account: string; amount: number };

async function post(page: Page, entry: { debit: Line[]; credit: Line[] }) {
  for (const [side, lines] of [["借方", entry.debit], ["貸方", entry.credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work(page).getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work(page).getByLabel(`${side}の科目${i + 1}`).fill(lines[i].account);
      await work(page).getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i].amount));
    }
  }
  await work(page).getByRole("button", { name: "記帳する" }).click();
}

async function calc(page: Page, value: string) {
  await work(page).getByPlaceholder(/金額/).first().fill(value);
  await work(page).getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
}

async function openUnit(page: Page) {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await calc(page, "900000");
  await page.getByRole("button", { name: "次へ →" }).click();
}

test("ステップ3で売却損の代わりに固定資産売却益を借方に書くと、売却益と売却損の取り違えとして説明する", async ({ page }) => {
  await openUnit(page);
  await post(page, {
    debit: [
      { account: "現金", amount: 850000 },
      { account: "車両運搬具減価償却累計額", amount: 300000 },
      { account: "固定資産売却益", amount: 50000 },
    ],
    credit: [{ account: "車両運搬具", amount: 1200000 }],
  });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("固定資産売却損");
  await expect(status).toContainText("よくある思い込み");
});

test("ステップ5で売却益の代わりに固定資産売却損を貸方に書くと、売却益と売却損の取り違えとして説明する", async ({ page }) => {
  const next = page.getByRole("button", { name: "次へ →" });
  await openUnit(page);
  await post(page, {
    debit: [
      { account: "現金", amount: 850000 },
      { account: "車両運搬具減価償却累計額", amount: 300000 },
      { account: "固定資産売却損", amount: 50000 },
    ],
    credit: [{ account: "車両運搬具", amount: 1200000 }],
  });
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();
  await calc(page, "30000");
  await next.click();
  await post(page, {
    debit: [
      { account: "未収入金", amount: 480000 },
      { account: "備品減価償却累計額", amount: 150000 },
    ],
    credit: [
      { account: "備品", amount: 600000 },
      { account: "固定資産売却損", amount: 30000 },
    ],
  });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("固定資産売却益");
  await expect(status).toContainText("よくある思い込み");
});
