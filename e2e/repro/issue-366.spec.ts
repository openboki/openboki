import { expect, test } from "@playwright/test";

// Issue #366: 単元限定の科目(漢字名)を読みで引ける
test("歴史の単元で「こしょう」「もとで」と打つと、単元限定の科目が候補に出る", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  await next.click();
  await work.getByPlaceholder(/^金額\(/).fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  const field = work.getByLabel("借方の科目1");
  const list = page.getByRole("listbox", { name: "科目の候補" });
  await field.fill("こしょう");
  await expect(list.getByRole("option", { name: /胡椒\(アレクサンドリア航海\)/ })).toBeVisible();
  await field.fill("もとで");
  await expect(list.getByRole("option", { name: /元手/ })).toBeVisible();
});
