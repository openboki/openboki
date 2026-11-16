import { expect, test } from "@playwright/test";

// Issue #362: 用語「定額資金前渡法」の説明が、補給を報告と同時に行うことを定義の一部に読ませ、
// 報告(ステップ4)と補給(ステップ5)を分けて教える単元の採点と食い違っていた
test("用語「定額資金前渡法」: 補給を報告と同時に行うことを必須に読ませない", async ({ page }) => {
  await page.goto("/glossary#imprest_system");
  const entry = page.locator("#imprest_system");
  await expect(entry).toBeVisible();
  await expect(entry).toContainText("定額資金前渡法");
  await expect(entry).not.toContainText("費用を記録すると同時に、使った分と同じ金額を補給する");
  await expect(entry).toContainText("補給");
  await expect(entry).toContainText("定額");
});

test("用語「小口現金」: 仕組みではなく現金(資産)として説明する", async ({ page }) => {
  await page.goto("/glossary#petty_cash");
  const entry = page.locator("#petty_cash");
  await expect(entry).toBeVisible();
  await expect(entry).not.toContainText("小口現金から払う仕組み");
  await expect(entry).toContainText("現金");
});
