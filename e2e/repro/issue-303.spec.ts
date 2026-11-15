import { expect, test } from "@playwright/test";

// Issue #303: フッターから運営者の情報とライセンスへ辿れなかった

test("フッターから/aboutへ移れ、ライセンス表記とリポジトリへのリンクがある", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("教材はCC BY-SA 4.0、コードはApache 2.0で公開しています。")).toBeVisible();
  const repo = footer.getByRole("link", { name: /^GitHub/ });
  await expect(repo).toHaveAttribute("href", "https://github.com/openboki/openboki");
  await expect(repo).toHaveAttribute("target", "_blank");

  await footer.getByRole("link", { name: "このサイトについて" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1, name: "このサイトについて" })).toBeVisible();
});

test("幅390pxでフッターが折り返しても横スクロールが出ず、リンクが重ならない", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "このサイトについて" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const boxes = await footer.locator("a, p").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  for (const [i, a] of boxes.entries()) {
    for (const b of boxes.slice(i + 1)) {
      const overlaps = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      expect(overlaps).toBe(false);
    }
  }
});
