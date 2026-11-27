import { test, expect, type Page } from "@playwright/test";

async function openStep5(page: Page) {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder("金額(ドゥカート)").fill("70");
  await page.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 7")).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByRole("button", { name: "わかった" }).click().catch(() => {});
  const board = page.getByRole("group", { name: "仕分けボード" });
  for (const [d, side] of [
    ["3月9日", "左"],
    ["3月14日", "右"],
    ["3月18日", "右"],
    ["3月20日", "左"],
    ["3月22日", "左"],
  ]) {
    await board.getByRole("button", { name: new RegExp(`^${d} `) }).click();
    await board.getByRole("button", { name: new RegExp(`^${side}\\(`) }).click();
  }
  await page.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByRole("heading", { name: "ページを読む" })).toBeVisible();
  return page.getByRole("region", { name: "ガイド" });
}

// 1列目の長い摘要(「3月20日 胡椒10袋を売った」)が折れずに幅を取ると、残りの列が1文字幅まで縮む
for (const width of [1024, 1152, 1280]) {
  test(`人名勘定の表の列が1文字幅まで縮まない(${width}幅)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 768 });
    const guide = await openStep5(page);
    const table = guide.locator("table");
    // 見出し「こちらが彼に負う」が1文字ずつ縦に並ぶと行が150px前後になる
    const headerHeight = await table.locator("th").nth(2).evaluate((th) => th.getBoundingClientRect().height);
    expect(headerHeight).toBeLessThan(80);
    const cell = table.locator("td", { hasText: "3月5日 受け取った" });
    const height = await cell.evaluate((td) => td.getBoundingClientRect().height);
    expect(height).toBeLessThan(80);
    expect(await guide.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });
}
