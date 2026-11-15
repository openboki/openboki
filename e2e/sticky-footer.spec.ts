import { expect, test } from "@playwright/test";

// 中身の短いページでフッターが画面の途中に浮き、その下に余白が残っていた

const footerBottom = (page: import("@playwright/test").Page) =>
  page.getByRole("contentinfo").evaluate((el) => el.getBoundingClientRect().bottom);

test("中身の短いページでは、フッターが画面の下端に付く", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { level: 1, name: "ページが見つかりません" })).toBeVisible();
  expect(Math.abs((await footerBottom(page)) - 1200)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBeLessThanOrEqual(0);
});

test("中身の長いページでは、フッターがスクロールした先に出る", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/glossary");
  const footer = page.getByRole("contentinfo");
  await expect(footer).not.toBeInViewport();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeInViewport();
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(Math.abs((await footerBottom(page)) + (await page.evaluate(() => window.scrollY)) - scrollHeight)).toBeLessThanOrEqual(1);
});
