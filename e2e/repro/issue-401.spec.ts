import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test("仕訳帳(記帳済み)で、借方の各行が別々の行に並ぶ", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  const tabs = page.getByRole("tablist", { name: "ペインの切り替え" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await tabs.getByRole("tab", { name: "ワークスペース" }).click();
  await work.getByPlaceholder(/金額/).first().fill("900000");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await tabs.getByRole("tab", { name: "ワークスペース" }).click();
  const lines: [string, string, number][] = [["借方", "現金", 850000], ["借方", "車両運搬具減価償却累計額", 300000], ["借方", "固定資産売却損", 50000], ["貸方", "車両運搬具", 1200000]];
  const count = { 借方: 0, 貸方: 0 };
  for (const [side, account, amount] of lines) {
    const n = ++count[side as "借方" | "貸方"];
    if (n > 1) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
    await work.getByLabel(`${side}の科目${n}`).fill(account);
    await work.getByLabel(`${side}の金額${n}`).fill(String(amount));
  }
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status")).toContainText("できました");
  await tabs.getByRole("tab", { name: "ワークスペース" }).click();
  const debit = work.locator("li").filter({ hasText: "4月1日、軽バン" }).locator("div.grid > div").first();
  // 各行の先頭は、前の行の最後の行ボックスより下から始まる
  const rows = await debit.locator(":scope > span").evaluateAll((els) =>
    els.map((e) => { const rs = [...e.getClientRects()]; return { top: rs[0].top, bottom: rs[rs.length - 1].bottom }; }));
  expect(rows).toHaveLength(3);
  for (let i = 1; i < rows.length; i++) expect(rows[i].top).toBeGreaterThanOrEqual(rows[i - 1].bottom - 1);
});
