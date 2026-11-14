import { expect, test } from "@playwright/test";

test("単元ページの単元名がh1になっている", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await expect(page.getByRole("heading", { level: 1, name: "ヴェネツィア式とパチョーリ" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});
