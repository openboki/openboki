import { expect, test } from "@playwright/test";

// Issue #506: イラスト一覧は76pxと拡大しか並べず、どの絵がどこで使われているかも分からなかった

test("イラスト一覧は絵ごとに5つの大きさと使用箇所を出し、使用箇所から単元が開く", async ({ page }) => {
  await page.goto("/illustrations");
  const bakery = page.getByRole("main").getByRole("listitem").filter({ has: page.locator("code", { hasText: /^bakery$/ }) });
  const widths = await bakery.locator("svg").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(widths).toEqual([48, 64, 76, 96, 160]);

  const use = bakery.getByRole("link", { name: "貸したお金、借りたお金" });
  await expect(use).toHaveAttribute("href", "/units/receivables-and-payables/loans");
  await use.click();
  await expect(page).toHaveURL(/\/units\/receivables-and-payables\/loans$/);
});
