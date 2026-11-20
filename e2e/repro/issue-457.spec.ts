import { expect, test } from "@playwright/test";

// 期中の売却(ステップ4)で、累計額を積んでから消す合算形の左右を個別の累計額と総称の「減価償却累計額」に混ぜると、
// 減価償却費を書いているのに「今年の分を減価償却費にせず」と出ていた
test("期中の売却の合算形で累計額を個別と総称に混ぜても「減価償却費にせず」と言わない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const fill = async (side: "借方" | "貸方", lines: [string, string][]) => {
    for (const [i, [account, amount]] of lines.entries()) {
      if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work.getByLabel(`${side}の科目${i + 1}`).fill(account);
      await work.getByLabel(`${side}の金額${i + 1}`).fill(amount);
    }
  };
  await page.goto("/units/depreciation/sale-during-period");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  for (const v of ["60000", "420000"]) {
    await next.click();
    await work.getByPlaceholder(/金額/).fill(v);
    await work.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByText("できました", { exact: true })).toBeVisible();
  }
  await next.click();
  await expect(page.getByText("ステップ4 / 8")).toBeVisible();
  await fill("借方", [["現金", "400000"], ["備品減価償却累計額", "300000"], ["減価償却費", "60000"], ["固定資産売却損", "20000"]]);
  await fill("貸方", [["備品", "720000"], ["減価償却累計額", "60000"]]);
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("減価償却費にせず");
  await expect(status).toContainText("考え方は合っています");
});
