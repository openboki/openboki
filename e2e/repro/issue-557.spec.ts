import { expect, test, type Page } from "@playwright/test";

// 「金庫のお金が合わない」で、差額を普通預金から減らす誤答(ステップ2)と、
// 雑損への振り替えの右に現金を書く誤答(ステップ5)に誤解の説明が付かない
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

test("現金過不足の振り替えで現金・普通預金を右に書くと誤解の説明が出る", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });

  // ステップ2: 差額を普通預金から減らす
  await fill(page, [["現金過不足", "3000"]], [["普通預金", "3000"]]);
  await expect(status).toBeVisible();
  await expect(status).not.toContainText(GENERIC);
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("現金と普通預金の取り違え");

  await fill(page, [["現金過不足", "3000"]], [["現金", "3000"]]);
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByLabel("純資産の予想").selectOption("decrease");
  await page.getByLabel("費用の予想").selectOption("increase");
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByRole("textbox").first().fill("1000");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();

  // ステップ5: 雑損への振り替えで現金を減らす
  await fill(page, [["雑損", "1000"]], [["現金", "1000"]]);
  await expect(status).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("雑損への振り替えでお金が動く");
});
