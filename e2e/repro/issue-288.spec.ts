import { expect, test } from "@playwright/test";

// Issue #288: 借方・貸方の由来を「相手が借りている側」「相手に貸している側」と書いていた。
// 2つ目は「(こちらが)相手に貸している側」と読めて左と同じ意味になるので、右側も相手を主語にして「相手が貸している側」と書く
test("覚え書きと人名勘定 ステップ3の由来の文が右側を相手主語で説明する", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByRole("spinbutton").or(work.getByRole("textbox")).first().fill("70");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(guide.getByText(/もとは人名勘定の/)).toBeVisible();
  await expect(guide.getByText(/相手に貸している側/)).toHaveCount(0);
  await expect(guide.getByText(/「相手が借りている側」「相手が貸している側」/)).toBeVisible();
});
