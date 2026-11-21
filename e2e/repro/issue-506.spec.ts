import { expect, test } from "@playwright/test";
import { ILLUSTRATION_NAMES } from "../../src/lib/illustrations";

// Issue #506で足した5つの大きさと使用箇所は、絵を見比べる邪魔になったので外した。全部の絵を同じ大きさで並べる

test("イラスト一覧は全部の絵を160pxで並べ、日本語の名前を添える", async ({ page }) => {
  await page.goto("/illustrations");
  const tiles = page.getByRole("main").getByRole("listitem");
  const widths = await tiles.locator("svg").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(widths).toEqual(ILLUSTRATION_NAMES.map(() => 160));

  const bakery = tiles.filter({ has: page.locator("code", { hasText: /^bakery$/ }) });
  await expect(bakery).toContainText("焼き菓子店");
  await expect(bakery.getByRole("link")).toHaveCount(0);
});
