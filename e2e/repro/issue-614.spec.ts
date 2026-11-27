import { expect, test } from "@playwright/test";

// 1494年の単元で後払いの買い物を現金で書くと、現代の買掛金ではなく人名勘定の言葉で説明される(Issue #614)
test("ヴェネツィア式とパチョーリ ステップ3の現金の誤答に歴史向けの誤解が出る", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await next.click();
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work.getByLabel("借方の金額1").fill("100");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("100");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("覚え書きと人名勘定");
  await expect(status).not.toContainText("買掛金");
  await expect(status).not.toContainText("掛けで売る、掛けで買う");
});
