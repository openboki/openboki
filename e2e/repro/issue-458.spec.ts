import { expect, test, type Page } from "@playwright/test";

// 「細かい支払いを任せる」で、小口現金を仮払金と取り違えた仕訳(ステップ2の借方、ステップ4の貸方)と、
// 報告の支払いを全部雑損にまとめた仕訳(ステップ4)に誤解の説明が付かず、「使っている科目を見直しましょう」の汎用文だけが出ていた
const GENERIC = "5つの要素の動きは合っています。使っている科目を見直しましょう。";

type Line = [string, string];

async function fill(page: Page, debit: Line[], credit: Line[]) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const removable = work.locator("button[aria-label='行を削除']:not([disabled])");
  while ((await removable.count()) > 0) await removable.first().click();
  for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
      await work.getByLabel(`${side}の金額${i + 1}`).fill(lines[i][1]);
    }
  }
  await work.getByRole("button", { name: "記帳する" }).click();
}

test("小口現金を仮払金・雑損と取り違えると誤解の説明が出る", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });

  await fill(page, [["仮払金", "30000"]], [["当座預金", "30000"]]);
  await expect(status).toBeVisible();
  await expect(status).not.toContainText(GENERIC);
  await expect(status).toContainText("よくある思い込み: 前もって渡すお金は仮払金");
  await expect(status).toContainText("あとの単元「預かったお金、仮のお金」で詳しく学びます");

  await fill(page, [["小口現金", "30000"]], [["当座預金", "30000"]]);
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();

  await fill(page, [["雑損", "12500"]], [["小口現金", "12500"]]);
  await expect(status).toBeVisible();
  await expect(status).not.toContainText(GENERIC);
  await expect(status).toContainText("よくある思い込み: 細かい支払いはまとめて雑損");

  await fill(page, [["通信費", "4000"], ["消耗品費", "6500"], ["旅費交通費", "2000"]], [["仮払金", "12500"]]);
  await expect(status).toBeVisible();
  await expect(status).not.toContainText(GENERIC);
  await expect(status).toContainText("ステップ2で担当者に渡して増やしたのは小口現金");
});
