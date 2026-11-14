import { expect, test, type Page } from "@playwright/test";

// Issue #281: 同じオリジンのページを開いていたタブで/glossary#<id>へフル遷移すると、項目へスクロールせず先頭のまま止まる

const topOf = (page: Page, id: string) =>
  page.evaluate((id) => Math.round(document.getElementById(id)!.getBoundingClientRect().top), id);

for (const from of ["/", "/glossary?q=x"]) {
  test(`同じタブで${from}から用語集のアンカーを開くと項目へスクロールする`, async ({ page }) => {
    await page.goto(from);
    await page.waitForLoadState("load");
    await page.goto("/glossary#memorandum_book");
    await page.waitForLoadState("load");
    await expect.poll(() => topOf(page, "memorandum_book"), { timeout: 5000 }).toBeLessThan(200);
    // ヘッダーの下に来ること(scroll-mt-20)
    await expect.poll(() => topOf(page, "memorandum_book")).toBeGreaterThanOrEqual(0);
  });
}

test("新しいタブで用語集のアンカーを開くと項目へスクロールする", async ({ page }) => {
  await page.goto("/glossary#memorandum_book");
  await expect.poll(() => topOf(page, "memorandum_book"), { timeout: 5000 }).toBeLessThan(200);
});

test("用語集の関連リンクで項目へ移動できる", async ({ page }) => {
  await page.goto("/glossary");
  await expect.poll(() => page.evaluate(() => Boolean(window.history.state?.__NA))).toBe(true);
  await page.locator("#transaction a[href='#journal_entry']").click();
  await expect(page).toHaveURL(/#journal_entry$/);
  await expect(page.locator("#journal_entry")).toBeInViewport();
});
