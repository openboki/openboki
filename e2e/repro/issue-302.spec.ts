import { expect, test } from "@playwright/test";

// Issue #302: 運営者・ライセンス・貢献の入口が分かるページがサイト上に無かった

test("/aboutに運営者・ライセンス・貢献の入口が載っている", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveTitle("このサイトについて | Open簿記");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1, name: "このサイトについて" })).toBeVisible();
  for (const name of ["運営者", "ライセンス", "使っている素材", "参加する", "問い合わせ先"]) {
    await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  await expect(main.getByText("Open簿記運営が運営しています。")).toBeVisible();
  await expect(main.getByRole("link", { name: /CC BY-SA 4\.0/ })).toHaveAttribute("href", "https://creativecommons.org/licenses/by-sa/4.0/deed.ja");
  await expect(main.getByRole("link", { name: /Apache License 2\.0/ })).toHaveAttribute("href", "https://github.com/openboki/openboki/blob/main/LICENSE");
  await expect(main.getByRole("link", { name: /CONTRIBUTING\.md/ })).toHaveAttribute("href", "https://github.com/openboki/openboki/blob/main/CONTRIBUTING.md");
  await expect(main.getByRole("link", { name: /GitHub Discussions/ }).first()).toHaveAttribute("href", "https://github.com/openboki/openboki/discussions");
});

test("幅390pxで/aboutに横スクロールが出ない", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "このサイトについて" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
