import { expect, test } from "@playwright/test";

// 貸倒れの2単元は備品600,000だけで累計額が無い。直前のテーマで習った減価償却を省いていることをガイドで断る(Issue #621)
for (const unit of ["bad-debt-loss", "allowance-for-doubtful-accounts"]) {
  test(`${unit} ステップ1で備品の減価償却の扱いが分かる`, async ({ page }) => {
    await page.goto(`/units/bad-debts/${unit}`);
    const result = page.getByRole("region", { name: "結果" });
    await expect(result.getByText("備品").first()).toBeVisible();
    const guide = page.getByRole("region", { name: "ガイド" });
    if ((await result.getByText("備品減価償却累計額").count()) === 0) {
      await expect(guide).toContainText(/減価償却(?!とは何か)/);
      await expect(guide).toContainText("省");
    }
  });
}
