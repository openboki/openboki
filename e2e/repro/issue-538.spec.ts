import { devices, expect, test, type CDPSession, type Page } from "@playwright/test";

// Issue #538: スマホの概念マップで、図の上の1本指の縦スワイプが図のパンに取られ、ページがスクロールしなかった

const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];
test.use({ ...iphone });

const detail = (page: Page) => page.getByRole("article", { name: "概念の説明" });
const graph = (page: Page) => page.locator("[data-ready] canvas");

// page.touchscreenやJSで作ったTouchEventではネイティブのスクロールが起きないので、CDPで実タッチと同じ経路から送る
async function swipe(page: Page, cdp: CDPSession, x: number, y0: number, y1: number) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 12 }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(800);
}

test("390pxの概念マップで図の上を縦にスワイプすると、ページがスクロールする", async ({ page, context }) => {
  await page.goto("/map");
  await expect(graph(page)).toBeVisible({ timeout: 30000 });
  const cdp = await context.newCDPSession(page);
  const box = (await graph(page).boundingBox())!;
  await swipe(page, cdp, box.x + box.width / 2, box.y + box.height - 30, box.y + 30);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
});

test("スマホでも図の点をタップすると、その概念の説明が開く", async ({ page, context }) => {
  await page.goto("/map");
  await expect(graph(page)).toBeVisible({ timeout: 30000 });
  const cdp = await context.newCDPSession(page);
  const box = (await graph(page).boundingBox())!;
  const before = await detail(page).getByRole("heading", { level: 2 }).textContent();
  // 点の位置は力学モデルが決めるので、ポインタを格子状に動かして手の形になった場所を探し、そこをタップする
  let tapped = false;
  for (let y = box.y + box.height * 0.2; y < box.y + box.height * 0.8 && !tapped; y += 6) {
    for (let x = box.x + box.width * 0.1; x < box.x + box.width * 0.9 && !tapped; x += 6) {
      await page.mouse.move(x, y);
      const cursor = await page
        .locator("[data-ready]")
        .evaluate(
          (el) =>
            new Promise<string>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve((el as HTMLElement).style.cursor))),
            ),
        );
      if (cursor !== "pointer") continue;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      tapped = await expect(detail(page).getByRole("heading", { level: 2 }))
        .not.toHaveText(before!, { timeout: 2000 })
        .then(() => true, () => false);
    }
  }
  expect(tapped).toBe(true);
});
