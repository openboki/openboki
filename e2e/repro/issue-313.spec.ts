import { expect, test } from "@playwright/test";

// Issue #313: 試算と元帳だけの単元で「使い方」が、画面に無い会社のかたちと財務諸表を案内していた
test("view: ledgerの単元の使い方に、画面に無い会社のかたちや財務諸表が出ない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await next.click();
  await work.getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work.getByLabel("借方の金額1").fill("100");
  await work.getByLabel("貸方の科目1").fill("ニッコロ");
  await work.getByLabel("貸方の金額1").fill("100");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ5 / 10")).toBeVisible();
  await expect(page.getByRole("region", { name: "貸借対照表" })).toHaveCount(0);

  await page.getByRole("button", { name: "使い方" }).first().click();
  const help = page.getByRole("dialog", { name: "会計IDEの使い方" });
  const now = (await help.innerText()).split("すべての機能")[0];
  expect(now).not.toContain("会社のかたち");
  expect(now).not.toContain("貸借対照表と損益計算書");
});
