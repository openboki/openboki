import { expect, test } from "@playwright/test";

// Issue #446: キーボードだけで借方を入れ終えてTabで貸方へ進むと、カードが「借方(左)に書く」のまま残り、記帳で5/12〜7/12を飛ばした

test("キーボードだけで借方・貸方を入れてTabで進むと、カードが5/12・6/12を経由し、入力欄のフォーカスを奪わない", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/tutorial/first-entry?tour=1");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "はじめる" }).press("Enter", { timeout: 15000 });
  await tour.getByRole("button", { name: "次へ", exact: true }).press("Enter");
  await page.getByRole("button", { name: "次へ →" }).press("Enter");
  await expect(tour).toContainText("4 / 12");

  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").focus();
  await page.keyboard.type("現金");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.type("100000");
  await expect(tour).toContainText("4 / 12");
  await expect(work.getByLabel("借方の金額1")).toBeFocused();

  // 「行を追加」を経て貸方の科目へ移ると、カードは貸方の段になり、フォーカスは科目欄に残る
  const creditAccount = work.getByLabel("貸方の科目1");
  for (let i = 0; i < 3 && !(await creditAccount.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(creditAccount).toBeFocused();
  await expect(tour).toContainText("5 / 12");
  await expect(tour).toContainText("貸方(右)に書く");

  await page.keyboard.type("資本金");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.type("100000");
  await expect(work.getByLabel("貸方の金額1")).toBeFocused();
  await expect(tour).toContainText("5 / 12");

  const post = work.getByRole("button", { name: "記帳する" });
  for (let i = 0; i < 3 && !(await post.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(post).toBeFocused();
  await expect(tour).toContainText("6 / 12");
  await expect(tour).toContainText("影響がその場で見える");

  await page.keyboard.press("Enter");
  await expect(tour).toContainText("8 / 12");
});

test("借方を入れ終えた段でShift+Tabで借方の科目へ戻っても、カードは借方の段のまま", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry?tour=1");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "はじめる" }).click({ timeout: 15000 });
  await tour.getByRole("button", { name: "次へ", exact: true }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(tour).toContainText("4 / 12");

  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("借方の金額1").press("Shift+Tab");
  await expect(work.getByLabel("借方の科目1")).toBeFocused();
  await expect(tour).toContainText("4 / 12");
});
