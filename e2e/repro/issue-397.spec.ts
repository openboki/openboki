import { test, expect, type Page } from "@playwright/test";

// ツアーを12/12「できました」まで進める
async function reachLastCard(page: Page) {
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "はじめる" }).click();
  await tour.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByLabel("借方の科目1").fill("現金");
  await page.keyboard.press("Enter");
  await page.getByLabel("借方の金額1").fill("100000");
  await page.getByLabel("貸方の科目1").fill("資本金");
  await page.keyboard.press("Enter");
  await page.getByLabel("貸方の金額1").fill("100000");
  for (let i = 0; i < 3; i++) await tour.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "記帳する" }).click();
  for (let i = 0; i < 4; i++) await tour.getByRole("button", { name: "次へ" }).click();
  await expect(tour).toContainText("12 / 12");
  return tour;
}

test("ツアーの最後のカードまで進めて離れると、ツアーは済んだ扱いになる", async ({ page, context }) => {
  await page.goto("/units/tutorial/first-entry?tour=1");
  await reachLastCard(page);

  // カードを閉じずにタブを閉じ、新しいタブで来る
  await page.close();
  const next = await context.newPage();
  await next.goto("/");
  await expect(next.locator("main").getByRole("link", { name: "チュートリアルを始める" })).toHaveCount(0);
  await next.goto("/units/tutorial/first-entry");
  await expect(next.getByRole("dialog", { name: "チュートリアル" })).toHaveCount(0);
});

test("自動で始まったツアーも、完了を記録したあと最後のカードが消えずに残る", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry");
  const tour = await reachLastCard(page);
  await expect(tour.getByRole("button", { name: "閉じる" }).first()).toBeVisible();
  await expect(tour.getByRole("link", { name: "3級パスの最初の単元へ" })).toBeVisible();
});
