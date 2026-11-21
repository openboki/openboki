import { expect, test } from "@playwright/test";

// Issue #505: イラスト一覧がどこからもリンクされておらず、URLを知らないと開けなかった

test("フッターの「イラスト一覧」から/illustrationsが開く", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "イラスト一覧" }).click();
  await expect(page).toHaveURL(/\/illustrations$/);
  await expect(page.getByRole("heading", { level: 1, name: "イラスト一覧" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
