import { test, expect, type Locator } from "@playwright/test";

// ガイドの表の1列目(日付などの短いラベル)のセルごとに、Rangeの行ボックスの数(重複を除いたtop)を数える
async function firstColumnLineCounts(guide: Locator) {
  return guide.evaluate((el) =>
    [...el.querySelectorAll("table tr td:first-child")].map((td) => {
      const r = document.createRange();
      r.selectNodeContents(td);
      return [td.textContent, new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size] as const;
    }),
  );
}

async function openMemorandumTable(page: import("@playwright/test").Page) {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.locator("table")).toBeVisible();
  return guide;
}

test("覚え書きの表の日付が1行に収まる(1280幅)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const guide = await openMemorandumTable(page);
  const lines = await firstColumnLineCounts(guide);
  expect(lines.length).toBeGreaterThan(0);
  for (const [date, n] of lines) expect(n, `${date}が折り返している`).toBe(1);
});

test("覚え書きの表が狭い画面でもガイドの幅を超えない(390幅)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const guide = await openMemorandumTable(page);
  const lines = await firstColumnLineCounts(guide);
  for (const [date, n] of lines) expect(n, `${date}が折り返している`).toBe(1);
  const overflow = await guide.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

// 1列目を折り返さなくしても、見出しの長い表(航海の儲けと複式の発見 ステップ2)が狭い画面ではみ出さない
test("航海1口のページの表が狭い画面でもガイドの幅を超えない(390幅)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide.locator("table")).toBeVisible();
  const overflow = await guide.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
