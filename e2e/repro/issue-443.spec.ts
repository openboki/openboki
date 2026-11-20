import { expect, test } from "@playwright/test";

// 仕入の返品で右に繰越商品・左に現金を書くと、どちらも「返品を新しい取引として記録」が付き、
// 繰越商品の誤答に当たる「仕入は資産」と、現金の誤答に当たる「掛けで買っても現金が減る」が出なかった
test("仕入の返品で右に繰越商品・左に現金を書くと、それぞれの誤解が出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const post = async (debit: string, credit: string) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill("10000");
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill("10000");
    await work.getByRole("button", { name: "記帳する" }).click();
  };

  await page.goto("/units/merchandise/returns-and-costs");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("52000");
  await work.getByLabel("貸方の科目1").fill("買掛金");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "行を追加" }).nth(1).click();
  await work.getByLabel("貸方の科目2").fill("現金");
  await work.getByLabel("貸方の金額2").fill("2000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 8")).toBeVisible();

  // 右に繰越商品: 買った商品を資産で持っていると考えた誤答
  await post("買掛金", "繰越商品");
  await expect(status).toContainText("取り消すときは右に仕入を書きます");
  await expect(status).toContainText("仕入は資産");
  await expect(status).not.toContainText("返品を新しい取引として記録");

  // 左に現金: 掛けで買った豆を返すとお金が戻ると考えた誤答
  await post("現金", "仕入");
  await expect(status).toContainText("返してもお金は戻ってきません");
  await expect(status).toContainText("掛けで買っても現金が減る");
  await expect(status).not.toContainText("返品を新しい取引として記録");
});
