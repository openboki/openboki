import { expect, test } from "@playwright/test";

// Issue #353: アクセス解析(Umami)の導入に合わせて、閲覧の記録・目的・保存期間をポリシーに書く(ADR 0011)
test("プライバシーポリシーにアクセス解析の記録・目的・保存期間と改定日がある", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByText("単元を読むだけでは何も保存しません")).toHaveCount(0);
  await expect(page.getByText("単元を読むだけでは匿名ユーザーを作りません。ページの閲覧は、個人を特定しない形で記録します。", { exact: false })).toBeVisible();
  await expect(page.getByText(/^アクセス解析: 閲覧したページ、参照元、ブラウザとOSの種類、画面サイズ、IPアドレスから推定した国・都道府県・市区町村/)).toBeVisible();
  await expect(page.getByText("IPアドレス自体は解析の記録に保存しません", { exact: false })).toBeVisible();
  await expect(page.getByText("どこで離れているかを知り、教材と導線を直すため", { exact: false })).toBeVisible();
  await expect(page.getByText("期間を定めずに保存します", { exact: false })).toBeVisible();
  await expect(page.getByText("改定: 2026年11月21日", { exact: false })).toBeVisible();
  // 変えない約束
  await expect(page.getByText("アクセス解析や広告のためのCookieは使いません", { exact: false })).toBeVisible();
  await expect(page.getByText("取得した情報を第三者に提供・販売しません", { exact: false })).toBeVisible();
});
