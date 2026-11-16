import { expect, test, type Page } from "@playwright/test";

// Issue #361: 左の金額の打ち間違いや1行の書き忘れで、説明が「左の3つの費用の合計(12,500)」と左を正しいと言い切っていた
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

async function gotoReportStep(page: Page) {
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await fillEntry(page, { debit: [{ account: "小口現金", amount: 30000 }], credit: [{ account: "当座預金", amount: 30000 }] });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
}

test("旅費交通費を200と打ち間違えると、説明が左の合計を12,500と決めつけない", async ({ page }) => {
  await gotoReportStep(page);
  await fillEntry(page, {
    debit: [{ account: "通信費", amount: 4000 }, { account: "消耗品費", amount: 6500 }, { account: "旅費交通費", amount: 200 }],
    credit: [{ account: "小口現金", amount: 12500 }],
  });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("費用の合計(12,500)");
  await expect(status).not.toContainText("書かれていません");
  await expect(status).toContainText("そろっていません");
});

test("電車代を書き忘れて右を12,500にすると、電車代の書き忘れを指す", async ({ page }) => {
  await gotoReportStep(page);
  await fillEntry(page, {
    debit: [{ account: "通信費", amount: 4000 }, { account: "消耗品費", amount: 6500 }],
    credit: [{ account: "小口現金", amount: 12500 }],
  });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("電車代2,000円の分が書かれていません");
  await expect(status).not.toContainText("3つの費用");
});

test("電車代を書き忘れて右も10,500にすると、右も直すよう促す既存の文言のまま", async ({ page }) => {
  await gotoReportStep(page);
  await fillEntry(page, {
    debit: [{ account: "通信費", amount: 4000 }, { account: "消耗品費", amount: 6500 }],
    credit: [{ account: "小口現金", amount: 10500 }],
  });
  await work(page).getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("電車代2,000円の分が書かれていません");
  await expect(status).toContainText("右の小口現金も3つの合計にしましょう");
});
