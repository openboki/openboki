import { test, expect } from "@playwright/test";

test("科目欄に「し」と打つと、読みが「し」で始まる科目が部分一致だけの科目より先に並ぶ", async ({ page }) => {
  await page.goto("/units/merchandise/three-account-method");
  await page.getByRole("region", { name: "ガイド" }).waitFor();
  await page.getByRole("button", { name: "次へ →" }).click();
  const acc = page.getByRole("combobox", { name: "借方の科目1" });
  await acc.click();
  await acc.pressSequentially("し");
  const options = page.getByRole("listbox", { name: "科目の候補" }).getByRole("option");
  await expect(options.first()).toBeVisible();
  const names = (await options.allInnerTexts()).map((t) => t.split("\n")[0]);
  const purchases = names.indexOf("仕入");
  const allowance = names.findIndex((n) => n.startsWith("貸倒引当金"));
  expect(purchases).toBeGreaterThanOrEqual(0);
  expect(purchases).toBeLessThan(allowance);
});
