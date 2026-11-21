import { expect, test } from "@playwright/test";

// 3桁ごとでない位置のカンマを捨てて読むと、打ち間違いの「1,0,0」が100として正解になる
test("区切りの崩れたカンマの金額は記帳できない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await work.getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work.getByLabel("借方の金額1").fill("1,0,0");
  await work.getByLabel("貸方の科目1").fill("ニッコロ");
  await work.getByLabel("貸方の金額1").fill("10,0");
  await expect(work.getByRole("button", { name: "記帳する" })).toBeDisabled();
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
});
