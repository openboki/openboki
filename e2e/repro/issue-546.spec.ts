import { test, expect } from "@playwright/test";

test("小切手の流れの図の説明が「最初の小切手」と読めない", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/checking-account");
  const caption = page.getByRole("region", { name: "ガイド" }).locator("figure figcaption").first();
  await expect(caption).toContainText("小切手を渡した時点で当座預金を減らす");
  await expect(caption).not.toContainText("最初の小切手");
});
