import { expect, test } from "@playwright/test";

// Issue #402: 「ヴェネツィア式とパチョーリ」はフランドル行きの品を「絹」と書くのに、
// 用語集の「3帳簿」「利益と損失の勘定」の例だけが「布」のままで、同じ取引(100 / 30)に別の品名が付いていた
test("用語集の3帳簿と利益と損失の勘定の例が、単元と同じ絹を使う", async ({ page }) => {
  for (const id of ["three_books", "profit_and_loss_account"]) {
    await page.goto(`/glossary#${id}`);
    const entry = page.locator(`#${id}`);
    await expect(entry).toContainText("絹");
    await expect(entry).not.toContainText("布");
  }
});
