import { test, expect } from "@playwright/test";

test("概念マップの関連概念をEnterで押してもフォーカスが説明ペインに残る", async ({ page }) => {
  await page.goto("/map?c=interest");
  const article = page.getByRole("article", { name: "概念の説明" });
  await expect(article.getByRole("heading", { name: "利息", level: 2 })).toBeVisible();
  await article.getByRole("button", { name: "元本" }).focus();
  await page.keyboard.press("Enter");
  await expect(article.getByRole("heading", { name: "元本", level: 2 })).toBeVisible();
  await expect(article.getByRole("heading", { name: "元本", level: 2 })).toBeFocused();

  await page.keyboard.press("Tab");
  const placement = await page.evaluate(() => ({
    inArticle: !!document.activeElement?.closest("article"),
    inNav: !!document.activeElement?.closest("nav"),
  }));
  expect(placement).toEqual({ inArticle: true, inNav: false });
});

test("概念の一覧のボタンを押したときはフォーカスがそのボタンに残る", async ({ page }) => {
  await page.goto("/map?c=interest");
  const article = page.getByRole("article", { name: "概念の説明" });
  await expect(article.getByRole("heading", { name: "利息", level: 2 })).toBeVisible();
  const item = page.getByRole("navigation", { name: "概念の一覧" }).getByRole("button", { name: "元本", exact: true });
  await item.click();
  await expect(article.getByRole("heading", { name: "元本", level: 2 })).toBeVisible();
  await expect(item).toBeFocused();
});
