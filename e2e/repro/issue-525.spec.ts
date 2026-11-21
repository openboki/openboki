import { expect, test } from "@playwright/test";

// Issue #525: 歴史の単元の仕訳エディタが、見出しに5要素の「増える側」を出して本文の左右の説明と食い違っていた
test("歴史の単元の仕訳エディタは、5要素の増える側を見出しに出さない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await work.getByRole("textbox").or(work.getByRole("spinbutton")).first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await expect(work.getByLabel("借方の科目1")).toBeVisible();
  await expect(work).not.toContainText("資産と費用が増える側");
  await expect(work).not.toContainText("収益が増える側");
  await expect(work.getByText("左", { exact: true })).toBeVisible();
  await expect(work.getByText("右", { exact: true })).toBeVisible();
});

test("現代の単元の仕訳エディタは、これまでどおり増える側を見出しに出す", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(work.getByLabel("借方の科目1")).toBeVisible();
  await expect(work.getByText("左 · 資産と費用が増える側")).toBeVisible();
  await expect(work.getByText("右 · 負債・純資産・収益が増える側")).toBeVisible();
});
