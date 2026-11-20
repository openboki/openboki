import { expect, test } from "@playwright/test";

// Issue #413: 資産どうしの仕訳を貸借逆に記帳すると、比較表が5行とも「±0 / ±0」になり、合っているように読めた
test("同じ要素どうしの誤答で、全要素±0 / ±0の比較表を出さない", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/loans");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const field = async (label: string, value: string) => {
    await work.getByLabel(label).fill(value);
    await page.keyboard.press("Escape");
  };
  await field("借方の科目1", "普通預金");
  await field("借方の金額1", "100000");
  await field("貸方の科目1", "貸付金");
  await field("貸方の金額1", "100000");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status.getByRole("table")).toHaveCount(0);

  // 5要素に差が出る誤答では、従来どおり表を出してずれた行を強調する
  await field("貸方の科目1", "借入金");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(status.getByRole("table")).toBeVisible();
  await expect(status.locator("tbody tr.text-diff-fg")).not.toHaveCount(0);
});
