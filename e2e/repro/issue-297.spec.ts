import { expect, test } from "@playwright/test";

// Issue #297: scenario.view: ledgerの結果ペイン(試算と元帳)で、科目名を押しても説明が開かなかった
test("ledger表示の結果ペインでも科目名から説明が開く", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const result = page.getByRole("region", { name: "結果" });

  await result.getByRole("region", { name: "試算" }).getByRole("button", { name: "現金", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "現金" })).toBeVisible();
  await page.keyboard.press("Escape");

  await result.getByRole("region", { name: "元帳" }).getByRole("button", { name: "胡椒(アレクサンドリア航海)" }).click();
  const popover = page.getByRole("dialog", { name: "胡椒(アレクサンドリア航海)" });
  await expect(popover).toContainText("航海1口にかかった額と売った額を集める口別の勘定です。");
});
