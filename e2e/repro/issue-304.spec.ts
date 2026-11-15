import { expect, test } from "@playwright/test";

// Issue #304: /privacyの運営者名が未定のままで、問い合わせ先がフッターの窓口(GitHub Discussions)と食い違っていた

test("/privacyの運営者はOpen簿記運営で、問い合わせ先はGitHub Discussions", async ({ page }) => {
  await page.goto("/privacy");
  const main = page.getByRole("main");
  await expect(main.getByText("Open簿記運営(以下「運営者」)が")).toBeVisible();
  await expect(main.getByRole("link", { name: /GitHub Discussions/ })).toHaveAttribute("href", "https://github.com/openboki/openboki/discussions");
  await expect(main.getByRole("link", { name: /GitHub Issues/ })).toHaveCount(0);
  await expect(main.getByText("個人を特定できる情報は書かないでください")).toBeVisible();
  await expect(main.getByText("制定: 2026年11月13日")).toBeVisible();
  await expect(main.getByText(/^改定: 2026年11月15日/)).toBeVisible();
});
