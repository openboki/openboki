import { expect, test } from "@playwright/test";

// 「使い方」→「チュートリアルを最初から」からツアーをスキップしても、開いていた単元へ戻るリンクがガイドに出る

test("「使い方」からチュートリアルをやり直してスキップすると、元の単元へ戻れる", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "使い方", exact: true }).click();
  await page.getByRole("link", { name: "チュートリアルを最初から" }).click();
  await expect(page).toHaveURL(/\/units\/tutorial\/first-entry\?tour=1&from=bookkeeping-basics%2Ffive-elements/);
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "スキップ" }).click();
  await expect(tour).toBeHidden();
  const back = page.getByRole("region", { name: "ガイド" }).getByRole("link", { name: "「5つの要素と仕訳」へ戻る" });
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL("/units/bookkeeping-basics/five-elements");
});
