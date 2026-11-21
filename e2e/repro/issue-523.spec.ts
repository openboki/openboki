import { expect, test } from "@playwright/test";

// Issue #523: 前の単元の最後ではマッテオは払い終え、店はニッコロに20を負っていたのに、
// この単元の開始残高(マッテオ20、ニッコロ無し)との間に何が起きたかが本文に無く、
// 1386年の胡椒の売り(ジョヴァンニに60と30)も前の単元の3月と同じ数字で見分けがつかなかった
test("航海の儲けのステップ1で、前の単元から1年の間の出来事と、この春の売りが別の取引だと分かる", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  const guide = page.getByRole("region", { name: "ガイド" });
  const result = page.getByRole("region", { name: "結果" });

  // 開始残高は変えない(ジョヴァンニ70、マッテオ20、ニッコロの行は無い)
  await expect(result.getByRole("row", { name: /ジョヴァンニ/ })).toContainText("70");
  await expect(result.getByRole("row", { name: /マッテオ/ })).toContainText("20");
  await expect(result.getByRole("row", { name: /ニッコロ/ })).toHaveCount(0);

  // 1年の間の出来事: ニッコロに残りを払い終えた、マッテオに新しく20を売った
  await expect(guide.getByText(/ニッコロに布の代金の残り20ドゥカートを払い終え/)).toBeVisible();
  await expect(guide.getByText(/マッテオには新しく布を20で売/)).toBeVisible();
  // 開始残高のマッテオ20がこの売りだと分かる
  await expect(guide.getByText(/マッテオはこの1年の間に売った布の20/)).toBeVisible();
  // 1386年の胡椒の売りは、前の単元の3月と同じ数字でも別の取引
  await expect(guide.getByText(/1年あとの別の売り/)).toBeVisible();
});
