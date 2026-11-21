import { expect, test } from "@playwright/test";

// 1385年を複式簿記の前の時代とし、仕訳帳に「これから百年あまりかけてたどり着く」と書く
test("覚え書きと人名勘定のステップ1が複式簿記の成立を1385年より後に置かない", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await expect(page.getByText("ステップ1 / 7")).toBeVisible();
  await expect(guide.getByText("これから百年あまりかけてたどり着く")).toHaveCount(0);
  // 「この店にはまだ無い」と「よそでは使われ始めていた」の書き分けがある
  await expect(guide.getByText("この店にはまだありません")).toBeVisible();
  await expect(guide.getByText("使われ始めていました")).toBeVisible();
  // flow図は年代ではなく、この店のいまからたどる順序として読める
  await expect(guide.getByText("覚え書き1冊(この店のいま)")).toBeVisible();
  await expect(guide.getByText("覚え書き1冊(1385年)")).toHaveCount(0);
});
