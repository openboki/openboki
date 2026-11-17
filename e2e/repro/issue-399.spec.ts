import { expect, test } from "@playwright/test";

// 試算と元帳だけの単元で、「使い方」の「影響の表示」が画面に無い5要素と当期純利益を案内する(Issue #399)
test("ledger表示の単元では影響の表示の説明が5要素に触れない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await work.getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work.getByLabel("借方の金額1").fill("100");
  // 画面にはチップが無い(前提の確認)
  await expect(work.locator("[data-tour=impact]").getByText("当期純利益")).toHaveCount(0);
  await page.getByRole("button", { name: "使い方" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("影響の表示", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByText(/5要素と当期純利益がどう動くか/)).toHaveCount(0);
  await expect(dialog.getByText(/借方合計と貸方合計/).first()).toBeVisible();
});
