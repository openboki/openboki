import { expect, test } from "@playwright/test";

// 年表図の右上が「1 年あたり100,000円」と数字と単位のあいだに空白を入れていた(減価償却とは何か ステップ4)
test("年表図のラベルが「1年あたり」と詰めて書かれる", async ({ page }) => {
  await page.goto("/units/depreciation/what-is-depreciation");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  for (const [k, v] of Object.entries({ 資産: "減る", 負債: "変わらない", 純資産: "減る", 収益: "変わらない", 費用: "増える" }))
    await page.getByRole("combobox", { name: `${k}の予想`, exact: true }).selectOption({ label: v });
  await page.getByRole("button", { name: /予想して記帳する/ }).click();
  await next.click();
  await page.getByRole("region", { name: "ワークスペース" }).getByPlaceholder(/金額/).fill("-260000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await expect(page.getByText(/年あたり/).first()).toHaveText("1年あたり100,000円");
});
