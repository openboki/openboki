import { expect, test } from "@playwright/test";

// Issue #408: 雑損に不足の総額3,000を移すと、通信費へ移した2,000の案内が無く汎用文だけになっていた
test("雑損3,000の誤答に通信費へ移した2,000の案内と誤解が出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const entry = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await entry("現金過不足", "現金", "3000");
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await work.getByLabel("純資産の予想").selectOption("decrease");
  await work.getByLabel("費用の予想").selectOption("increase");
  await work.getByRole("button", { name: /予想して記帳する/ }).click();
  await next.click();
  await page.getByPlaceholder(/金額/).first().fill("1000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await expect(page.getByText("ステップ5 / 8")).toBeVisible();
  await entry("雑損", "現金過不足", "3000");
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("2,000");
  await expect(status).not.toContainText("金額をもう一度確かめましょう");
  await expect(page.getByText("よくある思い込み")).toBeVisible();
});
