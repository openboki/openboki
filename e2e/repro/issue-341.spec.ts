import { expect, test } from "@playwright/test";

// 覚え書きの時代(view: none)の説明だけのステップで、中央のワークスペースが空白の列になる
test("view: noneの説明だけのステップでもワークスペースが空白にならない", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await expect(page.getByText("ステップ1 / 7")).toBeVisible();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await expect(work).not.toHaveText(/^\s*$/);
  await expect(work).toContainText("このステップは読むだけです。読み終えたら「次へ →」で進みます。");
});
