import { expect, test } from "@playwright/test";

// 概念マップ(/map、Issue #34)。概念を選ぶと説明が出て、検索と分野の絞り込みで図が変わる

test("概念を押すと説明とつながりが出て、つながりから別の概念へ移れる", async ({ page }) => {
  await page.goto("/map");
  const detail = page.getByRole("complementary", { name: "概念の説明" });
  await page.locator('.react-flow__node[data-id="five_elements"]').click();
  await expect(detail.getByRole("heading", { level: 2 })).toContainText("5要素");
  await expect(detail.getByRole("link", { name: "用語集で見る" })).toHaveAttribute("href", "/glossary#five_elements");

  // 選んだ概念とつながらない概念は薄くなる
  await expect(page.locator('.react-flow__node[data-id="five_elements"]')).not.toHaveClass(/opacity-25/);
  await expect(page.locator('.react-flow__node[data-id="petty_cash"]')).toHaveClass(/opacity-25/);

  await detail.getByRole("button", { name: "資産", exact: true }).click();
  await expect(detail.getByRole("heading", { level: 2 })).toContainText("資産");
  await expect(page.locator('.react-flow__node[data-id="asset"]')).toHaveClass(/selected/);
});

test("検索してEnterを押すと、一致した概念が選ばれる", async ({ page }) => {
  await page.goto("/map");
  const search = page.getByLabel("概念を検索");
  // 読みでも引ける
  await search.fill("げんかしょうきゃく");
  await expect(page.getByText("1件。Enterで最初の概念へ移動")).toBeVisible();
  await search.press("Enter");
  await expect(page.getByRole("complementary", { name: "概念の説明" }).getByRole("heading", { level: 2 })).toContainText("減価償却");
  await expect(page.locator('.react-flow__node[data-id="depreciation"]')).toBeInViewport();

  await search.fill("存在しない語");
  await expect(page.getByText("該当する概念がありません")).toBeVisible();
});

test("分野を外すとその分野の概念が図から消え、戻すと現れる", async ({ page }) => {
  await page.goto("/map");
  const all = await page.locator(".react-flow__node").count();
  const history = page.getByRole("button", { name: "会計の歴史" });
  await expect(history).toHaveAttribute("aria-pressed", "true");
  await history.click();
  await expect(history).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator('.react-flow__node[data-id="depreciation"]')).toBeVisible();
  expect(await page.locator(".react-flow__node").count()).toBeLessThan(all);
  await history.click();
  await expect(page.locator(".react-flow__node")).toHaveCount(all);
});

test("ヘッダーと用語集から概念マップを開ける", async ({ page }) => {
  await page.goto("/glossary");
  await page.getByRole("navigation").getByRole("link", { name: "概念マップ" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await page.goto("/glossary");
  await page.getByRole("main").getByRole("link", { name: "概念マップ" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "概念マップ" })).toBeVisible();
});
