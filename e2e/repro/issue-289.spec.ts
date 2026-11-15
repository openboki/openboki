import { expect, test } from "@playwright/test";

// view: noneの結果ペインが、覚え書き(帳簿1冊)から始まる本文と矛盾する「帳簿がありません」を出していた
test("覚え書きと人名勘定の結果ペインが「帳簿が無い」と言わない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await expect(page.getByRole("region", { name: "ガイド" }).getByText(/帳簿は1冊だけ/)).toBeVisible();
  const result = page.getByRole("region", { name: "結果" });
  await expect(result.getByText("この時代にはまだ帳簿がありません。")).toHaveCount(0);
  // 本文30行目と同じ範囲(無いのは複式の仕訳帳と結果の表)で言う
  await expect(result.getByText("この時代にはまだ仕訳帳も結果の表もありません。")).toBeVisible();
});
