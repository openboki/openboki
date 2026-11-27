import { expect, test } from "@playwright/test";

// 「商品以外の後払いと手付金」ステップ2で、貸借を逆にしたうえで未収入金を売掛金にすると、
// 誤解が付かず「5つの要素の動きは合っています」だけが出た(Issue #617)
test("貸借を逆にして売掛金を使った誤答に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();

  await work.getByLabel("借方の科目1").fill("備品");
  await work.getByLabel("借方の金額1").fill("50000");
  await work.getByLabel("貸方の科目1").fill("売掛金");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("後払いなら何でも売掛金・買掛金");
  await expect(status).not.toContainText("5つの要素の動きは合っています");
});
