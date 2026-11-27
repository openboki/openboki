import { test, expect, type Page } from "@playwright/test";

const themes = ["街の小さな会社", "藍と朱", "帳簿用紙", "ワークベンチ"];

async function chooseTheme(page: Page, theme: string) {
  await page.getByRole("button", { name: "テーマ", exact: true }).click();
  await page.getByRole("group", { name: "テーマ" }).getByRole("button", { name: theme }).click();
  await page.keyboard.press("Escape");
  // 書体の読み込み前に測ると、字幅の狭い代替書体で収まって見える
  await page.evaluate(() => document.fonts.ready);
}

// 字幅の広い書体のテーマでは、文節で折る境目をガイドが広いときに限る。境目の前後の幅でも表がガイドに収まる
for (const width of [1280, 1366, 1440, 1600]) {
  test(`航海の儲けのステップ2で、どのテーマでもガイドの表が列に収まる(${width}幅)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
    await page.getByRole("button", { name: "次へ →" }).click();
    await expect(page.getByText("ステップ2 / 9")).toBeVisible();
    const guide = page.getByRole("region", { name: "ガイド" });
    await expect(guide.locator("table")).toBeVisible();
    for (const theme of themes) {
      await chooseTheme(page, theme);
      await expect
        .poll(() => guide.evaluate((g) => g.scrollWidth - g.clientWidth), { message: theme })
        .toBeLessThanOrEqual(0);
    }
  });
}
