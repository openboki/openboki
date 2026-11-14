import { expect, test } from "@playwright/test";

// Issue #285: 歴史の単元の計算問題で60と答えると、3級の現代語で書かれた誤解「仕入の運賃を別の費用にする」と
// 「返品と運賃」へのリンクが出ていた。口別計算の言葉で書いた誤解を出す
test("航海のもうけの誤答に仕入諸掛の誤解を出さない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByRole("textbox").first().fill("60");
  await work.getByRole("button", { name: "確認する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("仕入諸掛");
  await expect(status).not.toContainText("返品と運賃");
  await expect(status).toContainText("運賃と関税を引かない");
});
