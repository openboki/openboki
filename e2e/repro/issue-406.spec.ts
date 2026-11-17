import { expect, test } from "@playwright/test";

// Issue #406: 期中売却の年表図で、売る日までに使った月が読める
test("期中売却の年表図が、使った6か月を月の名前で示して強調する", async ({ page }) => {
  await page.goto("/units/depreciation/sale-during-period");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).first().click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByText("4月", { exact: true })).toBeVisible();
  await expect(guide.getByText("9月", { exact: true })).toBeVisible();
  await expect(guide.getByText("3月", { exact: true })).toBeVisible();
  const used = guide.locator('li[data-highlight="true"]');
  const unused = guide.locator('li[data-highlight="false"]');
  await expect(used).toHaveCount(6);
  await expect(unused).toHaveCount(6);
  await expect(used.last()).toContainText("9月");
  await expect(unused.first()).toContainText("10月");
  const bg = (el: Element) => getComputedStyle(el).backgroundColor;
  expect(await used.first().evaluate(bg)).not.toBe(await unused.first().evaluate(bg));
});
