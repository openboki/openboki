import { expect, test } from "@playwright/test";

// Issue #286: 胡椒の口を「売り切れず」(口が開いたまま)と書きながら10を今年の損にし、
// ステップ9の「閉じるまで利益にも損にもならない」と食い違っていた
test("ヴェネツィア式とパチョーリ: 胡椒の口は閉じた理由を書いて損にし、持ち越すのは残高の有るページだけ", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const post = async (debit: [string, number], credit: [string, number]) => {
    await work.getByLabel("借方の科目1").fill(debit[0]);
    await work.getByLabel("借方の金額1").fill(String(debit[1]));
    await work.getByLabel("貸方の科目1").fill(credit[0]);
    await work.getByLabel("貸方の金額1").fill(String(credit[1]));
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  };

  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await expect(page.getByText("ステップ1 /")).toBeVisible();
  await expect(guide).toContainText("胡椒");
  await expect(guide).not.toContainText("売り切れず");

  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 /")).toBeVisible();
  await post(["絹(フランドル航海)", 100], ["ニッコロ", 100]);
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ5 /")).toBeVisible();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await expect(page.getByText("ステップ6 /")).toBeVisible();
  await post(["絹(フランドル航海)", 30], ["利益と損失", 30]);
  await next.click();
  await expect(page.getByText("ステップ7 /")).toBeVisible();
  await expect(guide).toContainText("損");
  await expect(guide).not.toContainText("売り切れず");

  await next.click();
  await expect(page.getByText("ステップ8 /")).toBeVisible();
  await post(["利益と損失", 20], ["元手", 20]);
  const success = page.getByRole("status").filter({ hasText: "元手が420" });
  await expect(success).toBeVisible();
  await expect(success).not.toContainText("残った品のページ");
});
