import { expect, test } from "@playwright/test";

// 候補欄の折り返しが変わると箱がずれ、入れたチップがポインタの下に来て2回目のクリックで候補に戻る
test("仕分けボードで箱をダブルクリックしても、入れた科目は箱に残る", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  const ok = () => expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const fill = async (debit: [string, number][], credit: [string, number][]) => {
    for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
        await work.getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i][1]));
      }
    }
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  const amount = work.getByPlaceholder("金額(円)");

  await next();
  await amount.fill("900000");
  await amount.press("Enter");
  await ok();
  await next();
  await fill([["現金", 850000], ["車両運搬具減価償却累計額", 300000], ["固定資産売却損", 50000]], [["車両運搬具", 1200000]]);
  await ok();
  await next();
  await amount.fill("30000");
  await amount.press("Enter");
  await ok();
  await next();
  await fill([["未収入金", 480000], ["備品減価償却累計額", 150000]], [["備品", 600000], ["固定資産売却益", 30000]]);
  await ok();
  await next();
  await expect(page.getByText("ステップ6 /")).toBeVisible();
  await page.getByRole("button", { name: "わかった" }).click().catch(() => {});

  const board = work.getByRole("group", { name: "仕分けボード" });
  const expenseBin = board.locator('[data-drop="expense"]');
  await board.getByRole("button", { name: "固定資産売却損", exact: true }).click();
  await board.getByRole("button", { name: "費用 ← ここに入れる", exact: true }).dblclick();
  await expect(page.getByRole("status").filter({ hasText: "候補に戻しました" })).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: "固定資産売却損を費用に入れました" })).toBeVisible();
  await expect(expenseBin.locator('[data-chip="loss_on_sale_of_fixed_assets"]')).toBeVisible();

  // 箱の中のチップを1回押せば、これまでどおり候補に戻る
  await expenseBin.locator('[data-chip="loss_on_sale_of_fixed_assets"]').click();
  await expect(page.getByRole("status").filter({ hasText: "固定資産売却損を候補に戻しました" })).toBeVisible();
  await expect(expenseBin.locator("[data-chip]")).toHaveCount(0);
});
