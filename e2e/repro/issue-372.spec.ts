import { devices, expect, test, type Page } from "@playwright/test";

// 概念マップで、選んだ概念と隣の概念のラベルが重ならない
type Label = { text: string; x: number; y: number; w: number; h: number };

// canvasのfillTextを横取りし、直前のフレームのラベルを画面座標の矩形で集める
async function captureLabels(page: Page) {
  await page.addInitScript(() => {
    const orig = CanvasRenderingContext2D.prototype.fillText;
    const w = window as unknown as { __labels: Label[] };
    w.__labels = [];
    let frame: Label[] = [];
    CanvasRenderingContext2D.prototype.fillText = function (text: string, x: number, y: number, ...rest: [number?]) {
      const m = this.getTransform();
      const width = this.measureText(text).width;
      const size = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] ?? "11");
      const dpr = window.devicePixelRatio;
      const sw = (width * m.a) / dpr;
      frame.push({ text, x: (m.a * x + m.e) / dpr - sw / 2, y: (m.d * y + m.f) / dpr, w: sw, h: (size * m.d) / dpr });
      return orig.call(this, text, x, y, ...rest);
    };
    const tick = () => {
      if (frame.length) w.__labels = frame;
      frame = [];
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function settledLabels(page: Page, path: string) {
  await page.goto(path);
  await page.waitForTimeout(4000);
  return page.evaluate(() => {
    const labels = (window as unknown as { __labels: Label[] }).__labels;
    const pairs: string[] = [];
    for (let i = 0; i < labels.length; i++)
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) pairs.push(`${a.text}×${b.text}`);
      }
    return { texts: labels.map((l) => l.text), pairs };
  });
}

test.describe("390px", () => {
  const { defaultBrowserType: _, ...iPhone } = devices["iPhone 13"];
  test.use(iPhone);

  test("概念マップの「仕訳」を選ぶと、図のラベルが重ならず「仕訳」も描かれる", async ({ page }) => {
    await captureLabels(page);
    const { texts, pairs } = await settledLabels(page, "/map?c=journal_entry");
    expect(pairs).toEqual([]);
    expect(texts).toContain("仕訳");
  });
});

test.describe("1280px", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const [id, name] of [
    ["journal_entry", "仕訳"],
    ["depreciation", "減価償却"],
  ]) {
    test(`概念マップの「${name}」を選ぶと、図のラベルが重ならず「${name}」も描かれる`, async ({ page }) => {
      await captureLabels(page);
      const { texts, pairs } = await settledLabels(page, `/map?c=${id}`);
      expect(pairs).toEqual([]);
      expect(texts).toContain(name);
    });
  }
});
