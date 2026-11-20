import { expect, test } from "@playwright/test";

// Issue #455: 試算と元帳だけの単元で「使い方」の結果(見る)に試算の説明が無く、貸借対照表の「場所を示す」が試算と元帳を光らせた
test("view: ledgerの単元の結果(見る)に試算があり、画面に無い財務諸表は出ない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  await expect(page.getByRole("region", { name: "試算" })).toBeVisible();
  await page.getByRole("button", { name: "使い方" }).first().click();
  const dialog = page.getByRole("dialog", { name: "会計IDEの使い方" });
  await dialog.getByText("結果(見る)").click();
  const result = dialog.locator("details").filter({ hasText: "結果(見る)" });
  await expect(result.locator("dt")).toHaveText(["試算", "帳簿をさかのぼる"]);

  await result.locator("#help-trial").getByRole("button", { name: "場所を示す →" }).click();
  await expect(page.locator('[data-spotlight="trial"]')).toBeVisible();
});

test("view: statementsの単元では結果(見る)に財務諸表が出て、試算は出ない", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  await page.getByRole("button", { name: "使い方" }).first().click();
  const dialog = page.getByRole("dialog", { name: "会計IDEの使い方" });
  await dialog.getByText("結果(見る)").click();
  const result = dialog.locator("details").filter({ hasText: "結果(見る)" });
  await expect(result.locator("dt", { hasText: "貸借対照表と損益計算書" })).toBeVisible();
  await expect(result.locator("dt", { hasText: /^試算$/ })).toHaveCount(0);
});
