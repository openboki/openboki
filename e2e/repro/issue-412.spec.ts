import { expect, test } from "@playwright/test";

// Issue #412: 科目より先に金額を入れると、金額欄に1,000が見えているのに集計が「合計0」「貸方合計0 不一致」と出ていた
test("金額だけ入れた段階で、集計の合計が金額欄と食い違わない", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry");
  await page.getByText(/ステップ1 \//).first().waitFor();
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  if (await tour.isVisible()) await tour.getByRole("button", { name: /スキップ|閉じる/ }).first().click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の金額1").fill("1000");
  await work.getByLabel("貸方の金額1").fill("1000");
  await expect(work.getByText(/借方合計/)).toContainText("借方合計1,000 / 貸方合計1,000");
  await work.getByLabel("借方の科目1").fill("現金");
  await expect(work.getByText(/借方合計/)).toContainText("借方合計1,000 / 貸方合計1,000");
  await expect(work.getByText(/借方合計/)).not.toContainText("不一致");
  // 記帳できない理由は行の案内が伝える
  await expect(work.getByText("科目を選んでください")).toBeVisible();
});
