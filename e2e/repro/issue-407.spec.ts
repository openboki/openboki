import { expect, test } from "@playwright/test";

// Issue #407: 歴史の単元で科目欄に「現金」と打つと、共通の科目の説明が「会社が手元に持っているお金」と出て、
// 同じ画面の元手(商人が店に入れた財産)と時代が食い違った
test("ヴェネツィアの単元で現金の候補に「会社」が出ない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await page.getByPlaceholder(/金額/).first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await work.getByLabel("借方の科目1").fill("現金");
  const list = page.getByRole("listbox", { name: "科目の候補" });
  await expect(list).toContainText("現金");
  await expect(list).not.toContainText("会社");
});
