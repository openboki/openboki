import { expect, test } from "@playwright/test";

// Issue #311: トップの「チュートリアルを始める」に?tour=1が無く、ツアーをスキップした後に押すとツアーが始まらなかった
test("ツアーをスキップした後にトップの「チュートリアルを始める」を押すと、ツアーが始まる", async ({ page }) => {
  const dlg = page.getByRole("dialog", { name: "チュートリアル" });
  await page.goto("/");
  await page.getByRole("link", { name: "チュートリアルを始める" }).click();
  await dlg.getByRole("button", { name: "はじめる" }).click();
  await dlg.getByRole("button", { name: "次へ" }).click();
  await dlg.getByRole("button", { name: "スキップ" }).click();
  await expect(dlg).toHaveCount(0);
  await page.goto("/");
  await page.getByRole("link", { name: "チュートリアルを始める" }).click();
  await expect(page).toHaveURL(/first-entry/);
  await expect(dlg).toBeVisible();
});
