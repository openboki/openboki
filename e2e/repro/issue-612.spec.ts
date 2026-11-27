import { expect, type Page, test } from "@playwright/test";

// 初めての課題の種類のnoteが、1回の誤答で消えて見た扱いになる
async function openCalcStep(page: Page) {
  await page.goto("/units/merchandise/cost-of-goods-sold");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const note = page.getByRole("note").filter({ hasText: "初めての「金額で答える」" });
  await expect(note).toBeVisible();
  return note;
}

async function answer(page: Page, amount: string) {
  await page.getByPlaceholder("金額(円)").fill(amount);
  await page.getByRole("region", { name: "ワークスペース" }).getByRole("button", { name: "確認する" }).click();
}

test("初めての「金額で答える」のnoteは誤答のあとも残る", async ({ page }) => {
  const note = await openCalcStep(page);
  await answer(page, "100000");
  await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();
  await expect(note.getByRole("button", { name: "くわしく" })).toBeVisible();
  const seen = await page.evaluate(() => localStorage.getItem("tutorial-state"));
  expect(seen ?? "").not.toContain('"calc"');
});

test("初めての「金額で答える」のnoteは正解すると消え、見た扱いになる", async ({ page }) => {
  const note = await openCalcStep(page);
  await answer(page, "125000");
  await expect(note).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("tutorial-state"))).toContain('"calc"');
});
