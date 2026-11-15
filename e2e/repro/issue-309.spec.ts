import { expect, test } from "@playwright/test";

// 単元の通貨と違う単位(ドゥカートの単元で「円」)を付けると、半角なのに「半角の数字だけで」と出る
test("ドゥカートの単元で「70円」と入れると、単位が違うと案内する", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ2 / 7")).toBeVisible();
  await work.locator("input").first().fill("70円");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText(/半角の数字だけで/)).toHaveCount(0);
  await expect(page.getByText(/ドゥカート/).filter({ hasText: /円/ })).toBeVisible();
});
