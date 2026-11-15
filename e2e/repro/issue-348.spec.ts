import { test, expect } from "@playwright/test";

// Issue #348: ドゥカートの単元で「使い方」の「金額で答える」が円で案内していた
test("ドゥカートの単元では「使い方」の金額で答えるが円で案内しない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByPlaceholder("金額(ドゥカート)")).toBeVisible();
  await page.getByRole("button", { name: "使い方", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("#now-calc")).toContainText("「ドゥカート」は付けても");
  await expect(dialog.getByText("「円」は付けても")).toHaveCount(0);
});
