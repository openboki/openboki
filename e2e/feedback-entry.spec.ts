import { expect, test } from "@playwright/test";

// 質問・誤りの報告・提案の窓口はGitHub Discussionsの1本(roadmap.md M2「つなぐ」)
test("フッターからGitHub Discussionsを新しいタブで開ける", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("contentinfo").getByRole("link", { name: /質問・報告・提案/ });
  await expect(link).toHaveAttribute("href", "https://github.com/openboki/openboki/discussions");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("contentinfo").getByText("GitHubアカウントが要ります")).toBeVisible();
});

test("単元のガイドにGitHubへのリンクを置かない", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toBeVisible();
  await expect(guide.locator('a[href*="github.com"]')).toHaveCount(0);
});
