import { expect, test } from "@playwright/test";

// Issue #540: 概念「仮払金・仮受金」のshortが仮払金の側(金額や使い道が未定の支払い)しか言い表しておらず、
// 金額は分かるが正体が分からない入金(仮受金)に当てはまらなかった。
// 単元「預かったお金、仮のお金」ステップ5の用語ポップオーバーも用語集と同じshortを出す
test("「仮払金・仮受金」の短い定義が、仮受金(正体の分からない入金)も言い表す", async ({ page }) => {
  await page.goto("/glossary#suspense_accounts");
  const entry = page.locator('[id="suspense_accounts"]');
  await expect(entry).not.toContainText("金額や使い道がまだ決まっていないお金の出入り");
  await expect(entry).toContainText("正体の分からない入金(仮受金)");
});
