import { expect, test } from "@playwright/test";

// Issue #322: 「ジョヴァンニが立て替えて」は彼が代わりに払った意味になり、仕訳「Per ジョヴァンニ // A 絹」の向きと逆に読めた。
// ふりかえりの「船や機械を買った鉄道会社」も鉄道会社の例に合っていなかった
test("ヴェネツィア式とパチョーリ: 便りの文言は仕訳の向きに合い、ふりかえりの鉄道会社の例に船が出ない", async ({ page }) => {
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

  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 /")).toBeVisible();
  await post(["絹(フランドル航海)", 100], ["ニッコロ", 100]);
  await next.click();
  await expect(page.getByText("ステップ4 /")).toBeVisible();
  await expect(guide).toContainText("こちらに負う");
  await expect(guide).not.toContainText("立て替え");

  await next.click();
  await expect(page.getByText("ステップ5 /")).toBeVisible();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await expect(page.getByText("ステップ6 /")).toBeVisible();
  await post(["絹(フランドル航海)", 30], ["利益と損失", 30]);
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ8 /")).toBeVisible();
  await post(["利益と損失", 20], ["元手", 20]);
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ10 /")).toBeVisible();
  await expect(guide).toContainText("鉄道会社");
  await expect(guide).not.toContainText("船や機械");
});
