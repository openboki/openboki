import { expect, test } from "@playwright/test";

// Issue #432: ジョヴァンニの残高(ステップ2)で50と答えると説明が出ず、60・80の説明はステップ3で導入する人名勘定の左右を前提にしていた
test("覚え書きから数える計算で、18日の買いと22日の払いを両方引いた50にも説明が付き、未導入の人名勘定の左右を前提にしない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const input = page.getByRole("region", { name: "ワークスペース" }).getByPlaceholder("金額(ドゥカート)");
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });

  // 売り115 − 受け取り45 − 18日の買い10 − 22日の払い10 = 50
  await input.fill("50");
  await page.getByRole("button", { name: "確認する" }).click();
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("まだ合っていません。計算の式と、使う数字をもう一度確かめましょう。");
  await expect(status).toContainText("差し引き0");

  // ステップ2の時点では人名勘定(ステップ3で導入)も左右のページもまだ出ていない
  for (const v of ["60", "80"]) {
    await input.fill(v);
    await page.getByRole("button", { name: "確認する" }).click();
    await expect(status).toBeVisible();
    await expect(status).toContainText("よくある思い込み");
    await expect(status).not.toContainText("人名勘定");
  }
});
