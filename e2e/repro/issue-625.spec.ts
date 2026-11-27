import { expect, test } from "@playwright/test";

// Issue #625: 「掛けで売る、掛けで買う」ステップ2で掛け仕入を正しく記帳すると、結果の表のもうけが
// 「当期純損失 △20,000」に変わるのに、本文も成功文も損失に触れず、当期純損失の定義は次の単元「返品と運賃」が初めてだった
test("掛け仕入の後に出る当期純損失を、ステップ2の本文が用語リンク付きで定義し、成功文も損失に触れる", async ({ page }) => {
  await page.goto("/units/merchandise/credit-transactions");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();

  // 記帳の前から、本文が当期純損失と△の意味を説明している
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.getByRole("button", { name: "当期純損失" })).toBeVisible();
  await expect(guide).toContainText("△");

  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("40000");
  await work.getByLabel("貸方の科目1").fill("買掛金");
  await work.getByLabel("貸方の金額1").fill("40000");
  await work.getByRole("button", { name: "記帳する" }).click();
  const success = page.getByRole("status").filter({ hasText: "できました" });
  await expect(success).toBeVisible();
  await expect(page.getByRole("region", { name: "結果" })).toContainText("当期純損失");

  // 成功文も、もうけの行が当期純損失に変わったことに触れる
  await expect(success).toContainText("損失");
});
