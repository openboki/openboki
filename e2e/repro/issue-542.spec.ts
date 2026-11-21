import { test, expect, type Page } from "@playwright/test";

const inArticle = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('article[aria-label="概念の説明"]'));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/map?c=asset");
  await expect(page.getByRole("article", { name: "概念の説明" }).getByRole("heading", { name: "資産", level: 2 })).toBeVisible();
});

test("概念の一覧は矢印キーとHome / Endで項目を移る", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "概念の一覧" });
  const items = nav.locator("ul button");
  await nav.getByRole("button", { name: "資産", exact: true }).focus();

  const index = await items.evaluateAll((buttons) => buttons.findIndex((b) => b.textContent === "資産"));
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(index + 1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items.first()).toBeFocused();
});

test("概念の一覧から説明へ少ないTabで届き、Shift+Tabで一覧の選択中の項目へ戻れる", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "概念の一覧" });
  await nav.getByRole("button", { name: "資産", exact: true }).focus();
  let presses = 0;
  for (; presses < 100; presses++) {
    await page.keyboard.press("Tab");
    if (await inArticle(page)) break;
  }
  expect(presses).toBeLessThan(10);

  let back = 0;
  for (; back < 100; back++) {
    await page.keyboard.press("Shift+Tab");
    if (await page.evaluate(() => !!document.activeElement?.closest('nav[aria-label="概念の一覧"] ul'))) break;
  }
  expect(back).toBeLessThan(10);
  await expect(nav.getByRole("button", { name: "資産", exact: true })).toBeFocused();
});

test("検索で選択中の概念が外れても、一覧に止まり先が1つ残る", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "概念の一覧" });
  await nav.getByRole("textbox", { name: "概念を検索" }).fill("負債");
  await page.keyboard.press("Tab");
  await expect(nav.locator("ul button").first()).toBeFocused();
});
