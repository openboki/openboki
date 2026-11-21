import { expect, test } from "@playwright/test";

// Issue #352: UMAMI_URLとUMAMI_WEBSITE_IDを渡さないビルド(ローカル開発、フォーク、E2E)は、計測スクリプトを読み込まない
test("接続先が未設定のサイトは計測スクリプトを要求しない", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "script") scripts.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "用語集" }).first().click();
  await page.waitForURL("**/glossary");
  await expect(page.locator("script[data-website-id]")).toHaveCount(0);
  expect(scripts.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
});
