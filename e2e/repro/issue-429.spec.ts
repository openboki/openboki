import { test, expect } from "@playwright/test";

// 予想する要素はtask.elementsで絞られる(five-elementsのステップ3は資産だけ)ので、案内が「5要素」を前提にしない
test("最初の予想のステップで、説明が画面の選択欄の数と一致する", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await page.keyboard.press("Escape");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await page.keyboard.press("Escape");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status")).toContainText("できました");
  await page.getByRole("button", { name: "次へ →" }).click();

  await expect(work.locator("select")).toHaveCount(1);
  await expect(work.getByRole("note")).toBeVisible();
  await expect(work.getByRole("note")).not.toContainText("5要素");
  await page.getByRole("button", { name: "使い方" }).click();
  const dialog = page.getByRole("dialog").last();
  await expect(dialog).toContainText("予想して記帳する");
  await expect(dialog).not.toContainText("5要素それぞれ");
});
