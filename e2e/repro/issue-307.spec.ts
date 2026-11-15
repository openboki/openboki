import { devices, expect, test, type Page } from "@playwright/test";

// Issue #307: 390pxでフッターのリンクが高さ16px・段の間4pxで折り返し、上下のリンクを押し分けにくかった
const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];

async function footerLinkBoxes(page: Page) {
  return page.locator("footer a").evaluateAll((els) =>
    els.map((e) => {
      const b = e.getBoundingClientRect();
      return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w: b.width, h: b.height };
    }),
  );
}

test.describe("390px", () => {
  test.use(iPhone);

  test("フッターのリンクは押し分けられる大きさと間隔がある", async ({ page }) => {
    await page.goto("/");
    const boxes = await footerLinkBoxes(page);
    expect(boxes.length).toBeGreaterThan(1);
    for (const [i, a] of boxes.entries()) {
      if (a.w >= 24 && a.h >= 24) continue;
      // 24px未満なら、横位置が重なる別の段のリンクと上下の中心が24px以上離れていること
      for (const [j, b] of boxes.entries()) {
        if (i === j || Math.abs(a.cy - b.cy) < 1) continue;
        const overlapX = Math.abs(a.cx - b.cx) < (a.w + b.w) / 2;
        if (overlapX) expect(Math.abs(a.cy - b.cy)).toBeGreaterThanOrEqual(24);
      }
    }
  });
});

test("1280pxではフッターのリンクが1行に並ぶ", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const boxes = await footerLinkBoxes(page);
  expect(boxes.length).toBe(4);
  for (const b of boxes) expect(Math.abs(b.cy - boxes[0].cy)).toBeLessThan(1);
});
