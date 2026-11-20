import { test, expect } from "@playwright/test";

// 分野は色だけでなく点の形でも見分けられる。凡例の印は分野ごとに違う形で、一覧の見出しの印と同じ形
test("概念マップの凡例は分野ごとに違う形の印を持ち、一覧の見出しと形がそろう", async ({ page }) => {
  await page.goto("/map");
  const legend = await page
    .getByRole("list", { name: "分野の色と形" })
    .getByRole("listitem")
    .evaluateAll((items) => items.map((li) => ({ title: li.textContent!.trim(), shape: li.querySelector("svg")?.innerHTML ?? "" })));
  expect(legend.length).toBe(6);
  expect(new Set(legend.map((l) => l.shape)).size).toBe(6);

  const nav = page.getByRole("navigation", { name: "概念の一覧" });
  for (const { title, shape } of legend) {
    const heading = nav.getByRole("heading", { level: 3, name: title });
    expect(await heading.locator("svg").evaluate((svg) => svg.innerHTML)).toBe(shape);
  }
});
