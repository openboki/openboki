import { expect, test } from "@playwright/test";

// 4/12の段で貸方まで入れて記帳すると、記入の段(4〜6/12)を古い指示のまま出し続けていた
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("スマホで4/12のまま記帳すると、記入の段を飛ばして8/12「ここは結果」へ進む", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry?tour=1");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "はじめる" }).click({ timeout: 15000 });
  await tour.getByRole("button", { name: "次へ", exact: true }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(tour).toContainText("借方(左)に書く");

  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("100000");
  await work.getByRole("button", { name: /^記帳する/ }).click();
  await expect(page.getByRole("status")).toContainText("できました");

  await expect(tour).toContainText("8 / 12");
  await expect(tour).toContainText("ここは結果");
  await expect(tour).not.toContainText("ワークスペース」のタブに戻ると続けられます");
});
