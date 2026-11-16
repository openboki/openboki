import { expect, test } from "@playwright/test";

// Issue #388: 減価償却累計額が資産の末尾にまとまり、本文の「車両運搬具と累計額が並んでいます」と合わなかった
test("減価償却累計額が対応する資産の直後に並ぶ", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const bs = page.getByRole("region", { name: "結果" }).getByRole("region", { name: "貸借対照表" });
  const text = (await bs.innerText()).replace(/\s+/g, " ");
  expect(text).toMatch(/備品 600,000 備品減価償却累計額 △ マイナス 150,000 車両運搬具 1,200,000 車両運搬具減価償却累計額/);
});
