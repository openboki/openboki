import { expect, type Page, test } from "@playwright/test";

// Issue #265: 説明だけのステップで、ガイドを読み終えてから「次へ →」まで結果ペインの科目名を全部Tabで通っていた
async function tabsFromGuideToNext(page: Page, url: string) {
  await page.goto(url);
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.isVisible()) await later.click();
  // ガイドの最後のフォーカス先から数える(無ければガイド自体)
  await page.getByRole("region", { name: "ガイド" }).evaluate((guide) => {
    const stops = guide.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    (stops[stops.length - 1] ?? (guide as HTMLElement)).focus();
  });
  let presses = 0;
  for (; presses < 40; presses++) {
    const name = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    if (name.startsWith("次へ")) break;
    await page.keyboard.press("Tab");
  }
  return presses;
}

test("observeステップで、ガイド末尾から「次へ →」までTab 6回以内で届く", async ({ page }) => {
  expect(await tabsFromGuideToNext(page, "/units/receivables-and-payables/temporary-and-deposits")).toBeLessThanOrEqual(6);
  // 科目が無い単元でも、結果ペインの停止は損益計算書の当期純利益の1つだけ
  expect(await tabsFromGuideToNext(page, "/units/bookkeeping-basics/five-elements")).toBeLessThanOrEqual(4);
});

// 当期純利益の行も科目名と同じ並びに入る
test("結果ペインの科目名は矢印キーで移れる", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.isVisible()) await later.click();
  const terms = page.getByRole("region", { name: "結果" }).locator("button.term");
  await terms.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(terms.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(terms.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(terms.first()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
});
