import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/glossary");
});

test("概念マップでつながりをたどったあと、戻るで1つ前の概念へ戻る", async ({ page }) => {
  await page.goto("/map?c=personal_account");
  const article = page.getByRole("article", { name: "概念の説明" });
  await expect(article.getByRole("heading", { name: "人名勘定", level: 2 })).toBeVisible();
  await article.getByRole("button", { name: "口別計算" }).click();
  await expect(article.getByRole("heading", { name: "口別計算", level: 2 })).toBeVisible();
  await article.getByRole("button", { name: "利益と損失の勘定" }).click();
  await expect(page).toHaveURL(/\/map\?c=profit_and_loss_account$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/map\?c=venture_accounting$/);
  await expect(article.getByRole("heading", { name: "口別計算", level: 2 })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/map\?c=personal_account$/);
  await expect(article.getByRole("heading", { name: "人名勘定", level: 2 })).toBeVisible();
  await page.goForward();
  await expect(article.getByRole("heading", { name: "口別計算", level: 2 })).toBeVisible();
});

test("一覧で選んだ概念も戻るで戻れる", async ({ page }) => {
  await page.goto("/map?c=personal_account");
  const article = page.getByRole("article", { name: "概念の説明" });
  await expect(article.getByRole("heading", { name: "人名勘定", level: 2 })).toBeVisible();
  await page.getByRole("navigation", { name: "概念の一覧" }).getByRole("button", { name: "複式簿記", exact: true }).click();
  await expect(article.getByRole("heading", { name: "複式簿記", level: 2 })).toBeVisible();
  await page.goBack();
  await expect(article.getByRole("heading", { name: "人名勘定", level: 2 })).toBeVisible();
});

test("一覧を矢印キーで動いた分は履歴に積まず、戻るでマップを開く前のページへ出る", async ({ page }) => {
  await page.goto("/map?c=asset");
  const article = page.getByRole("article", { name: "概念の説明" });
  await expect(article.getByRole("heading", { name: "資産", level: 2 })).toBeVisible();
  await page.getByRole("navigation", { name: "概念の一覧" }).getByRole("button", { name: "資産", exact: true }).focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowDown");
  await expect(article.getByRole("heading", { name: "資産", level: 2 })).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/glossary$/);
});
