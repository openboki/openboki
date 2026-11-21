import { expect, test, type Page } from "@playwright/test";

// Issue #530: ステップ8が『スンマ』の手順として「閉じる前に元帳の左右の合計で検算する」と書いていた。
// 『スンマ』で総合計を突き合わせるのは締めたあとの最後の確かめ(第34章)で、締める前は仕訳帳と元帳の照合(第32章)
async function post(page: Page, debit: [string, number], credit: [string, number]) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(String(debit[1]));
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(String(credit[1]));
  await work.getByRole("button", { name: /記帳する/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
}

test("ヴェネツィア式とパチョーリのステップ8・10が、締め切り前の総合計の検算を『スンマ』の手順としない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await next();
  await next();
  await post(page, ["絹(フランドル航海)", 100], ["ニッコロ", 100]);
  await next();
  await next();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  await post(page, ["絹(フランドル航海)", 30], ["利益と損失", 30]);
  await next();
  await next();

  // ステップ8: 締める前の確かめは仕訳帳と元帳の照合、総合計の突き合わせは閉じたあと
  await expect(page.getByText("ステップ8 / 10")).toBeVisible();
  await expect(guide).not.toContainText("閉じる前に検算をします");
  await expect(guide).toContainText("帳簿を閉じたあとの最後の確かめ");
  await post(page, ["利益と損失", 20], ["元手", 20]);
  await next();
  await next();

  // ステップ10: ふりかえりも同じ順序でまとめる
  await expect(page.getByText("ステップ10 / 10")).toBeVisible();
  await expect(guide).not.toContainText("検算してから帳簿を閉じる");
  await expect(guide).toContainText("閉じたあとに左右の総合計を比べる");
});
