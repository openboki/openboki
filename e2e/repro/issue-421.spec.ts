import { test, expect } from "@playwright/test";

// Issue #421: 用語集の検索が説明文(summary)まで見る。説明文にだけ一致した項目は名前・別名・読み・shortに一致した項目より後ろに並ぶ

test("用語集で「パチョーリ」を検索すると3帳簿と覚え書きが見つかる", async ({ page }) => {
  await page.goto("/glossary");
  const search = page.getByLabel("用語を検索");
  await search.fill("スンマ");
  await expect(page.locator("main").getByText("3帳簿", { exact: true })).toBeVisible();
  await search.fill("パチョーリ");
  await expect(page.getByText("該当する用語がありません")).toHaveCount(0);
  await expect(page.locator("main").getByText("3帳簿", { exact: true })).toBeVisible();
  await expect(page.locator("#memorandum_book")).toBeVisible();
  // 説明文にだけ一致した項目は、見出しでそれと分かる
  await expect(page.locator("main h2").first()).toHaveText("説明文に一致する用語");
});

test("説明文にだけ一致した項目は、名前・shortに一致した項目より後ろに並ぶ", async ({ page }) => {
  await page.goto("/glossary");
  const search = page.getByLabel("用語を検索");
  // 「現」は現金が先頭(#298)。説明文にだけ「現」を含む項目は末尾のグループに1回だけ出る
  await search.fill("現");
  await expect(page.locator("main dt").first()).toContainText("現金");
  await expect(page.locator("main h2").last()).toHaveText("説明文に一致する用語");
  await expect(page.locator('main div[id="cash"]')).toHaveCount(1);
  // 「スンマ」は3帳簿のshortにあり、覚え書きの説明文にだけある。3帳簿が分野のグループに出て、覚え書きがその後ろに出る
  await search.fill("スンマ");
  await expect(page.locator("#memorandum_book")).toBeVisible();
  const summarySection = page.locator("main section", { has: page.locator("h2", { hasText: "説明文に一致する用語" }) });
  await expect(summarySection.locator("#memorandum_book")).toHaveCount(1);
  await expect(summarySection.locator("#three_books")).toHaveCount(0);
  const ids = await page.locator("main div[id]").evaluateAll((els) => els.map((el) => el.id));
  expect(ids.indexOf("three_books")).toBeLessThan(ids.indexOf("memorandum_book"));
});
