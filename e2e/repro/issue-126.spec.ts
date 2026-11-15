import { expect, test } from "@playwright/test";

// Issue #126: predictで定義外の誤答をすると、やり直せないのに「もう一度試して」と出ていた。
// 5つの要素と仕訳 ステップ3は誤答が全部定義済みになった(Issue #333)ので、定義外の誤答が残る減価償却の単元で確かめる
test("predictの定義外の誤答で、やり直せないのに「もう一度試して」と案内しない", async ({ page }) => {
  await page.goto("/units/depreciation/what-is-depreciation");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  // 資産「増える」はwrong_patternsのどれにも当たらない。他は正解の動き
  for (const [element, label] of [["資産", "増える"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]]) {
    await work.getByRole("combobox", { name: `${element}の予想`, exact: true }).selectOption({ label });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("もう一歩");
  // 予想は1回限りで、回答後は選択肢が無効になり「予想して記帳する」も消える
  await expect(work.getByRole("combobox", { name: "資産の予想", exact: true })).toBeDisabled();
  await expect(work.getByRole("button", { name: "予想して記帳する" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "次へ →" })).toBeEnabled();
  await expect(status).not.toContainText("もう一度試して");
  await expect(status).toContainText("次へ進めます");
});
