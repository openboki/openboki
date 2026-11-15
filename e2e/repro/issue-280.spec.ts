import { expect, test } from "@playwright/test";

test("ガイドが長いステップで「場所を示す」を押しても、ページ全体はスクロールしない", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/bookkeeping-basics/five-elements");
  const guide = page.getByRole("region", { name: "ガイド" });
  await guide.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();

  // 操作前から文書が縦にスクロールできる状態になっていないこと
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(0);

  await page.getByRole("button", { name: "使い方" }).click();
  const help = page.getByRole("dialog", { name: "会計IDEの使い方" });
  await help.getByRole("button", { name: /場所を示す/ }).first().click();
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(0);
  await expect(page.locator("header").first()).toBeInViewport();
});
