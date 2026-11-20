import { expect, test } from "@playwright/test";

// Issue #438: 誤答のあとの比較表で、食い違う行を文字色と太さだけで示していた
test("postの比較表の食い違う行は色以外でも見分けられる", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.evaluate(() => { localStorage.setItem("theme", "town-shop"); localStorage.setItem("mode", "light"); });
  await page.reload();
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const w = page.getByRole("region", { name: "ワークスペース" });
  const set = async (label: string, v: string) => { await w.getByLabel(label).fill(v); await page.keyboard.press("Escape"); };
  await set("借方の科目1", "給料"); await set("借方の金額1", "100000");
  await set("貸方の科目1", "普通預金"); await set("貸方の金額1", "97000");
  await w.getByRole("button", { name: "行を追加" }).nth(1).click();
  await set("貸方の科目2", "雑益"); await set("貸方の金額2", "3000");
  await w.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status");
  await expect(status.getByText("もう一歩")).toBeVisible();
  const rows = status.locator("tbody tr");
  // 資産は一致、負債は食い違う
  await expect(rows.nth(0)).not.toContainText("食い違い");
  await expect(rows.nth(1)).toContainText("≠");
  await expect(rows.nth(1)).toContainText("食い違い");
  // 背景でも塗り分ける
  const bg = (i: number) => rows.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg(1)).not.toBe(await bg(0));
});

test("predictの比較表の食い違う行は色以外でも見分けられる", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("資産の予想", { exact: true }).selectOption("decrease");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  const row = page.getByRole("status").locator("tbody tr").first();
  await expect(row).toContainText("≠");
  await expect(row).toContainText("食い違い");
});
